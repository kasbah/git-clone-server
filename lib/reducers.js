//     
const Immutable = require('immutable')
const redux = require('redux')
const crypto = require('crypto')

//type State = {
//    sessions : Immutable.Map<string, Session>
//}
                                       

const initial_state         = Immutable.Map({
    sessions: Immutable.Map()
})

               
                     
               
              
 

                                                                             

//type ActionValue = string
//    | {status: 'start',      url: string}
//    | {status: 'cloning',    url: string, slug: string}
//    | {status: 'clone_done', url: string}
//    | {status: 'failed',     url: string}
//    | {status: 'done',       url: string, files: [string]}
//    | {timeout: mixed}
                      


//type Session = {
//    repos: Immutable.Map<string, RepoStatus>
//}
                                         

                                      

                                                                        

function allowedNext(status            )                             {
    switch(status) {
        case 'start':
            return Immutable.List.of('cloning', 'failed')
        case 'cloning':
            return Immutable.List.of('clone_done', 'failed')
        case 'clone_done':
            return Immutable.List.of('done', 'failed')
        case 'done':
            return Immutable.List.of('start')
        case 'failed':
            return Immutable.List.of('start')
        default:
            return Immutable.List()
    }
}


const sessionReducers = {
    startClone(session         , url        ) {
        const repo = session.get('repos').get(url)
        if (repo == null || allowedNext(repo.get('status')).contains('start')) {
            const repos = session.get('repos').set(url, Immutable.Map({status: 'start'}))
            return session.set('repos', repos)
        }
        return session
    },
    setRepoStatus(session         , {url, status:nextStatus, slug, files}                                                                    ) {
        const repos = session.get('repos')
        let repo = repos.get(url)
        const currentStatus = repo.get('status')
        if (repo == null || !allowedNext(currentStatus).contains(nextStatus)) {
            return session
        }
        repo = repo.set('status', nextStatus)
        if (slug != null) {
            repo = repo.set('slug', slug)
        }
        if (files != null) {
            repo = repo.set('files', files)
        }
        return session.set('repos', repos.set(url, repo))
    },
    setTimeout(session         , {timeout}                  )          {
        return session.set('timeout', timeout)
    }

}

const stateReducers = {
    removeSession(state       , id        )        {
        const sessions = state.get('sessions').delete(id)
        return state.set('sessions', sessions)
    }
}


function reduceSessions(sessions                                , action        ) {
    if (action.id == null) {
        return sessions
    }
    let session = sessions.get(action.id)
    if (session == null) {
        session = Immutable.Map({
            repos: Immutable.Map()
        })
    }
    session = Object.keys(sessionReducers).reduce((session, name) => {
        if (name === action.type) {
            return sessionReducers[name](session, action.value)
        }
        return session
    }, session)
    return sessions.set(action.id, session)
}

function reduceState(state       , action        ) {
    state = Object.keys(stateReducers).reduce((state, name) => {
        if (name == action.type) {
            return stateReducers[name](state, action.value)
        }
        return state
    }, state)
    return state
}

function mainReducer(state        , action        )        {
    if (state == null) {
        state = initial_state
    }
    const sessions = state.get('sessions')
    state = state.set('sessions', reduceSessions(sessions, action))
    return reduceState(state, action)
}


module.exports = {sessionReducers, stateReducers, mainReducer, initial_state}

                                                 
