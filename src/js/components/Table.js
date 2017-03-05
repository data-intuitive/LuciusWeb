import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, filter, head } from 'ramda'

export function Table(sources, props$) {

	console.log('Starting component: Table...');

	const state$ = sources.onion.state$;
	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const vegaSource$ = sources.vega;

    // Table type (head or tail)
    const tableType$ = props$.map( ({ body }) => {
        console.log(keys(body))
        return head( filter( key => (key === "head" || key === "tail") , keys(body)) )
    }).startWith(null).debug(log)

    tableType$.addListener({
            next: (el) => {log(el)},
            error: () => {},
            complete: () => {}            
        });

    // Intent
	// Refresh is triggered by click on button or ctrl-enter on input field
	const click$ = domSource$.select('.SignatureRun').events('click').debug(log);
    const ctrlEnter$ = domSource$.select('.Query').events('keydown').filter(({keyCode, ctrlKey}) => keyCode === ENTER_KEYCODE && ctrlKey === true).debug(log) ;
	const refresh$ = xs.merge(click$, ctrlEnter$)

	// const body$ = state$.map(json => json.body);
    const request$ = refresh$.compose(sampleCombine(props$))
        .map(([x, state]) => {
			let thisUrl = state.connection.url + 'topTable';
			return {
				url : thisUrl,
				method : 'POST',
				send : state.body,
				'category' : 'topTable'
		}})
		.debug(log);

	// Catch the response in a stream
	const response$ = httpSource$
        .select('topTable')
        .flatten()
        .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
    const data$ = resultData$.startWith(null).debug(log);

	// Helper function for rendering the table, based on the state
	const makeTableHead = (data) => {
            if (data === null) {
                return p('nothing yet...')
            } else {
                let rows = data.map(row => [ 
                    td(row.zhang.toFixed(3)),
                    td(row.id),
                    (row.jnjs != "NA") ? td(row.jnjs) : td(""),
                    td(row.compoundname)
                ]);
                const header = tr('.green .darken-1 .green-text .text-lighten-4', [
                                    th('Zhang'),
                                    th('SampleID'),
                                    th('Jnjs'),
                                    th('Name')
                        ]);

                let body = [];
                rows.map(row => body.push(tr(row)));
                const tableContent = [thead([header]), tbody({style : {'font-weight': 'lighter'}}, body)];

                return ( 
                        div([
                                div('.row'),
                                div('.row', [table('.striped .green-text .text-darken-4', tableContent)]),
                                div('.row')
                            ])
                    )
            }
	}

	const makeTableTail = (data) => {
            if (data === null) {
                return p('nothing yet...')
            } else {
                let rows = data.map(row => [ 
                    td(row.zhang.toFixed(3)),
                    td(row.id),
                    (row.jnjs != "NA") ? td(row.jnjs) : td(""),
                    td(row.compoundname)
                ]);
                const header = tr('.red .darken-1 .red-text .text-lighten-4', [
                                    th('Zhang'),
                                    th('SampleID'),
                                    th('Jnjs'),
                                    th('Name')
                        ]);

                let body = [];
                rows.map(row => body.push(tr(row)));
                const tableContent = [thead([header]), tbody({style : {'font-weight': 'lighter'}}, body)];

                return ( 
                        div([
                                div('.row'),
                                div('.row', [table('.striped .red-text .text-darken-4', tableContent)]),
                                div('.row')
                            ])
                    )
            }
	}


	// View
    // const vdom$ = data$.map(json => JSON.stringify(json))
    const vdom$ = xs.combine(data$, tableType$)
                    .map(([json, type]) => {
                        if (type === "head") {
                            return makeTableHead(json)
                        } else {
                            return makeTableTail(json)
                        }
                    })

	// When clicked, switch to visible:
	const reducer$ = xs.of((prevState) => prevState)

  return { 
    	DOM: vdom$,
		HTTP: request$,
		// vega: vegaSpec$,
        onion: reducer$
  };

}
