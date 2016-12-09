const express         = require('express')
const graphqlHTTP     = require('express-graphql')
const { buildSchema } = require('graphql')
const isGitUrl        = require('is-git-url')
const graphqlTools    = require('graphql-tools')

const schema = `
  type Repo {
    progress: Int
    folder: String
  }

  type Query {
    repo(url : String): Repo
  }
`

const resolverMap = {
   Query: {
      repo(url) {
         console.log(url)
         return {folder: '', progress: 0}
      }
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
app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')

function repoToFolder(repoURL)  {
    let folder = repoURL.replace(/^http:\/\//,'')
    folder = folder.replace(/^https:\/\//,'')
    folder = folder.replace(/^git:\/\//,'')
    folder = folder.replace(/^.+?@/,'')
    return folder.replace(/:/,'/')
}
