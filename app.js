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

const maxAge = 60 * 60 * 1000 //ms
const app = express()
const sessionStore = new FileStore({reapSessions: maxAge / 1000})


app.use(session({
    store: sessionStore,
    secret: 'keyboard cat',
    cookie: { maxAge: maxAge }
}))

function reducer (state = {}, action) {
    console.log(action)
    switch(action.type) {
        case '@@redux/INIT':
            return {}
        case 'ADD_SESSION':
            state[action.id] = {paths:action.value, progress: 0}
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
                state[action.id].progress = action.value
            }
            return state
        case 'REMOVE_SESSION':
            cp.exec(`rm -rf tmp/${action.id}`)
            delete state[action.id]
            return state
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
        const folder = repoToFolder(req.session.id, req.body.url)
        store.dispatch({type:'ADD_SESSION', id:req.session.id, url:req.body.url})
        let pid
        if (fs.existsSync(folder)) {
            pid = cp.exec('git fetch && git reset --hard origin/HEAD', {cwd:folder})
        }
        else {
            pid = cp.exec(`git clone --depth=1 ${req.body.url} ${folder}`)
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
        }, 3 * 60 * 1000)
    }
    res.redirect('/progress')
    //res.setHeader('Content-Type', 'application/json')
    //res.end(JSON.stringify(isGit))
})

app.get('/progress', function(req, res, next) {
    const state = store.getState()
    res.setHeader('Content-Type', 'application/json')
    if (state[req.session.id] == null)  {
        return res.end("invalid session")
    }
    else {
        return res.end(JSON.stringify({
            id:req.session.id,
            progress: state[req.session.id].progress
        }))
    }
})

app.get('/files/:name', function(req, res, next) {
    const state = store.getState()
    if (state[req.session.id] == null)  {
        res.setHeader('Content-Type', 'application/json')
        return res.end("invalid session")
    }
    else if (state[req.session.id].progress !== 100) {
        res.setHeader('Content-Type', 'application/json')
        return res.end(String(state[req.session.id].progress))
    } else {
        switch(req.params.name) {
            case 'top.svg':
                const filePath = 'top.svg'
                const stat = fs.statSync(filePath)
                res.writeHead(200, {
                    'Content-Type': 'image/svg+xml',
                    'Content-Length': stat.size
                });
                return fs.createReadStream('top.svg').pipe(res)
        }
    }
    return res.status(404).end('error');
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

