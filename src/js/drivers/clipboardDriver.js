function clipboardDriver(stream$) {
  stream$.addListener({
    next: message => {
        // console.log("text that should be placed in clipboard: " + message)
        navigator.clipboard.writeText(message).then(function() {
            /* clipboard successfully set */
        }, function() {
            /* clipboard write failed */
            console.warn("Writing to clipboard failed")
        });
    },
    error: e => console.error(e),
    complete: () => {}
  })
}

export { clipboardDriver }