const express        = require('express')
const expressGraphql = require('express-graphql')
const isGitUrl       = require('is-git-url')
const cookieSession  = require('cookie-session')
const shortid        = require('shortid')

const schema = require('./schema')

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

app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')
