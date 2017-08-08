const message = 
`
There seems to be an error with the application.
Please try to reload the page.
You can use the debug link in the footer when requesting support.
`

function alertDriver(stream$) {
  stream$.addListener({
    next: ev => {
        window.alert(message)
        console.error(ev)
    },
    error: ev => {
        window.alert(message)
        console.error(ev)
    },
    complete: () => {}
  })
}

export { alertDriver }