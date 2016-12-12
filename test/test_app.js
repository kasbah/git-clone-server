const {expect} = require('chai')
const request = require('supertest')

const app = require('../lib/app')

describe('app' , () => {
    it('should respond to GET on index', (done) =>  {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => done())
    })
    it('should respond to POST on index', (done) =>  {
        request(app)
            .post('/')
            .expect(200)
            .end((err, res) => done())
    })
})
