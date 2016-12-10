//@flow
const graphqlTools = require('graphql-tools')
const isGitUrl     = require('is-git-url')

const {actions, store} = require('./actions')

import type {RepoStatus} from './reducers'

const schema = `
   type UserError {
       message : String
   }

    type Repo {
        status   : String
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

type Repo = {
   status: RepoStatus
}

type UserError = {
   message: string
}

const resolverMap = {
   Query: {
       repo({session}, {url}): Repo | UserError {
           if (! isGitUrl(url)) {
               return {message: 'Invalid git URL'}
           }
           const state = store.getState().get('sessions').get(session.id)
           if (state == null) {
              return {message: 'Invalid session'}
           }
           const status = state.repos.get(url)
           return {status}
       },
       sessionId({session}) {
           return session.id
       }
   },
   Mutation: {
       addRepo({session}, {url}): Repo | UserError {
           if (! isGitUrl(url)) {
               return {message: 'Invalid git URL'}
           }
           actions.startClone(session.id, url)
           return {status: 'start'}
       },
   },
   Result: {
      __resolveType(root, context, info){
          if (root.status != null) {
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
