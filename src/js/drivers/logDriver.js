import dropRepeats from 'xstream/extra/dropRepeats'
import { clone, equals } from 'ramda';

function logDriver(stream$) {
  stream$.compose(dropRepeats(equals)).addListener({
    next: message => {
        message.map(m => console.log(m))
    },
    error: e => console.error(e),
    complete: () => {}
  })
}

export { logDriver }