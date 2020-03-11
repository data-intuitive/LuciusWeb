import * as M from 'materialize-css';

export function popupDriver(stream$) {
  stream$.addListener({
    next: message => (typeof message !== 'undefined') ? M.toast({html: message.text, displayLength: message.duration}) : null,
    error: e => console.error(e),
    complete: () => {}
  })
}
