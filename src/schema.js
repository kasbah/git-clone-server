//@flow
const graphqlTools = require('graphql-tools')
const isGitUrl     = require('is-git-url')

const {actions, store} = require('./actions')

import type {RepoStatus} from './reducers'

const schema = `
    enum RepoStatus {
        start
        cloning
        clone_done
        clone_failed
    }

    type UserError {
        message : String
    }

    type Repo {
        status : RepoStatus
        files : [String]
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

function getRepo(session_id, url) {
    const state = store.getState().get('sessions').get(session_id)
    if (state == null) {
        return null
    }
    return state.get('repos').get(url)
}

const resolverMap = {
    Query: {
        repo({session}, {url}): Repo | UserError {
            if (! isGitUrl(url)) {
                return {message: 'Invalid git URL'}
            }
            const repo = getRepo(session.id, url)
            if (repo == null) {
                return {message: 'Invalid session'}
            }
            const status = repo.get('status')
            return {status}
        },
        sessionId({session}) {
            return session.id
        },
    },
    Mutation: {
        addRepo({session}, {url}): Repo | UserError {
            if (! isGitUrl(url)) {
                return {message: 'Invalid git URL'}
            }
            actions.startClone(session.id, url)
            const repo = getRepo(session.id, url)
            if (repo == null) {
                return {message: 'Invalid session'}
            }
            const status = repo.get('status') || 'start'
            return {status}
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

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolverMap,
})
