const {expect} = require('chai')
const redux = require('redux')

const {mainReducer} = require('../lib/reducers')
const {makeActions} = require('../lib/actions')

describe('actions', () => {
    it('does not mutate state', done => {
        const store   = redux.createStore(mainReducer)
        const actions = makeActions(store)
        const id      = 'id'
        const value   = 'value'
        const state1  = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        actions.startClone(id, value)
        expect(state1.get('sessions').size).to.equal(0)
        done()
    })
    it('dispatches', done => {
        const store   = redux.createStore(mainReducer)
        const actions = makeActions(store)
        const id      = 'id'
        const value   = 'value'
        const state1  = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        actions.startClone(id, value)
        const state2 = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        expect(state2.get('sessions').size).to.equal(1)
        done()
    })
    it('removes session', done => {
        const store   = redux.createStore(mainReducer)
        const actions = makeActions(store)
        const id      = 'id'
        const value   = 'value'
        const state1  = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        actions.startClone(id, value)
        const state2 = store.getState()
        expect(state1.get('sessions').size).to.equal(0)
        expect(state2.get('sessions').size).to.equal(1)
        actions.removeSession(id)
        const state3 = store.getState()
        expect(state2.get('sessions').size).to.equal(1)
        expect(state3.get('sessions').size).to.equal(0)
        done()
    })
})
