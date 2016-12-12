const {expect} = require('chai')
const request = require('supertest')

const app = require('../lib/app')

describe('app' , () => {
    it('responds to GET on index', (done) =>  {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => done())
    })
    it('responds to empty POST with an error type', (done) =>  {
        request(app)
            .post('/')
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    it('responds to invalid POST with an error type', (done) =>  {
        request(app)
            .post('/')
            .send({ name: 'Manny', species: 'cat' })
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    it('responds to valid request with data', (done) =>  {
        request(app)
            .post('/')
            .send({url:'https://github.com/kasbah/test-repo'})
            .expect(200)
            .end((err, res) => {
                expect(res.body.data).to.be.ok
                done()
            })
    })
})
