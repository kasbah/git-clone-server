//@flow
const cp            = require('child_process')
const crypto        = require('crypto')
const path          = require('path')
const fs            = require('fs')
const listFilepaths = require('list-filepaths')

const config           = require('./config')
const {store, actions} = require('./actions')

import type {RepoStatus} from './reducers'

let prev_state = store.getState()
store.subscribe(handleChanges)

function handleChanges() {
    const state = store.getState()
    if (! state.equals(prev_state)) {
        const sessions = state.get('sessions')
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
        else if (status === 'clone_done') {
            const slug = repo.get('slug')
            return getFiles(id, url, slug)
        }
    })
}

function getFiles(id: string, url: string, slug) {
    if (slug == null) {
        console.error('no slug when trying to get files')
        return actions.setRepoStatus(id, {url, status: 'failed'})
    }
    const folder = toFolder(id, slug)
    return listFilepaths(folder, {reject: /\.git\//}).then(filepaths => {
        const files = filepaths.map(path.relative.bind(null, path.join(config.session_data, id)))
        return actions.setRepoStatus(id, {url, status: 'done', files})
    }).catch(err => {
        console.error(err)
        return actions.setRepoStatus(id, {url, status: 'failed'})
    })
}

function startClone(id: string, url: string) {
    const slug = hash(url)
    const folder = toFolder(id, slug)
    return fs.exists(folder, exists => {
        const process = exists ? fetch(id, url, slug) : clone(id, url, slug)
        actions.setRepoStatus(id, {url, status:'cloning', slug})
        process.on('exit', reportStatus.bind(null, id, url))
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
    return path.join(config.session_data, id, slug)
}

function hash(str) {
    return crypto.createHash('sha1').update(str).digest('hex').slice(0, 7)
}
