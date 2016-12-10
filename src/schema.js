const graphqlTools = require('graphql-tools')
const isGitUrl     = require('is-git-url')

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
        sessionId : String!
    }

    type Mutation {
        addRepo(url : String) : Result
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
       sessionId({session}) {
           return session.id
       }
   },
   Mutation: {
       addRepo({session}, {url}) {
           if (! isGitUrl(url)) {
               return {message: 'Invalid git URL'}
           }
           return {folder: repoToFolder(url), progress: 0}
       },
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

function repoToFolder(repoURL)  {
    let folder = repoURL.replace(/^http:\/\//,'')
    folder = folder.replace(/^https:\/\//,'')
    folder = folder.replace(/^git:\/\//,'')
    folder = folder.replace(/^.+?@/,'')
    return folder.replace(/:/,'/')
}

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolverMap,
})
