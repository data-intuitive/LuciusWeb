function clipboardDriver(stream$) {
  stream$.addListener({
    next: message => {
        console.log("text that should be placed in clipboard: " + message)
        //message.map(m => console.log(m))
    },
    error: e => console.error(e),
    complete: () => {}
  })
}

export { clipboardDriver }