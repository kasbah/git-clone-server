//@flow
const Immutable = require('immutable')
const redux = require('redux')

type State = {
    sessions : Immutable.Map<string, Session>
}

type Action = {
    type: string,
    session_id: string,
    value: any
}

type Session = {
    repos: Immutable.List
}

type Repo = {
    status: RepoStatus
}

type RepoStatus = 'start' | 'in_progress' | 'done'


function reducer(state: State, action: Action): State {
    let session : ?Session = state.sessions.get(action.session_id)
    if (session == null) {
        session = {
            repos: Immutable.List()
        }
    }
    session = reduceSession(session, action)
    const sessions = state.sessions.set(action.session_id, session)
    return { sessions }
}


function reduceSession(session, action) {
    switch(action.type) {
        case 'START_CLONE':
            const repo = session.repos.get(action.value)
            if (repo == null || repo.status == 'done') {
                return {repos: session.repos.push({status: 'start'})}
            }
            return session
    }
    return session
}

