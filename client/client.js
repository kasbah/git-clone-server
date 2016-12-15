var form = document.querySelector('form')
var input = document.querySelector('input')
var errors = document.querySelector('errors')
var messages = document.querySelector('messages')

form.onsubmit = function submitUrl(event) {
    event.preventDefault()
    console.log('requesting:', input.value)
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open('POST', '/')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.onload = function () {
        if (xhr.response.data) {
            console.log(xhr.response.data.files)
            var file = xhr.response.data.files[0]
            var folder = file.split('/').slice(0, 3).join('/')
            window.location.href = folder
        }
        else {
            messages.innerText = xhr.response.error
            messages.style = 'color:red'
        }
    }
    xhr.send(JSON.stringify({url: input.value}))
    messages.innerText = 'attempting clone...'
    messages.style = 'color:green'
}
