//      weak
const express       = require('express')
const cookieSession = require('cookie-session')
const shortid       = require('shortid')
const fs            = require('fs')
const path          = require('path')
const serveStatic   = require('serve-static')
const bodyParser    = require('body-parser')
const isGitUrl      = require('is-git-url')
const serveIndex    = require('serve-index')
const RateLimit     = require('express-rate-limit')


const {SESSION_DIR} = require('./config')
const {store, actions} = require('./actions')
require('./handle_changes')

const app = express()

const sessionAge = 60 * 60 * 1000 //ms

app.use('/', serveStatic('./client'))

const session = cookieSession({
    name: 'session',
    keys: ['secret squirrel'],
    maxAge: sessionAge
})

app.use(session)

function setRemovalTimeout(id) {
    const state = store.getState()
    const session = state.get('sessions').get(id)
    if (session != null) {
        const timeout = session.get('timeout')
        clearTimeout(timeout)
    }
    const timeout = setTimeout(() => {
        actions.removeSession(id)
    }, sessionAge)
    actions.setTimeout(id, {timeout})
}

// Update a value in the cookie so that the set-cookie will be sent.
// Only changes every minute so that it's not sent with every request.
// XXX this might not work if the application gets more complex
// see https://github.com/expressjs/cookie-session/pull/49#issuecomment-225406044
app.use((req, res, next) =>  {
    req.session.nowInMinutes = Date.now() / 60e3
    setRemovalTimeout(req.session.id)
    return next()
})

//generate an id and attach it to new sessions
app.use((req, res, next) =>  {
    if (req.session.id == null) {
        req.session.id = shortid.generate()
        setRemovalTimeout(req.session.id)
    }
    return next()
})


// only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an
// ELB, custom Nginx setup, etc)
app.enable('trust proxy')

const apiLimiter = new RateLimit({
    windowMs: 60*60*1000, // 60 minutes
    max: 10,
    delayMs: 0
})


const jsonParser = bodyParser.json()
app.post('/', apiLimiter, jsonParser, (req, res) => {
    if (req.session.id == null) {
        return res.send({error: 'Invalid or expired session'})
    }
    if (! isGitUrl(req.body.url)) {
        return res.send({error: 'Invalid git URL'})
    }
    const unsubscribe = store.subscribe(() => {
        const state = store.getState()
        const session = state.get('sessions').get(req.session.id)
        if (session == null) {
            return
        }
        const repo = session.get('repos').get(req.body.url)
        if (repo == null) {
            return
        }
        if (repo.get('status') === 'done') {
            res.send({data: {files: repo.get('files').map(p => '/files/' + p)}})
            return unsubscribe()
        }
        if (repo.get('status') === 'failed') {
            res.send({error: 'clone failed'})
            return unsubscribe()
        }
    })
    actions.startClone(req.session.id, req.body.url)
})

app.use('/files', (req, res, next) => {
    const state = store.getState()
    const session = state.get('sessions').get(req.session.id)
    if (session == null) {
        return res.sendStatus(410)
    }
    const dir = path.join(SESSION_DIR, req.session.id)
    const index = serveIndex(dir, {icons: true})
    return index(req, res, () => {
        return serveStatic(dir)(req, res, next)
    })
})

module.exports = app