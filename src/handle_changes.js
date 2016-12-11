//@flow
const cp = require('child_process')
const crypto = require('crypto')

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
            const folder = hash(url)
            const pid = cp.exec(`git clone --depth=1 ${url} ./tmp/${id}/${folder}`)
            pid.on('exit', processStatus => {
                if (processStatus !== 0) {
                    actions.reportCloneStatus(id, {url, status:'invalid'})
                } else {
                    actions.reportCloneStatus(id, {url, status:'done'})
                }
            })
            actions.reportCloneStatus(id, {url, status:'in_progress'})
        }
    })
}

function hash(str) {
    return crypto.createHash('sha1').update(str).digest('hex')
}
