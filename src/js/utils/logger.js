import { merge, prop, equals, path } from 'ramda'
import xs from 'xstream'

/**
 * 
 * @param {*} elementID: String identifier for the component
 * @param {*} thisState$: Pass sources.onion.state$ in order to pick up the debug settings
 * @param {*} location: Path to the debug key in settings, using dots as delimiter
 */
const loggerFactory = (elementID, thisState$, location = 'settings.debug') => (stream$, streamID, prefix='== ', infix=' > ', suffix=' ==') => {
    const parseDebug = (debug) => (typeof debug === 'undefined') 
                                    ? false
                                    : debug
    const debug$$ = thisState$.map(state => 
                (parseDebug(path(location.split('.'), state)))
                    ? stream$.map(ev => [
                        prefix + elementID + infix + streamID + suffix, 
                        ev
                        ])
                    : xs.never()
            )
    return debug$$.flatten()
}

export { loggerFactory }