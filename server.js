const express         = require('express')
const graphqlHTTP     = require('express-graphql')
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
    }

    schema {
        query : Query
    }
`

const resolverMap = {
   Query: {
       repo(_, {url}) {
           if (! isGitUrl(url)) {
               return {message: 'Invalid git URL'}
           }
           return {folder: repoToFolder(url), progress: 0}
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
app.use('/graphql', graphqlHTTP({
    schema: executableSchema,
    graphiql: true,
}))
app.use(cookieSession({
    name: 'session',
    keys: ['keep.emsu.pers.ecret'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')

app.get('/*', function(req, res, next) {
    if (! req.session.id) {
        req.session.id = shortid.generate()
    }
    return res.send('hey')
})

function repoToFolder(repoURL)  {
    let folder = repoURL.replace(/^http:\/\//,'')
    folder = folder.replace(/^https:\/\//,'')
    folder = folder.replace(/^git:\/\//,'')
    folder = folder.replace(/^.+?@/,'')
    return folder.replace(/:/,'/')
}
