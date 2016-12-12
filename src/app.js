//@flow weak
const express        = require('express')
const cookieSession  = require('cookie-session')
const shortid        = require('shortid')
const fs             = require('fs')
const path           = require('path')
const serveStatic    = require('serve-static')

const {store, actions} = require('./actions')

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
