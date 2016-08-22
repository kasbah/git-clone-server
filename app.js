'use strict'
var express = require('express')
var session = require('express-session')
var git     = require('nodegit')
var fs      = require('fs')

var app = express()

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.get('/', function(req, res, next) {
    var sess = req.session
    const path = repoToFolder(req.query.url)
    if (fs.existsSync(path)) {
        //git fetch origin && git reset --hard origin/master
        git.Repository.open(path).then((repo) => {
            repo.getCurrentBranch().then((branch) => {
                repo.fetch('origin').then(() => {
                    git.Branch.upstream(branch).then((upstream) => {
                        const p = git.Reset.reset(repo, upstream, git.Reset.TYPE.HARD)
                        console.log(p)
                        p.catch((err) => console.log('error', error))
                        p.then((success) => console.log('ret', success))
                    })
                })
            })
        })
    }
    else {
        git.Clone(req.query.url, path).catch((err) => {
            console.error(err)
        }).then((repo) => {
            console.log(repo)
        })
    }
    if (sess.url) {
      res.setHeader('Content-Type', 'text/html')
      res.write('<p>url: ' + sess.url + '</p>')
      res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
      res.end()
    } else {
      sess.url = req.
      res.end('welcome to the session demo. refresh!')
    }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

function repoToFolder(repo)  {
    var folder = repo.replace(/^http:\/\//,'');
    folder = folder.replace(/^https:\/\//,'');
    folder = folder.replace(/^git:\/\//,'');
    folder = folder.replace(/^.+?@/,'');
    folder = folder.replace(/:/,'/');
    return `/tmp/${folder}`
}
