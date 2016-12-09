//@flow
const Immutable = require('immutable')
const redux = require('redux')

const initial_state = Immutable.Map({
    sessions: Immutable.Map()
})

function reducer(state = initial_state, action) {
    let sessions = state.get('sessions')
    let session = sessions.get(action.session_id)
    if (session == null) {
        session = Immutable.Map({
            repos: Immutable.List()
        })
    }
    session = reduceSession(session, action)
    sessions = sessions.set(action.session_id, session)
    return state.set('sessions', sessions)
}


function reduceSession(session, action) {
    switch(action.type) {
        case 'PREVIEW_LINK':
            return
    }
    return session
}

module.exports = redux.createStore(reducer, initial_state)
