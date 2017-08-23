import { merge, prop, equals, path } from 'ramda'
import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'

/**
 * 
 * @param {*} elementID: String identifier for the component
 * @param {*} thisState$: Pass sources.onion.state$ in order to pick up the debug settings
 * @param {*} location: Path to the debug key in settings, using dots as delimiter
 */
const loggerFactory = (elementID, thisState$, location = 'settings.debug') => (stream$, streamID, prefix = '== ', infix = ' > ', suffix = ' ==') => {
    const parseDebug = (debug) => (typeof debug === 'undefined')
        ? false
        : debug

    const logStream$ =
        xs.merge( // mimic thisState.first() because of lack of alternative...
            thisState$.endWhen(thisState$.drop(1)),
            xs.never()
        )
            .filter(state => parseDebug(path(location.split('.'), state)))
            .compose(dropRepeats(equals))
            .mapTo(stream$.map(ev => [
                prefix + elementID + infix + streamID + suffix,
                ev
            ]))
            .flatten()

    return logStream$
}

export { loggerFactory }