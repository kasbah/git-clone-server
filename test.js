const {expect} = require('chai')
const state = require('./state')

describe('reducer', () => {
    it('should add a new session', (done) => {
        const s = state.reducer(state.initial, {type: 'START_CLONE', session_id: 'test', value: 'test'})
        expect(s.sessions.size).to.equal(1)
        done()
    })
})
