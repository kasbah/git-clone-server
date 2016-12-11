//@flow
const Immutable = require('immutable')
const redux = require('redux')
const crypto = require('crypto')

//type State = {
//    sessions : Immutable.Map<string, Session>
//}
type State = Immutable.Map<string, *>

const initial_state : State = Immutable.Map({
    sessions: Immutable.Map()
})

type Action = {
    type: ActionType,
    session_id: string,
    value: *
}

type ActionValue = string | {url: string, status: RepoStatus}


//type Session = {
//    repos: Immutable.Map<string, RepoStatus>
//}
type Session = Immutable.Map<string, Repo>

type Repo = Immutable.Map<string, *>

type RepoStatus = 'start' | 'in_progress' | 'done' | 'invalid'

type ActionType = $Keys<typeof sessionReducers> | $Keys<typeof stateReducers>

const sessionReducers = {
    startClone(session : Session, url: string) {
        const repo = session.get('repos').get(url)
        if (repo == null || repo.get('status') === 'done' || repo.get('status') === 'invalid') {
            const repos = session.get('repos').set(url, Immutable.Map({status: 'start'}))
            return session.set('repos', repos)
        }
        return session
    },
    reportCloneStatus(session: Session, {url, status:nextStatus}: {url: string, status: RepoStatus}) {
        //only transition into start through startClone
        if (nextStatus === 'start') {
            return session
        }
        const repos = session.get('repos')
        let repo = repos.get(url)
        const currentStatus = repo.get('status')
        repo = repo.set('status', nextStatus)
        return session.set('repos', repos.set(url, repo))
    },

}

const stateReducers = {
    removeSession(state : State, session_id : string) {
        const sessions = state.get('sessions').delete(session_id)
        return state.set('sessions', sessions)
    }
}


function reduceSessions(sessions: Immutable.Map<string, Session>, action: Action) {
    if (action.session_id == null) {
        return sessions
    }
    let session : ?Session = sessions.get(action.session_id)
    if (session == null) {
        session = Immutable.Map({
            repos: Immutable.Map()
        })
    }
    session = Object.keys(sessionReducers).reduce((session, name) => {
        if (name == action.type) {
            return sessionReducers[name](session, action.value)
        }
        return session
    }, session)
    return sessions.set(action.session_id, session)
}

function reduceState(state: State, action: Action) {
    state = Object.keys(stateReducers).reduce((state, name) => {
        if (name == action.type) {
            return stateReducers[name](state, action.value)
        }
        return state
    }, state)
    return state
}

function mainReducer(state: ?State, action: Action): State {
    if (state == null) {
        state = initial_state
    }
    const sessions = state.get('sessions')
    state = state.set('sessions', reduceSessions(sessions, action))
    return reduceState(state, action)
}


module.exports = {sessionReducers, stateReducers, mainReducer, initial_state}

export type {ActionType, ActionValue, RepoStatus}
