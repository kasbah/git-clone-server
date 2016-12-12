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
    it('should respond to empty POST with an error type', (done) =>  {
        request(app)
            .post('/')
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    it('should respond to invalid POST with an error type', (done) =>  {
        request(app)
            .post('/')
            .send({ name: 'Manny', species: 'cat' })
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    it('should respond to valid request', (done) =>  {
        request(app)
            .post('/')
            .send({url:'https://github.com/monostable/kitnic'})
            .expect(200)
            .end((err, res) => {
                expect(res.body.data).to.be.ok
                done()
            })
    })
})
