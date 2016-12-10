//     
const redux = require('redux')
const {mainReducer, sessionReducers, stateReducers} = require('./reducers')

//creates an actions object that dispatches with method names from `sessionReducers`
//and `stateReducers`
function makeActions(store) {
    const actions = {}
    Object.keys(sessionReducers).forEach(name => {
        actions[name] = function actionDispatch(session_id, value) {
            return store.dispatch({type: name, session_id, value})
        }
    })
    Object.keys(stateReducers).forEach(name => {
        actions[name] = function actionDispatch(session_id, value) {
            return store.dispatch({type: name, session_id, value})
        }
    })
    return actions
}

const store = redux.createStore(mainReducer)
const actions = makeActions(store)

module.exports = {makeActions, actions, store}
