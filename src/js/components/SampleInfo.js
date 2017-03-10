import xs from 'xstream'
import { i, a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span } from '@cycle/dom'
import { log } from '../utils/logger'

export function SampleInfo(sources) {

    const state$ = sources.onion.state$;
	const domSource$ = sources.DOM;

    const vdom$ = state$.map(sample => {
        // console.log(sample)
        return li('.collection-item', 
            [
                div('.row', [
                    div('.col .s1', [sample.zhang.toFixed(3)]),
                    div('.col .s2', [sample.id]),
                    div('.col .s2', [(sample.jnjs != "NA") ? sample.jnjs : '']),
                    div('.col .s4', [sample.compoundname]),
                    div('.col .s2', [sample.protocolname]),
                ])
            ])
    })

    const defaultReducer$ = xs.of(function defaultReducer(prevState) {
        if (typeof prevState === 'undefined') {
            return {}; // Parent didn't provide state for the child, so initialize it.
        } else {
            return prevState; // Let's just use the state given from the parent.
        }
    });

	// Just pass state as-is
	// const reducer$ = xs.of((prevState) => prevState)

    return { 
    	DOM: vdom$,
        // onion: defaultReducer$
  };


}