//     
const redux = require('redux')
const {reducer, reducers} = require('./reducers')

const store = redux.createStore(reducer)

const actions = {}
Object.keys(reducers).forEach(name => {
    actions[name] = function actionDispatch(session_id, value) {
        return store.dispatch({type: name, session_id, value})
    }
})
module.exports = {actions, store}
