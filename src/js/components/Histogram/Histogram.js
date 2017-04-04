import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { vegaHistogramSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import {log} from '../../utils/logger'
import {ENTER_KEYCODE} from '../../utils/keycodes.js'
import { between } from '../../utils/utils'

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
			.compose(dropRepeats((x, y) => equals(x,y)))

	const request$ = xs.combine(modifiedState$, props$, visible$)
		.filter(([state, props, visible]) => visible)
        .map(([state, props, visible]) => {
			return {
				url : props.url + '&classPath=com.dataintuitive.luciusapi.histogram',
				method : 'POST',
				send : {
					query : state.query,
					bins: props.bins,
					filter : state.filter
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

	// While doing a request and parsing the new vega spec, display render the empty spec:
	// const data$ = xs.merge(request$.mapTo(emptyData), resultData$)//.startWith(emptyData);
	const data$ = resultData$.startWith(emptyData);

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$, visible$)
		.map(([data, newwidth, visible]) => {
				return {spec : vegaHistogramSpec(data) , el : elementID, width : newwidth}
		});

    const makeHistogram = () => {
            return (
				div('.card-panel .center-align', {style: {height:'400px'}}, [div(elementID)])
            )
    };

    // Keeping track of when an HTTP request is ongoing...
	const loadingVdom$ = xs.combine(state$, data$)
							.map(([state, data]) =>  div([
									div('.preloader-wrapper .small .active', {style : {'z-index':1, position: 'absolute' }}, [
										div('.spinner-layer .spinner-green-only', [
											div('.circle-clipper .left', [
												div('.circle')
											])
										])
									]),
									div({style: {opacity: 0.4}}, [makeHistogram()]),
								]))
                            .compose(between(request$, vegaSpec$))
    // Show table when query is not in progress
    const renderVdom$ = xs.combine(state$, data$)
							.map(([state, data]) =>  div([
									div([makeHistogram()])
								]))
							.compose(between(data$, request$))
							// .startWith(div([makeHistogram()]))      // Initial state not needed, data is initialized

    const vdom$ = xs.merge(renderVdom$, loadingVdom$)

  return { 
    	DOM: vdom$,
		HTTP: request$,//.compose(debounce(5000)),
		vega: vegaSpec$,
        // onion: reducer$
  };

}
