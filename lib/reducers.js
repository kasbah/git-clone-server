//     
const Immutable = require('immutable')
const redux = require('redux')

//type State = {
//    sessions : Immutable.Map<string, Session>
//}
                                     

const initial_state         = Immutable.Map({
    sessions: Immutable.Map()
})

               
                     
                       
                 
 


                
                                            
 

                                                  

const reducers = {
    startClone(session          , repo_folder         ) {
        const repo = session.repos.get(repo_folder)
        if (repo == null || repo == 'done') {
            const repos = session.repos.set(repo_folder, 'start')
            return Object.assign(session, {repos})
        }
        return session
    }
}

                                        


function mainReducer(state        , action        )        {
    if (state == null) {
        state = initial_state
    }
    if (action.type == '@@redux/INIT') {
        return state
    }
    let session            = state.get('sessions').get(action.session_id)
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
