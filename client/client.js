console.log('hey')

var form = document.querySelector('form')
var input = document.querySelector('input')

form.onsubmit = function submitUrl(event) {
    event.preventDefault()
    console.log(input.value)
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.open("POST", "/graphql")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Accept", "application/json")
    xhr.onload = function () {
        if (xhr.response.data.addRepo.message != null) {
            console.log(xhr.response.data.addRepo.message)
        } else {
            console.log(xhr.response.data.addRepo)
        }
    }
    var query = `
        mutation ($url: String!) {
          addRepo(url: $url) {
            ... on Repo {
              status
            }
            ... on UserError {
              message
            }
          }
        }
    `
    xhr.send(JSON.stringify({query: query, variables: {url:input.value}}))
}
