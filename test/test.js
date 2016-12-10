const {expect} = require('chai')
const {reducer, initial_state} = require('../lib/reducer')

describe('reducer', () => {
    it('should add a new session', (done) => {
        const state = reducer(initial_state, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state.sessions.size).to.equal(1)
        return done()
    })
    it('should not add session twice', (done) => {
        const state1 = reducer(initial_state, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        const state2 = reducer(state1, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        expect(state2.sessions.size).to.equal(1)
        return done()
    })
    it('should add another session', (done) => {
        const state1 = reducer(initial_state, {type: 'startClone', session_id: 'id1', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        const state2 = reducer(state1, {type: 'startClone', session_id: 'id2', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        expect(state2.sessions.size).to.equal(2)
        return done()
    })
    it('should add a repo with start state', (done) => {
        const session_id = 'id'
        const value = 'value'
        const state = reducer(initial_state, {type: 'startClone', session_id, value})
        expect(state.sessions.get(session_id).repos.get(value)).to.equal('start')
        return done()
    })
})
