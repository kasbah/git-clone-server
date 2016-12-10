const graphqlTester  = require('graphql-tester')
const expressGraphql = require('express-graphql')
const {expect}       = require('chai')
const cookieSession  = require('cookie-session')
const express        = require('express')
const schema         = require('../lib/schema')
const shortid        = require('shortid')
const createExpressWrapper = require('graphql-tester/lib/main/servers/express.js').create

describe('api' , () => {
  const app = express()
  const session = cookieSession({
      name: 'session',
      keys: ['secret squirrel'],
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
  app.use(session)
  app.all('*', (req, res, next) =>  {
      if (req.session.id == null) {
          req.session.id = shortid.generate()
      }
      return next()
  })

  app.get('/', (req, res) =>  {
      return res.send(req.session.id)
  })
  app.use('/graphql', expressGraphql((req) =>  {
     return {
         schema,
         graphiql: true,
         rootValue: { session: req.session },
     }
  }))
  const test = graphqlTester.tester({
    server: createExpressWrapper(app),
    url: '/graphql'
  })

  it('responds with session id', done => {
    test('{sessionId}').then(response => {
      expect(response.success).to.be.ok
      expect(response.status).to.equal(200)
      expect(response.data.sessionId).to.not.equal('')
      return done()
    })
  })
  it('gives out unique session ids', done => {
    test('{sessionId}').then(response1 => {
      expect(response1.success).to.be.ok
      expect(response1.status).to.equal(200)
      test('{sessionId}').then(response2 => {
        expect(response1.success).to.be.ok
        expect(response1.status).to.equal(200)
        expect(response1.data.sessionId).to.not.equal(response2.data.sessionId)
        return done()
      })
    })
  })
})
