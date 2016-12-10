//@flow
const redux = require('redux')
const {mainReducer, reducers} = require('./reducers')

//creates an actions object that dispatches with method names from `reducers`
function makeActions(store) {
    const actions = {}
    Object.keys(reducers).forEach(name => {
        actions[name] = function actionDispatch(session_id, value) {
            return store.dispatch({type: name, session_id, value})
        }
    })
    return actions
}

const store = redux.createStore(mainReducer)
const actions = makeActions(store)

module.exports = {makeActions, actions, store}
