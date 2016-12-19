const {expect} = require('chai')
const request = require('supertest')

const makeApp = require('../lib/app')

describe('app' , () => {
    it('responds to GET on index', done => {
        const config = require('../config')
        const {store, actions} = require('../lib/actions')
        const app = makeApp(config, store, actions)
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => done())
    })
    //it('responds to empty POST with an error type', done => {
    //    const config = require('../config')
    //    const app = require('../lib/app')(config)
    //    request(app)
    //        .post('/')
    //        .expect(200)
    //        .end((err, res) => {
    //            expect(res.body.error).to.be.ok
    //            done()
    //        })
    //})
    //it('responds to invalid POST with an error type', done => {
    //    const config = require('../config')
    //    const app = require('../lib/app')(config)
    //    request(app)
    //        .post('/')
    //        .send({ name: 'Manny', species: 'cat' })
    //        .expect(200)
    //        .end((err, res) => {
    //            expect(res.body.error).to.be.ok
    //            done()
    //        })
    //})
    it('responds to non existent git repo with error type', done => {
        const config = require('../config') //Object.assign(require('../config'), {MAX_CLONE_DURATION_MS: 30000})
        const {store, actions} = require('../lib/actions')
        const app = require('../lib/app')(config, store, actions)
        request(app)
            .post('/')
            .send({ url: 'https://github.com/kasbah/no-way-this-repo-exists-look-at-the-name-its-way-too-long'})
            .expect(200)
            .end((err, res) => {
                expect(res.body.error).to.be.ok
                done()
            })
    })
    //it('responds to request with test-repo data', done => {
    //    const config = JSON.parse(JSON.stringify(require('../config')))
    //    config.MAX_CLONE_DURATION_MS = 50000
    //    const app = makeApp(config)
    //    const agent = request.agent(app)
    //    let files
    //    agent.post('/')
    //        .send({url:'https://github.com/kasbah/test-repo'})
    //        .expect(200)
    //        .end((err, res) => {
    //            console.log(res.body)
    //            files = res.body.data.files
    //            const contains1 = files.reduce((prev, p) => {
    //                return (prev || /test-file$/.test(p))
    //            }, false)
    //            expect(contains1).to.equal(true)
    //            const contains2 = files.reduce((prev, p) => {
    //                return (prev || /test-dir\/test-file-2$/.test(p))
    //            }, false)
    //            expect(contains2).to.equal(true)
    //            done()
    //        })
    //})
    //it('serves the test-repo files', done => {
    //    const requests = files.map(path => {
    //        return agent.get(path).expect(200)
    //    })
    //    Promise.all(requests).then(() => done()).catch(done)
    //})
    //it("doesn't allow access outside of session data", done => {
    //    const path = '../../../package.json'
    //    agent.get('/files/' + path)
    //        .expect(404)
    //        .end(done)
    //})
})
