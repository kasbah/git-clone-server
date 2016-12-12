//@flow
const app = require('./app')

require('./handle_changes')

app.listen(4000)
console.log('Running a Express server at localhost:4000')
