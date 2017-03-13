import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, ul, li } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../../utils/logger'
import { ENTER_KEYCODE } from '../../utils/keycodes.js'
import { keys, filter, head } from 'ramda'
import { pick, mix } from 'cycle-onionify';
import isolate from '@cycle/isolate'
import { SampleInfo } from './SampleInfo'
// import dropRepeats from 'xstream/extra/dropRepeats'

export function SampleTable(sources) {

	console.log('Starting component: SampleTable...');

    const state$ = sources.onion.state$
	const domSource$ = sources.DOM;
    const props$ = sources.props

	// This component is active only when the signature is validated
	// const active$ = state$.map(state => state.validated).startWith(false).debug(log)

    // This will become an object representing the JSON table
    const array$ = sources.onion.state$.debug(log); 

    const childrenSinks$ = array$.map(array => {
        return array.map((item, index) => isolate(SampleInfo, index)(sources))
    });

    const vdom$ = childrenSinks$
                    .compose(pick('DOM'))
                    .compose(mix(xs.combine))
                    .map(itemVNodes => {
                        return ul('.collection', [
                                        li('.collection-item .grey .darken-1 .white-text', 
                                            [
                                                div('.row', {style: {fontSize : 'normal', fontWeight : 500}}, [
                                                    div('.col .s1', ['Zhang']),
                                                    div('.col .s2', ['Sample ID']),
                                                    div('.col .s1', ['Protocal']),
                                                    div('.col .s2', ['JNJS']),
                                                    div('.col .s3', ['Compound Name']),
                                                    div('.col .s3 .center-align', ['Structure']),
                                                ])
                                        ])
                                ].concat(itemVNodes))
                    })
                    .startWith(ul('.collection', [li('.collection-item .center-align .grey-text','no query yet...')]))

    // const childrenReducers$ = childrenSinks$
    //                             .compose(pick('onion'));
    // const childrenReducer$ = childrenReducers$
    //                             .compose(mix(xs.merge));

    // const https$ = childrenSinks$
    //                     .compose(pick('HTTP'));
    // const http$ = https$
    //                     .compose(mix(xs.merge));


	// View
    // const vdom$ = data$.map(json => JSON.stringify(json))
    // const vdom$ = xs.combine(active$, data$, tableType$)
    //                 .map(([active, json, type]) => {
    //                     if (type === "head") {
    //                         return makeTableHead(active, json)
    //                     } else {
    //                         return makeTableTail(active, json)
    //                     }
    //                 })

	// Just pass state as-is
	// const parentReducer$ = //xs.of((prevState) => [{count : 0}, {count:1}, {count:2}])

    // const reducer$ = xs.periodic(1000).map(i => function reducer(prevArray) {
    //     return prevArray.concat({count: i})
    // });

    // const reducer$ = xs.of(function defaultReducer(prevState) {
    //     if (typeof prevState === 'undefined') {
    //         return []; // Parent didn't provide state for the child, so initialize it.
    //     } else {
    //         return prevState; // Let's just use the state given from the parent.
    //     }
    // });

    // const reducer$ = array$.map( array => prevState => {
    //         console.log('yes !!!!')
    //         console.log(array)
    //         return array;
    // });

    // const defaultReducer$ = xs.of(function defaultReducer(prevState) {
    //     if (typeof prevState === 'undefined') {
    //         return []; // Parent didn't provide state for the child, so initialize it.
    //     } else {
    //         return prevState; // Let's just use the state given from the parent.
    //     }
    // });

    // const totalReducer$ = xs.merge(
    //     // defaultReducer$,
    //     reducer$, 
    //     )

    return { 
            DOM: vdom$,
            // HTTP: http$,
            // onion: childrenReducer$
    };

}