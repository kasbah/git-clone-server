const {expect} = require('chai')
const actions = require('../lib/actions')

describe('reducer', () => {
    it('should add a new session', (done) => {
        const state = actions.reducer(actions.initial, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state.sessions.size).to.equal(1)
        return done()
    })
    it('should not add session twice', (done) => {
        const state1 = actions.reducer(actions.initial, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        const state2 = actions.reducer(state1, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        expect(state2.sessions.size).to.equal(1)
        return done()
    })
    it('should add another session', (done) => {
        const state1 = actions.reducer(actions.initial, {type: 'startClone', session_id: 'id1', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        const state2 = actions.reducer(state1, {type: 'startClone', session_id: 'id2', value: 'value'})
        expect(state1.sessions.size).to.equal(1)
        expect(state2.sessions.size).to.equal(2)
        return done()
    })
})
