const graphqlTester = require('graphql-tester')
const {expect} = require('chai')

const test = graphqlTester.tester({
  url: 'http://localhost:4000/graphql'
})

describe('api' , () => {
  it('should respond with session id', done => {
    test('{sessionId}').then(response => {
      expect(response.success).to.be.ok
      expect(response.status).to.equal(200)
      expect(response.data.sessionId).to.not.equal('')
      return done()
    })
  })
})
