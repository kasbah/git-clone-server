//     
const config = require('../config')
const app = require('./app')(config)

const port = process.env.PORT || config.PORT || 4000
app.listen(port)
console.log(`Running a Express server at localhost:${port}`)
