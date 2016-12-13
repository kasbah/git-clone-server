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
    it("starts a clone", done => {
        const id  = 'id'
        const url = 'url'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value:url})
        expect(state1.get('sessions').get(id).get('repos').get(url).get('status')).to.equal('start')
        return done()
    })
    it("transitions from 'start' to 'cloning'", done => {
        const id  = 'id'
        const url = 'url'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value:url})
        const state2 = mainReducer(state1, {type: 'setRepoStatus', id, value:{url, status:'cloning', slug:'slug'}})
        expect(state2.get('sessions').get(id).get('repos').get(url).get('status')).to.equal('cloning')
        return done()
    })
    it("doesn't transition from 'cloning' to 'start'", done => {
        const id  = 'id'
        const url = 'url'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value:url})
        const state2 = mainReducer(state1, {type: 'setRepoStatus', id, value:{url, status:'cloning', slug:'slug'}})
        const state3 = mainReducer(state2, {type: 'startClone', id, value:url})
        expect(state3.get('sessions').get(id).get('repos').get(url).get('status')).to.equal('cloning')
        return done()
    })
    it("doesn't transition from 'clone_done' to 'start'", done => {
        const id  = 'id'
        const url = 'url'
        const state1 = mainReducer(initial_state, {type: 'startClone', id, value:url})
        const state2 = mainReducer(state1, {type: 'setRepoStatus', id, value:{url, status:'cloning', slug:'slug'}})
        const state3 = mainReducer(state2, {type: 'setRepoStatus', id, value:{url, status:'clone_done'}})
        const state4 = mainReducer(state3, {type: 'startClone', id, value:url})
        expect(state4.get('sessions').get(id).get('repos').get(url).get('status')).to.equal('clone_done')
        return done()
    })
    it("doesn't transition from 'failed' to 'clone_done'", done => {
        const id  = 'id'
        const url = 'url'
        let state = mainReducer(initial_state, {type: 'startClone', id, value:url})
        state = mainReducer(state, {type: 'setRepoStatus', id, value:{url, status:'cloning', slug:'slug'}})
        state = mainReducer(state, {type: 'setRepoStatus', id, value:{url, status:'failed'}})
        state = mainReducer(state, {type: 'setRepoStatus', id, value:{url, status:'clone_done'}})
        expect(state.get('sessions').get(id).get('repos').get(url).get('status')).to.equal('failed')
        return done()
    })
    it("doesn't transition from 'failed' to 'cloning'", done => {
        const id  = 'id'
        const url = 'url'
        let state = mainReducer(initial_state, {type: 'startClone', id, value:url})
        state = mainReducer(state, {type: 'setRepoStatus', id, value:{url, status:'cloning', slug:'slug'}})
        state = mainReducer(state, {type: 'setRepoStatus', id, value:{url, status:'failed'}})
        state = mainReducer(state, {type: 'setRepoStatus', id, value:{url, status:'cloning'}})
        expect(state.get('sessions').get(id).get('repos').get(url).get('status')).to.equal('failed')
        return done()
    })
})
