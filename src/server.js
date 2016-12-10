//@flow
const app = require('./app')

require('./handle_changes')

app.listen(4000)
console.log('Running a GraphQL API server at localhost:4000/graphql')
