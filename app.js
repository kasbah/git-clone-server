'use strict'
const bodyParser = require('body-parser')
const cp         = require('child_process')
const express    = require('express')
const fs         = require('fs')
const isGitUrl   = require('is-git-url')
const path       = require('path')
const redux      = require('redux')
const session    = require('express-session')
const FileStore = require('session-file-store')(session);

const maxAge = 5 * 3600
const app = express()
const sessionStore = new FileStore()


app.use(session({
    store: sessionStore,
    secret: 'keyboard cat',
    cookie: { maxAge: maxAge }
}))

function reducer (state = {}, action) {
    console.log(action)
    switch(action.type) {
        case 'ADD_SESSION':
            state[action.id] = {paths:action.value, cloneProgress: 0}
            let interval = setInterval(() => {
                sessionStore.get(action.id, (err, s) => {
                    if (err == null && s == null) {
                        clearInterval(interval)
                        store.dispatch({type: 'REMOVE_SESSION', id: action.id})
                    }
                })
            }, maxAge)
            return state
        case 'UPDATE_CLONE_PROGRESS':
            if (state[action.id] != null) {
                state[action.id].cloneProgress = action.value
            }
            return state
        case 'REMOVE_SESSION':
            cp.exec(`rm -rf tmp/${action.id}`)
            delete state[action.id]
    }
}

let store = redux.createStore(reducer)

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
        store.dispatch({type:'ADD_SESSION', id:req.session.id, url:req.body.url})
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
            else if (code === null) {
                action.value = 'timed out'
            }
            else {
                action.value = `failed ${code}`
            }
            store.dispatch(action)
        })
        setTimeout(() => {
            pid.kill()
        }, 3 * 3600)
    }
    res.redirect('/progress')
    //res.setHeader('Content-Type', 'application/json')
    //res.end(JSON.stringify(isGit))
})

app.get('/progress', function(req, res, next) {
    const state = store.getState()
    res.setHeader('Content-Type', 'application/json')
    req.session.touch()
    if (state == null || state[req.session.id] == null)  {
        return res.end("invalid session")
    }
    else {
        return res.end(JSON.stringify({id:req.session.id, progress: state[req.session.id].cloneProgress}))
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

