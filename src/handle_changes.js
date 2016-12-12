//@flow
const cp     = require('child_process')
const crypto = require('crypto')
const path   = require('path')
const fs     = require('fs')

const {store, actions} = require('./actions')

import type {RepoStatus} from './reducers'


let prev_state = store.getState()
store.subscribe(handleChanges)

function handleChanges() {
    const state = store.getState()
    if (! state.equals(prev_state)) {
        console.log(state)
        const previous_sessions = prev_state.get('sessions')
        state.get('sessions').forEach((session, id) =>  {
            if (! session.equals(previous_sessions.get(id))) {
                handleSessionChanges(session, id)
            }
        })
    }
    prev_state = state
}

function handleSessionChanges(session, id) {
    session.get('repos').forEach((repo, url) => {
        const status = repo.get('status')
        if (status === 'start') {
            return startClone(id, url)
        }
    })
}

function startClone(id, url) {
    const slug = hash(url)
    const folder = toFolder(id, slug)
    return fs.exists(folder, exists => {
        const process = exists ? pull(id, url, slug) : clone(id, url, slug)
        actions.reportStatus(id, {url, status:'cloning'})
        process.on('exit', reportStatus.bind(null, id, url))
    })
}

function pull(id, url, slug) {
    const folder = toFolder(id, slug)
    return cp.exec(`cd ${folder} && git fetch && git reset --hard origin/HEAD`)
}

function clone(id, url, slug) {
    const folder = toFolder(id, slug)
    return cp.exec(`git clone --depth=1 ${url} ${folder}`)
}

function reportStatus(id, url, processStatus) {
    if (processStatus !== 0) {
        actions.reportStatus(id, {url, status:'failed'})
    } else {
        actions.reportStatus(id, {url, status:'clone_done'})
    }
}

function toFolder(id, slug)  {
    return path.join('./tmp', id, slug)
}

function hash(str) {
    return crypto.createHash('sha1').update(str).digest('hex')
}
