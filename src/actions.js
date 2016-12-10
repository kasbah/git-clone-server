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
    type: String,
    session_id: String,
    value: String
}


type Session = {
    repos: Immutable.Map<String, RepoStatus>
}

type RepoStatus = 'start' | 'in_progress' | 'done'

const reducers = {
    startClone(session, value) {
        const repo = session.repos.get(value)
        if (repo == null || repo == 'done') {
            const repos = session.repos.set(value, 'start')
            return Object.assign(session, {repos})
        }
        return session
    }
}


function reducer(state: State, action: Action): State {
    if (state == null) {
        state = initial
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

const store = redux.createStore(reducer)

const actions = {}
Object.keys(reducers).forEach(name => {
    actions[name] = function actionDispatch(session_id, value) {
        return store.dispatch({type: name, session_id, value})
    }
})

module.exports = {initial, reducer}
