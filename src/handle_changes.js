//@flow
const cp = require('child_process')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

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
    const folder = urlToFolder(id, url)
    return fs.exists(folder, exists => {
        if (exists) {
            return pull(id, url, folder)
        } else {
            return clone(id, url, folder)
        }
    })
}

function pull(id, url, folder) {
    cp.exec(`cd ${folder} && git pull`)
        .on('exit', reportStatus.bind(null, id, url))
    return actions.reportCloneStatus(id, {url, status:'in_progress'})
}

function clone(id, url, folder) {
    cp.exec(`git clone --depth=1 ${url} ${folder}`)
        .on('exit', reportStatus.bind(null, id, url))
    return actions.reportCloneStatus(id, {url, status:'in_progress'})
}

function reportStatus(id, url, processStatus) {
    if (processStatus !== 0) {
        actions.reportCloneStatus(id, {url, status:'invalid'})
    } else {
        actions.reportCloneStatus(id, {url, status:'done'})
    }
}

function urlToFolder(id, url) {
    return path.join('./tmp', id, hash(url))
}

function hash(str) {
    return crypto.createHash('sha1').update(str).digest('hex')
}
