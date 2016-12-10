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

type ActionType = $Keys<typeof sessionReducers>


function mainReducer(state: ?State, action: Action): State {
    if (state == null) {
        state = initial_state
    }
    if (action.session_id == null) {
        return state
    }
    let session : ?Session = state.get('sessions').get(action.session_id)
    if (session == null) {
        session = {
            repos: Immutable.Map()
        }
    }
    session = Object.keys(sessionReducers).reduce((session, name) => {
        return sessionReducers[name](session, action.value)
    }, session)
    const sessions = state.get('sessions').set(action.session_id, session)
    return state.set('sessions', sessions)
}


module.exports = {sessionReducers, mainReducer, initial_state}
