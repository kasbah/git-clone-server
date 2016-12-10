const express         = require('express')
const expressGraphql  = require('express-graphql')
const { buildSchema } = require('graphql')
const isGitUrl        = require('is-git-url')
const graphqlTools    = require('graphql-tools')
const cookieSession   = require('cookie-session')
const shortid         = require('shortid')

const schema = `
   type UserError {
       message : String
   }

    type Repo {
        progress : Int
        folder   : String
    }

    union Result = Repo | UserError

    type Query {
        repo(url : String) : Result
        me : String!
    }

    schema {
        query : Query
    }
`

const resolverMap = {
   Query: {
       repo({session}, {url}) {
           if (! isGitUrl(url)) {
               return {message: 'Invalid git URL'}
           }
           return {folder: repoToFolder(url), progress: 0}
       },
       me({session}) {
           return session.id
       }
   },
   Result: {
      __resolveType(root, context, info){
          if (root.folder != null) {
              return 'Repo'
          } else if (root.message != null) {
              return 'UserError'
          }
          return null;
      },
   },
}

const executableSchema = graphqlTools.makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolverMap,
})

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
       schema: executableSchema,
       graphiql: true,
       rootValue: { session: req.session },
   }
}))


app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')

function repoToFolder(repoURL)  {
    let folder = repoURL.replace(/^http:\/\//,'')
    folder = folder.replace(/^https:\/\//,'')
    folder = folder.replace(/^git:\/\//,'')
    folder = folder.replace(/^.+?@/,'')
    return folder.replace(/:/,'/')
}
