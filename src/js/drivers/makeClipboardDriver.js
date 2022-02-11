import xs from "xstream"
import flattenConcurrently from "xstream/extra/flattenConcurrently"

/**
 * Pass message objects with members:
 *  - type: data type to set, use '' or undefined if raw text
 *  - data: data blob
 *  - sender: sender id, is added in return value
 * @param {Boolean} provideOwnSink when set to true, the driver adds a sink to the result output stream so that the clipboard 
 *                                 functionality still works even if the output stream is not used
 * @returns object with members:
 *  - state: 'success' or 'failure'
 *  - sender: sender id from message object
 */
function makeClipboardDriver(provideOwnSink= false) {
  // Chrome by default allows clipboard write and implements the permissions API call
  // Firefox by default doesn't allow the clipboard write and doesn't implement the permissions API call
  // so we're kind of forced to assume that if the API call fails that we won't have the necessary permissions
  const queryOpts = { name: "clipboard-write", allowWithoutGesture: false }
  const copyImagesPermission$ = xs
    .fromPromise(navigator.permissions.query(queryOpts))
    .replaceError((_) => xs.of({ state: "error" }))

  function clipboardDriver(stream$) {
    const results$ = xs
      .create({
        start: (listener) => {
          stream$.addListener({
            next: (message) => {
              const clipboard$ =
                message.type != undefined && message.type != ""
                  ? (() => {
                      try {
                        return xs.fromPromise(
                          navigator.clipboard.write([
                            new ClipboardItem({
                              [message.type]: message.data,
                            }),
                          ])
                        )
                      } catch {
                        return xs.of({
                          state: "failure",
                          sender: message.sender,
                        })
                      }
                    })()
                  : xs.fromPromise(navigator.clipboard.writeText(message.data))
              const clipboardMapped$ = clipboard$
                .debug("clipboard$")
                .map((res) =>
                  res == undefined
                    ? { state: "success", sender: message.sender }
                    : res
                )
                .replaceError((_) =>
                  xs.of({ state: "failure", sender: message.sender })
                )
              listener.next(clipboardMapped$)
            },
            error: (e) => {
              console.log(e)
            },
          })
        },
        stop: () => {},
      })

    if (provideOwnSink) {
      results$.addListener({
        next: () => {},
        error: () => {},
      })
    }

    return {
      copyImagesPermission$: copyImagesPermission$,
      results$: results$.compose(flattenConcurrently),
    }
  }

  return clipboardDriver
}

export { makeClipboardDriver }
