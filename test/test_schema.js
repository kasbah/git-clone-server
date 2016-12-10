const graphSpec = require('graph-spec')
const schema = require('../lib/schema')


describe('schema', () => {
    it("should respond with user id", () => {
       graphSpec.queryAssert(schema, `
            {sessionId}
        `, {sessionId: ''})
    })
})
