import xs from "xstream"

function clipboardDriver(stream$) {

  const results$ = xs.createWithMemory().startWith({})

  const reportSuccessfull = (functionName, sender) => () => {
    console.log("clipboard " + functionName + " successful")
    results$.shamefullySendNext({
      sender: sender,
      state: "success",
      text: "clipboard " + functionName + " successful"
    })
  }

  const reportFailed = (functionName, sender) => () => {
    console.warn("clipboard " + functionName + " failed")
    results$.shamefullySendNext({
      sender: sender,
      state: "success",
      text: "clipboard " + functionName + " failed"
    })
  }

  stream$.addListener({
    next: message => {
      if (typeof message === 'object') {
        //console.log('object received for clipboard, type: ' + message.type)
        try {
          navigator.clipboard.write([
            new ClipboardItem({
                [message.type]: message.data
            })
          ])
          .then(
            reportSuccessfull("write", message.sender),
            reportFailed("write", message.sender)
          )
        }
        catch{
          // mimic promise call
          reportFailed("write try", message.sender)()
        }
      }
      else {
        navigator.clipboard.writeText(message)
        .then(
          reportSuccessfull("writeText"),
          reportFailed("writeText")
        )
      }
    },
    error: e => console.error(e),
    complete: () => {}
  })

  // Chrome by default allows clipboard write and implements the permissions API call
  // Firefox by default doesn't allow the clipboard write and doesn't implement the permissions API call
  // so we're kind of forced to assume that if the API call fails that we won't have the necessary permissions
  const queryOpts = { name: 'clipboard-write', allowWithoutGesture: false };
  const copyImagesPermission$ = xs
    .fromPromise( navigator.permissions.query(queryOpts) )
    .replaceError(_ => xs.of({state: "error"}))
    .debug()

  return {
    copyImagesPermission$: copyImagesPermission$,
    results$: results$.debug("clipboard results$"),
  }
}

export { clipboardDriver }