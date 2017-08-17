export function popupDriver(stream$) {
  stream$.addListener({
    next: message => (typeof message !== 'undefined') ? Materialize.toast(message.text, message.duration) : null,
    error: e => console.error(e),
    complete: () => {}
  })
}