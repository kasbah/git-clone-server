//@flow
const Immutable = require('immutable')
const redux = require('redux')

type State = {
    sessions : Immutable.Map<String, Session>
}

const initial : State = {
    sessions: Immutable.Map()
}

type Action = {
    type: ActionType,
    session_id: String,
    value: String
}

type ActionType = 'START_CLONE'

type Session = {
    repos: Immutable.Map<String, RepoStatus>
}

type RepoStatus = 'start' | 'in_progress' | 'done'


function reducer(state: State, action: Action): State {
    let session : ?Session = state.sessions.get(action.session_id)
    if (session == null) {
        session = {
            repos: Immutable.Map()
        }
    }
    session = reduceSession(session, action)
    const sessions = state.sessions.set(action.session_id, session)
    return {sessions}
}


function reduceSession(session: Session, action: Action) {
    switch(action.type) {
        case 'START_CLONE':
            const repo = session.repos.get(action.value)
            if (repo == null || repo == 'done') {
                const repos = session.repos.set(action.value, 'start')
                return Object.assign(session, {repos})
            }
            return session
    }
    return session
}

module.exports = {initial, reducer, reduceSession}
