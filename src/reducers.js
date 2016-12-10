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

const reducers = {
    startClone(session : Session, repo_folder : string) {
        const repo = session.repos.get(repo_folder)
        if (repo == null || repo == 'done') {
            const repos = session.repos.set(repo_folder, 'start')
            return Object.assign(session, {repos})
        }
        return session
    }
}

type ActionType = $Keys<typeof reducers>


function mainReducer(state: ?State, action: Action): State {
    if (state == null) {
        state = initial_state
    }
    if (action.type == '@@redux/INIT') {
        return state
    }
    let session : ?Session = state.get('sessions').get(action.session_id)
    if (session == null) {
        session = {
            repos: Immutable.Map()
        }
    }
    session = Object.keys(reducers).reduce((session, name) => {
        return reducers[name](session, action.value)
    }, session)
    const sessions = state.get('sessions').set(action.session_id, session)
    return Immutable.Map({sessions})
}


module.exports = {reducers, mainReducer, initial_state}
