function clipboardDriver(stream$) {
  stream$.addListener({
    next: message => {

      if (typeof message === 'object') {
        console.log('object received for clipboard, type: ' + message.type)
        navigator.clipboard.write([
          new ClipboardItem({
              [message.type]: message.data
          })
        ]);
      }
      else {
        console.log("text that should be placed in clipboard: " + message)
        navigator.clipboard.writeText(message).then(function() {
            /* clipboard successfully set */
        }, function() {
            /* clipboard write failed */
            console.warn("Writing to clipboard failed")
        });
      }
    },
    error: e => console.error(e),
    complete: () => {}
  })
}

export { clipboardDriver }