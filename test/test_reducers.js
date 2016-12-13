const {expect} = require('chai')
const {mainReducer, initial_state} = require('../lib/reducers')

describe('mainReducer', () => {
    it('adds a new session', done => {
        const state = mainReducer(initial_state, {type: 'startClone', id: 'id', value: 'value'})
        expect(state.get('sessions').size).to.equal(1)
        return done()
    })
    it('does not add a session twice', done => {
        const state1 = mainReducer(initial_state, {type: 'startClone', id: 'id', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(state1, {type: 'startClone', id: 'id', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        expect(state2.get('sessions').size).to.equal(1)
        return done()
    })
    it('adds another session', done => {
        const state1 = mainReducer(initial_state, {type: 'startClone', id: 'id1', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(state1, {type: 'startClone', id: 'id2', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        expect(state2.get('sessions').size).to.equal(2)
        return done()
    })
    it('adds a repo with start state', done => {
        const id    = 'id'
        const value = 'value'
        const state = mainReducer(initial_state, {type: 'startClone', id, value})
        expect(state.get('sessions').get(id).get('repos').get(value).get('status')).to.equal('start')
        return done()
    })
    it('removes a session', done => {
        const id     = 'id'
        const value  = 'value'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(initial_state, {type: 'removeSession', id,  value:id})
        expect(state2.get('sessions').size).to.equal(0)
        return done()
    })
    it('adds a timeout', done => {
        const id     = 'id'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(state1, {type: 'setTimeout', id, value: {timeout: 'mock'}})
        expect(state2.get('sessions').get(id).get('timeout')).to.equal('mock')
        return done()
    })
    it('overwrites a timeout', done => {
        const id     = 'id'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(state1, {type: 'setTimeout', id, value: {timeout: 'mock'}})
        expect(state2.get('sessions').get(id).get('timeout')).to.equal('mock')
        const state3 = mainReducer(state1, {type: 'setTimeout', id, value: {timeout: 'mick'}})
        expect(state3.get('sessions').get(id).get('timeout')).to.equal('mick')
        return done()
    })
})
