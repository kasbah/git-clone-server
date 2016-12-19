//     
const config = require('../config')
const {store, actions} = require('./actions')
const app = require('./app')(config, store, actions)

const port = process.env.PORT || config.PORT || 4000
app.listen(port)
console.log(`Running a Express server at localhost:${port}`)
