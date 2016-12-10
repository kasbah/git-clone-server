//@flow
const Immutable = require('immutable')
const redux = require('redux')

type State = {
    sessions : Immutable.Map<String, Session>
}

const initial_state : State = {
    sessions: Immutable.Map()
}

type Action = {
    type: ActionType,
    session_id: String,
    value: String
}


type Session = {
    repos: Immutable.Map<String, RepoStatus>
}

type RepoStatus = 'start' | 'in_progress' | 'done'

const reducers = {
    startClone(session : Session, value : String) {
        const repo = session.repos.get(value)
        if (repo == null || repo == 'done') {
            const repos = session.repos.set(value, 'start')
            return Object.assign(session, {repos})
        }
        return session
    }
}

type ActionType = $Keys<typeof reducers>


function mainReducer(state: State, action: Action): State {
    if (state == null) {
        state = initial_state
    }
    let session : ?Session = state.sessions.get(action.session_id)
    if (session == null) {
        session = {
            repos: Immutable.Map()
        }
    }
    session = Object.keys(reducers).reduce((session, name) => {
        return reducers[name](session, action.value)
    }, session)
    const sessions = state.sessions.set(action.session_id, session)
    return {sessions}
}


module.exports = {reducers, mainReducer, initial_state}
