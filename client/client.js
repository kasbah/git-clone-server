console.log('hey')

var form = document.querySelector('form')
var input = document.querySelector('input')

form.onsubmit = function submitUrl(event) {
    event.preventDefault()
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open("POST", "/graphql")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.onload = function () {
        console.log('data returned:', xhr.response)
    }
    xhr.send(JSON.stringify({query: "{ sessionId }"}))
}
