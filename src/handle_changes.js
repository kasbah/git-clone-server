//@flow
const cp     = require('child_process')
const crypto = require('crypto')
const fs     = require('fs')
const glob   = require('glob')
const rimraf = require('rimraf')
const {join, relative} = require('path')

const {SESSION_DIR, MAX_CLONE_DURATION} = require('./config')
const {store, actions} = require('./actions')


let prev_state = store.getState()
store.subscribe(handleChanges)

function handleChanges() {
    const state = store.getState()
    if (! state.equals(prev_state)) {
        const sessions = state.get('sessions')
        const previous_sessions = prev_state.get('sessions')
        sessions.forEach((session, id) =>  {
            if (! session.equals(previous_sessions.get(id))) {
                handleSessionChanges(session, id)
            }
        })
        removeUnusedFiles(sessions)
    }
    prev_state = state
}

function removeUnusedFiles(sessions) {
    const keys = sessions.keySeq()
    glob(join(SESSION_DIR, '*'), (err, files) => {
         if (err)  {
             return console.error('glob', err)
         }
         const relativeToSession = relative.bind(null, SESSION_DIR)
         const folder_ids = files.map(relativeToSession)
         folder_ids.forEach(id => {
             if (! keys.contains(id)) {
                 removeDir(join(SESSION_DIR, id))
             }
             else {
                 const session = sessions.get(id)
                 const repos = session.get('repos')
                 repos.forEach((repo, slug) => {
                     if (repo.get('status') === 'failed') {
                         removeDir(join(SESSION_DIR, id, slug))
                     }
                 })
             }
         })
    })
}

function removeDir(p) {
     rimraf(p, {disableGlob: true}, (err) => {
         if (err) {
             console.error('rimraf', err)
         }
     })
}

function handleSessionChanges(session, id) {
    session.get('repos').forEach((repo, url) => {
        const status = repo.get('status')
        if (status === 'start') {
            return startClone(id, url)
        }
        else if (status === 'clone_done') {
            const slug = repo.get('slug')
            return getFiles(id, url, slug)
        }
    })
}

function getFiles(id: string, url: string, slug) {
    if (slug == null) {
        console.error('no slug when trying to list files')
        return actions.setRepoStatus(id, {url, status: 'failed'})
    }
    const folder = toFolder(id, slug)
    const options = {dot: true, nodir: true, ignore: join(folder, '.git/**/*')}
    return glob(join(folder, '**/*'), options, (err, filepaths) => {
        if (err) {
            console.error('glob', err)
            return actions.setRepoStatus(id, {url, status: 'failed'})
        }
        const files = filepaths.map(relative.bind(null, join(SESSION_DIR, id)))
        return actions.setRepoStatus(id, {url, status: 'done', files})
    })
}

function startClone(id: string, url: string) {
    const slug = hash(url)
    const folder = toFolder(id, slug)
    return fs.exists(folder, exists => {
        const child = exists ? fetch(id, url, slug) : clone(id, url, slug)
        actions.setRepoStatus(id, {url, status:'cloning', slug})
        const timeout = setTimeout(() => {
            console.warn(`clone timed out on ${url}`)
            child.kill()
        }, MAX_CLONE_DURATION)
        child.on('exit', processStatus => {
            const status = processStatus === 0 ? 'clone_done' : 'failed'
            clearTimeout(timeout)
            actions.setRepoStatus(id, {url, status})
        })
    })
}

function fetch(id, url, slug) {
    const folder = toFolder(id, slug)
    return cp.exec(`cd ${folder} && git fetch && git reset --hard origin/HEAD`)
}

function clone(id, url, slug) {
    const folder = toFolder(id, slug)
    return cp.exec(`git clone --depth=1 ${url} ${folder}`)
}

function reportStatus(id, url, processStatus) {
    if (processStatus !== 0) {
        console.warn('git clone/fetch failed')
        actions.setRepoStatus(id, {url, status:'failed'})
    }
    else {
        actions.setRepoStatus(id, {url, status:'clone_done'})
    }
}

function toFolder(id, slug)  {
    return join(SESSION_DIR, id, slug)
}

function hash(str) {
    return crypto.createHash('sha1').update(str).digest('hex').slice(0, 7)
}
