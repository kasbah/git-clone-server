# git-clone-server
A microservice to clone git repositories and serve the files for download.
git-clone-server uses node.js and Express.

# API

POST  /

with JSON data: `{"url": <url of git repo> }`

## Example

```
curl -H "Content-Type: application/json" -X POST -d '{"url": "https://github.com/kasbah/test-repo"}' http://localhost:4000
```
Should respond with:

```
{
    "data": {
        "files": [
            "/files/ce28fe0/test-dir/test-file-2",
            "/files/ce28fe0/test-file"
        ]
    }
}
```

The files listed are served at `http://localhost:4000/files/...` for requests that send the session cookie.
Sessions expire an hour after the last request and the files are removed.

# License

MIT
