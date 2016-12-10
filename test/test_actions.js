const {expect} = require('chai')
const redux = require('redux')

const {mainReducer} = require('../lib/reducers')
const {makeActions} = require('../lib/actions')

describe('actions', () => {
    it('should not mutate state', done => {
        const store      = redux.createStore(mainReducer)
        const actions    = makeActions(store)
        const session_id = 'id'
        const value      = 'value'
        const state1     = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        actions.startClone(session_id, value)
        expect(state1.get('sessions').size).to.equal(0)
        done()
    })
    it('should dispatch', done => {
        const store      = redux.createStore(mainReducer)
        const actions    = makeActions(store)
        const session_id = 'id'
        const value      = 'value'
        const state1     = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        actions.startClone(session_id, value)
        const state2 = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        expect(state2.get('sessions').size).to.equal(1)
        done()
    })
    it('should remove session', done => {
        const store      = redux.createStore(mainReducer)
        const actions    = makeActions(store)
        const session_id = 'id'
        const value      = 'value'
        const state1     = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        actions.startClone(session_id, value)
        const state2 = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        expect(state2.get('sessions').size).to.equal(1)
        actions.removeSession(session_id, session_id)
        const state3 = store.getState()
        expect(state2.get('sessions').size).to.equal(1)
        expect(state3.get('sessions').size).to.equal(0)
        done()
    })
})
