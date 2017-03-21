import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { vegaHistogramSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/width'
import {log} from '../../utils/logger'
import {ENTER_KEYCODE} from '../../utils/keycodes.js'

const elementID = '#hist'

/**
 * Be careful, the vega driver expects the DOM to be available in order to insert the canvas node.
 * This means that this component should not run before the actual DOM (not vdom) is rendered!
 * 
 * In other words, we have a visible variable that toggles when necessary.
 */
export function Histogram(sources) {

	console.log('Starting component: Histogram...');

    const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$;
	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const vegaSource$ = sources.vega;

	const props$ = sources.props

	// Visible?
	// const visible$ = xs.of(document.getElementById("hist") != null).debug(visible => console.log('Visibility: ' + visible))
	const visible$ = sources.DOM.select(elementID)
								 .elements()
								 .map(els => els[0])
								 .map(el => (typeof el !== 'undefined'))
 								 .compose(dropRepeats())
								 .startWith(false)
								//  .debug(visible => console.log('Visibility: ' + visible))

	// Size stream
	const width$ = widthStream(domSource$, elementID)

	// This component is active only when the signature is validated
	// const active$ = state$.map(state => state.validated)

    const modifiedState$ = state$
            .filter(state => state.query != '')
			.compose(dropRepeats((x, y) => x.query === y.query))

	const request$ = xs.combine(modifiedState$, props$, visible$)
		.filter(([state, props, visible]) => visible)
        .map(([state, props, visible]) => {
			console.log('Props: ' + props.bins)
			let thisUrl = 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.' + 'histogram';
			return {
				url : thisUrl,
				method : 'POST',
				send : {
					query : state.query,
					bins: props.bins
				},
				'category' : 'histogram'
		}})
		.debug(log);

	// Catch the response in a stream
	const response$ = httpSource$
        .select('histogram')
        .flatten()
        .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
	const data$ = resultData$.startWith(emptyData);

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$, visible$)
		.map(([data, newwidth, visible]) => {
				return {spec : vegaHistogramSpec(data) , el : elementID, width : newwidth}
		});

    const makeHistogram = (data) => {
            return (
				div('.card-panel .center-align', [div(elementID)])
            )
    };

	// View
    const vdom$ = xs.combine(data$)
            .map((data) =>  makeHistogram(data) )

  return { 
    	DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
        // onion: reducer$
  };

}
