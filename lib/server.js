#!/usr/bin/env node
//     
const app = require('./app')

const port = process.env.PORT || 4000
app.listen(port)
console.log(`Running a Express server at localhost:${port}`)
