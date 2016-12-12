//@flow weak
const express       = require('express')
const cookieSession = require('cookie-session')
const shortid       = require('shortid')
const fs            = require('fs')
const path          = require('path')
const serveStatic   = require('serve-static')
const bodyParser    = require('body-parser')
const isGitUrl      = require('is-git-url')

const {store, actions} = require('./actions')
require('./handle_changes')

const app = express()

const session = cookieSession({
    name: 'session',
    keys: ['secret squirrel'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
})

app.use(session)


app.all('*', (req, res, next) =>  {
    if (req.session.id == null) {
        req.session.id = shortid.generate()
    }
    return next()
})

app.use('/', serveStatic('./client'))

const jsonParser = bodyParser.json()
app.post('/', jsonParser, (req, res) => {
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
            res.send({data: {files: repo.get('files')}})
            return unsubscribe()
        }
    })
    actions.startClone(req.session.id, req.body.url)
})

app.get('/files/:slug/:file', (req, res) =>  {
    const state = store.getState()
    const session = state.get('sessions').get(req.session.id)
    if (session == null) {
        return res.sendStatus(410)
    }
    const {slug, file} = req.params
    const filePath = path.join('./tmp', req.session.id, slug, file)
    return fs.lstat(filePath, (err, info) => {
        if (err != null) {
            return res.sendStatus(404)
        }
        if (info.isDirectory()) {
            return res.sendStatus(401)
        }
        return res.download(filePath)
    })
})

module.exports = app
