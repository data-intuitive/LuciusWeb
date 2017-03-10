import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h4, th, thead, tbody } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, filter, head } from 'ramda'
import { SampleTable } from './Table2'
import isolate from '@cycle/isolate'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
// import { clone } from 'ramda';

export function Table(sources) {

	console.log('Starting component: Table...');

    const state$ = sources.onion.state$.debug(state => {
        console.log('Table:')
        console.log(state)
    });
	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
    const props$ = sources.props.debug(state => {
        console.log('Props:')
        console.log(state)
    });

	// This component is active only when the signature is validated
	// const active$ = state$.map(state => state.validated).startWith(false).debug(log)

    // Table type (head or tail)
    // const tableType$ = props$.map( ({ body }) => {
    //     return head( filter( key => (key === "head" || key === "tail") , keys(body)) )
    // }).startWith(null).debug(log)

    // const tableType$ = xs.of('head')

    // const click$ = domSource$.select('.run').events('click')

    const modifiedState$ = state$
            .debug(x => {
                console.log('in request')
                console.log(x)
            })
            .compose(dropRepeats((x, y) => x.query === y.query))
            .filter(state => state.query != null)

    const request$ = xs.combine(modifiedState$, props$)
            .map(([state,props]) => ({
                    send : merge(state, props),
                    method: 'POST',
                    url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.topTable',
                    category : 'topTable'
     })).debug(log)

    // const request$ = state$
    //     .compose(dropRepeats())
	// 	// .filter(state => state.validated)
    //     .compose(sampleCombine(newQuery$))
    //     // .map(([x, state]) => {
    //     .map(([state, nq]) => {
	// 		let thisUrl = state.connection.url + 'topTable';
	// 		return {
	// 			url : thisUrl,
	// 			method : 'POST',
    //             send : merge(state.body, {head : 4}),
	// 			'category' : 'topTable'
	// 	}})
	// 	.debug(log);

	// Catch the response in a stream
	const response$ = httpSource$
        .select('topTable')
        .flatten()
        .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
    const data$ = resultData$;

	// Helper function for rendering the table, based on the state
	// const makeTableHead = (active, data) => {
    //         if (!active || data === null) {
    //             return p('nothing yet...')
    //         } else {
    //             let rows = data.map(row => [ 
    //                 td(row.zhang.toFixed(3)),
    //                 td(row.id),
    //                 (row.jnjs != "NA") ? td(row.jnjs) : td(""),
    //                 td(row.compoundname)
    //             ]);
    //             const header = tr('.green .darken-1 .green-text .text-lighten-4', [
    //                                 th('Zhang'),
    //                                 th('SampleID'),
    //                                 th('Jnjs'),
    //                                 th('Name')
    //                     ]);

    //             let body = [];
    //             rows.map(row => body.push(tr(row)));
    //             const tableContent = [thead([header]), tbody({style : {'font-weight': 'light'}}, body)];

    //             return ( 
    //                     div([
    //                             div('.row'),
    //                             div('.row', [table('.head .striped .green-text .text-darken-4', tableContent)]),
    //                             div('.row'),
    //                             // a({props: {href: '/foo'}}, 'a link:'),
    //                             // div('.row'),
    //                         ])
    //                 )
    //         }
	// }

	// const makeTableTail = (active, data) => {
    //         if (!active || data === null) {
    //             return p('nothing yet...')
    //         } else {
    //             let rows = data.map(row => [ 
    //                 td(row.zhang.toFixed(3)),
    //                 td(row.id),
    //                 (row.jnjs != "NA") ? td(row.jnjs) : td(""),
    //                 td(row.compoundname)
    //             ]);
    //             const header = tr('.red .darken-1 .red-text .text-lighten-4', [
    //                                 th('Zhang'),
    //                                 th('SampleID'),
    //                                 th('Jnjs'),
    //                                 th('Name')
    //                     ]);

    //             let body = [];
    //             rows.map(row => body.push(tr(row)));
    //             const tableContent = [thead([header]), tbody({style : {'font-weight': 'light'}}, body)];

    //             return ( 
    //                     div([
    //                             div('.row'),
    //                             div('.row', [table('.tail .striped .red-text .text-darken-4', tableContent)]),
    //                             div('.row')
    //                         ])
    //                 )
    //         }
	// }

    const sampleTableSink = isolate(SampleTable, 'result')(sources);

    const vdom$ = xs.combine(sampleTableSink.DOM, props$)
            .map(([dom,props]) => div([
                    h4('.right-align', props.title),
                    dom                    
                ]))
                // .startWith(button('.run .btn .col .s4 .pink', 'Run Now!'))

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

	const defaultReducer$ = xs.of(function defaultReducer(prevState) {
		console.log('Default reducer ...')
        if (typeof prevState === 'undefined') {
			return {
				query : null,
			}
        } else {
            return prevState;
        }
    });

	// Just pass state as-is
    // const thisReducer$ = data$
    //     // data$.map(state => prevStat)
    //     .compose(dropRepeats())
    //     .map(data => {
    //         if (data === null) {
    //             return prevState => prevState
    //         } else { prevState => {
    //             let newState = clone(prevState)
    //             newState.result = data
    //             return newState
    //         }}
    //     })

    // This one make sure the state is cycled by adding the resulting data to its child key
    const stateReducer$ = data$.map(data => {
            return prevState => {
                    let newState = clone(prevState)
                    newState.result = data
                    return newState
                }
    })

        // data$.compose(dropRepeats()).map(data => {
        //     if (data === null) {
        //         return prevState => prevState
        //     } else {
        //         return prevState => merge(prevState, {table : data})
        //     }
        // })

    // const thisReducer$ = data$.map( data => prevState => merge(prevState, {table : data}))
                // .compose(dropRepeats())
                // .map(data => prevState => {
                //         prevState.table = data
                //         return prevState
                //     })
                // .map(data => prevState => merge(prevState, {table : data}))
        // data$.compose(dropRepeats()).map(data => {
        //     if (data === null) {
        //         return prevState => prevState
        //     } else {
        //         return prevState => merge(prevState, {toptable : data})
        //     }
        // })

    const sampleTableReducer$ = sampleTableSink.onion
    const reducer$ = xs.merge(
        defaultReducer$,
        stateReducer$,
        // sampleTableReducer$,
        // thisReducer$, 
        )//, sampleTableReducer$)

    // const tableReducer

  return { 
    	DOM: vdom$,
		HTTP: request$,
        onion: reducer$
  };

}
