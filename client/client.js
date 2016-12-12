console.log('hey')

var form = document.querySelector('form')
var input = document.querySelector('input')

form.onsubmit = function submitUrl(event) {
    event.preventDefault()
    console.log(input.value)
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open('POST', '/')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.onload = function () {
        console.log(xhr.response)
    }
    xhr.send(JSON.stringify({url: input.value}))
}
