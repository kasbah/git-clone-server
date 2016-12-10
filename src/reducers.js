//@flow
const Immutable = require('immutable')
const redux = require('redux')

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
    value: string
}


type Session = {
    repos: Immutable.Map<string, RepoStatus>
}

type RepoStatus = 'start' | 'in_progress' | 'done'

const sessionReducers = {
    startClone(session : Session, repo_folder : string) {
        const repo = session.repos.get(repo_folder)
        if (repo == null || repo === 'done') {
            const repos = session.repos.set(repo_folder, 'start')
            return Object.assign(session, {repos})
        }
        return session
    }
}

const stateReducers = {
    removeSession(state : State, session_id : string) {
        const sessions = state.get('sessions').delete(session_id)
        return state.set('sessions', sessions)
    }
}

type ActionType = $Keys<typeof sessionReducers> | $Keys<typeof stateReducers>

function reduceSessions(sessions: Immutable.Map<string, Session>, action: Action) {
    if (action.session_id == null) {
        return sessions
    }
    let session : ?Session = sessions.get(action.session_id)
    if (session == null) {
        session = {
            repos: Immutable.Map()
        }
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
