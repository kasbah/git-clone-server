'use strict'
const express    = require('express')
const session    = require('express-session')
const fs         = require('fs')
const cp         = require('child_process')
const bodyParser = require('body-parser')
const isGitUrl   = require('is-git-url')
const redux      = require('redux')

function reducer (state = {sessions:{}}, action) {
    switch(action.type) {
        case 'ADD_SESSION':
            state.sessions[action.id] = {cloneProgress: 0}
            return state
        case 'UPDATE_CLONE_PROGRESS':
            state.sessions[action.id].cloneProgress = action.value
            return state
    }
}

let store = redux.createStore(reducer)


var app = express()

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html')
    res.write(
        `<form action="/" method="post">
              <input type="text" name="url"
                    value="https://github.com/kasbah/nomech"><br>
              <input type=submit value=Submit>
        </form>`)
    res.end()
})

app.post('/', function(req, res, next) {
    const isGit = isGitUrl(req.body.url)
    if (isGit) {
        const path = repoToFolder(req.body.url)
        cp.exec(`git clone --depth=1 ${req.body.url} ${path}`)
        store.dispatch({type:'ADD_SESSION', id:req.session.id})
    }
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(isGit))
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})

function repoToFolder(repoURL)  {
    var folder = repoURL.replace(/^http:\/\//,'')
    folder = folder.replace(/^https:\/\//,'')
    folder = folder.replace(/^git:\/\//,'')
    folder = folder.replace(/^.+?@/,'')
    folder = folder.replace(/:/,'/')
    return `tmp/${folder}`
}

