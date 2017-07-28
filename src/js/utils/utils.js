import dropRepeats from 'xstream/extra/dropRepeats'
import { prop } from 'ramda'

// const log = (x) => console.log(x);

export const stateDebug = component => state => {
	if (prop(component, state.settings).DEBUG == true) {
		console.log('== State in <<' + component + '>>')
		console.log(state)	
	} else {
	}
}

// Size stream, make it dependent on the size of container which is managed by CSS.
// TODO: Make it update immediately, currently only updates on new query
export function widthStream(domSource$, el) {
    return domSource$
                .select(el)
                .elements()
                .map(elements => elements[0])
                .map(container => {
                    if (container != undefined ) {
                        return container.offsetWidth
                    } else {
                        return 100
                    }
                    })
                .compose(dropRepeats())
                // .debug(log)
}

/**
 * source: --a--b----c----d---e-f--g----h---i--j-----
 * first:  -------F------------------F---------------
 * second: -----------------S-----------------S------
 *                         between
 * output: ----------c----d-------------h---i--------
 */
export function between(first, second) {
    return (source) => first.mapTo(source.endWhen(second)).flatten()
}

