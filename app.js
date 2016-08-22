'use strict'
const bodyParser = require('body-parser')
const cp         = require('child_process')
const express    = require('express')
const fs         = require('fs')
const isGitUrl   = require('is-git-url')
const path       = require('path')
const redux      = require('redux')
const session    = require('express-session')

function reducer (state = {}, action) {
    switch(action.type) {
        case 'ADD_SESSION':
            state[action.id] = {cloneProgress: 0}
            return state
        case 'UPDATE_CLONE_PROGRESS':
            state[action.id].cloneProgress = action.value
            return state
    }
}

let store = redux.createStore(reducer)
let app = express()

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
        const path = repoToFolder(req.session.id, req.body.url)
        store.dispatch({type:'ADD_SESSION', id:req.session.id})
        let pid
        if (fs.existsSync(path)) {
            pid = cp.exec('git fetch && git reset --hard origin/HEAD', {cwd:path})
        }
        else {
            pid = cp.exec(`git clone --depth=1 ${req.body.url} ${path}`)
        }
        pid.on('exit', (code) => {
            let action = {type:'UPDATE_CLONE_PROGRESS', id:req.session.id}
            if (code === 0) {
                action.value = 100
            }
            else {
                action.value = 'failed'
            }
            store.dispatch(action)
        })
    }
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(isGit))
})

app.get('/progress', function(req, res, next) {
    const state = store.getState()
    res.setHeader('Content-Type', 'application/json')
    if (state == null || state[req.session.id] == null)  {
        return res.end("invalid session")
    }
    else {
        return res.end(JSON.stringify(state[req.session.id].cloneProgress))
    }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})

function repoToFolder(id, repoURL)  {
    let folder = repoURL.replace(/^http:\/\//,'')
    folder = folder.replace(/^https:\/\//,'')
    folder = folder.replace(/^git:\/\//,'')
    folder = folder.replace(/^.+?@/,'')
    folder = folder.replace(/:/,'/')
    return path.join('tmp', id, folder)
}

