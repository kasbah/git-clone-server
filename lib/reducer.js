//     
const Immutable = require('immutable')
const redux = require('redux')

              
                                             
 

const initial_state         = {
    sessions: Immutable.Map()
}

               
                 
                       
                 
 


                
                                            
 

                                                  

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


function reducer(state       , action        )        {
    if (state == null) {
        state = initial_state
    }
    let session            = state.sessions.get(action.session_id)
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


module.exports = {reducers, reducer, initial_state}
