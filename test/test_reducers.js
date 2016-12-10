const {expect} = require('chai')
const {mainReducer, initial_state} = require('../lib/reducers')

describe('mainReducer', () => {
    it('adds a new session', done => {
        const state = mainReducer(initial_state, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state.get('sessions').size).to.equal(1)
        return done()
    })
    it('does not add a session twice', done => {
        const state1 = mainReducer(initial_state, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(state1, {type: 'startClone', session_id: 'id', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        expect(state2.get('sessions').size).to.equal(1)
        return done()
    })
    it('adds another session', done => {
        const state1 = mainReducer(initial_state, {type: 'startClone', session_id: 'id1', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(state1, {type: 'startClone', session_id: 'id2', value: 'value'})
        expect(state1.get('sessions').size).to.equal(1)
        expect(state2.get('sessions').size).to.equal(2)
        return done()
    })
    it('adds a repo with start state', done => {
        const session_id = 'id'
        const value = 'value'
        const state = mainReducer(initial_state, {type: 'startClone', session_id, value})
        expect(state.get('sessions').get(session_id).get('repos').get(value)).to.equal('start')
        return done()
    })
    it('removes a session', done => {
        const session_id = 'id'
        const value = 'value'
        const state1 = mainReducer(initial_state, {type: 'startClone', session_id, value})
        expect(state1.get('sessions').size).to.equal(1)
        const state2 = mainReducer(initial_state, {type: 'removeSession', session_id,  value:session_id})
        expect(state2.get('sessions').size).to.equal(0)
        return done()
    })
})
