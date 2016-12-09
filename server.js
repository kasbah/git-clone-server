var express         = require('express')
var graphqlHTTP     = require('express-graphql')
var { buildSchema } = require('graphql')
const isGitUrl      = require('is-git-url')

var schema = buildSchema(`
  type Query {
    repo(url : String): Repo | Error
  }

  type Repo {
    progress: Int
    folder: String
  }
`)

class Repo {
    constructor(url) {
        this.folder = repoToFolder(url)
        this.progress = 0
    }
}

var root = {
    repo: ({url}) => {
        return new Repo(url)
    },
}

var app = express()
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
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
