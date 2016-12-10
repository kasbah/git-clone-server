//@flow
const {store, actions} = require('./actions')

let prev_state = store.getState()
function handleChanges() {
    const state = store.getState()
    if (! state.equals(prev_state)) {
        const previous_sessions = prev_state.get('sessions')
        state.get('sessions').forEach((session, key) =>  {
            if (! session.equals(previous_sessions.get(key))) {
                handleSessionChanges(session, key)
            }
        })
    }
    prev_state = state
}

function handleSessionChanges(session, id) {
    session.get('repos').forEach((status, url) => {
        if (status === 'start') {
            actions.registerStarted(id, url)
        }
    })
}

store.subscribe(handleChanges)
