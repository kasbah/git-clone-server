const {expect} = require('chai')
const request  = require('supertest')
const path     = require('path')

const app = require('../lib/app')

describe('app' , () => {
    it('responds to GET on index', done => {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => done())
    })
    it('responds to empty POST with an error type', done => {
        request(app)
            .post('/')
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    it('responds to invalid POST with an error type', done => {
        request(app)
            .post('/')
            .send({ name: 'Manny', species: 'cat' })
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    it('responds to non existent git repo with error type', done => {
        request(app)
            .post('/')
            .send({ url: 'https://github.com/kasbah/no-way-this-repo-exists-look-at-the-name-its-way-too-long'})
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    const agent = request.agent(app)
    let files, root
    it('responds to request with test-repo data', done => {
        agent.post('/')
            .send({url:'https://github.com/kasbah/test-repo'})
            .expect(200)
            .end((err, res) => {
                files = res.body.data.files
                root = res.body.data.root
                expect(root).to.be.ok
                const contains1 = files.reduce((prev, p) => {
                    return (prev || /test-file$/.test(p))
                }, false)
                expect(contains1).to.equal(true)
                const contains2 = files.reduce((prev, p) => {
                    return (prev || /test-dir\/test-file-2$/.test(p))
                }, false)
                expect(contains2).to.equal(true)
                done()
            })
    })
    it('serves the test-repo files', done => {
        const requests = files.map(p => {
            return agent.get(path.join(root, p)).expect(200)
        })
        Promise.all(requests).then(() => done()).catch(done)
    })
    it("doesn't allow access outside of session data", done => {
        const path = '../../../package.json'
        agent.get('/files/' + path)
            .expect(404)
            .end(done)
    })
})
