import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { vegaHistogramSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import { log } from '../../utils/logger'
import { ENTER_KEYCODE } from '../../utils/keycodes.js'
import { stateDebug } from '../../utils/utils'

const elementID = '#hist'

// Granular access to the settings, only api and sim keys
const histLens = { 
	get: state => ({hist: state.hist, settings: {hist: state.settings.hist, api: state.settings.api}}),
	set: (state, childState) => ({...state, hist: childState.hist})
};

/**
 * Be careful, the vega driver expects the DOM to be available in order to insert the canvas node.
 * This means that this component should not run before the actual DOM (not vdom) is rendered!
 * 
 * In other words, we have a visible variable that toggles when necessary.
 */
function Histogram(sources) {

	console.log('Starting component: Histogram...');

	const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$
	                    .debug(stateDebug('hist'));
 	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const vegaSource$ = sources.vega;

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
		.compose(dropRepeats((x, y) => equals(x, y)))
		.filter(state => state.hist.query != null && state.hist.query != '')

	const emptyState$ = state$
		.compose(dropRepeats((x, y) => equals(x, y)))
		.filter(state => state.hist.query == null || state.hist.query == '')

	const request$ = modifiedState$
		.map(state => {
			return {
				url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.histogram',
				method: 'POST',
				send: {
					query: state.hist.query,
					bins: state.settings.hist.bins,
					filter: state.hist.filter
				},
				'category': 'histogram'
			}
		})
		.debug();

	const response$$ = sources.HTTP
		.select('histogram')

	const invalidResponse$ = response$$
		.map(response$ =>
			response$
				.filter(response => false) // ignore regular event
				.replaceError(error => xs.of(error)) // emit error
		)
		.flatten()
		.debug()

	const validResponse$ = response$$
		.map(response$ =>
			response$
				.replaceError(error => xs.empty())
		)
		.flatten()
		.debug()

	const data$ = validResponse$
		.map(result => result.body.result.data)
		// It need startWith in order to initialize the vega component.
		// Be sure to drop(1) it later!!!
		.startWith(emptyData)

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$, visible$)
		.map(([data, newwidth, visible]) => {
			return { spec: vegaHistogramSpec(data), el: elementID, width: newwidth }
		});


	const makeHistogram = () => {
		return (
			div('.card-panel .center-align', { style: { height: '400px' } }, [div(elementID)])
		)
	};

	const initVdom$ = emptyState$.mapTo(div())

	const loadingVdom$ = request$.mapTo(
		div([
			div('.preloader-wrapper .small .active', { style: { 'z-index': 1, position: 'absolute' } }, [
				div('.spinner-layer .spinner-green-only', [
					div('.circle-clipper .left', [
						div('.circle')
					])
				])
			]),
			div({ style: { opacity: 0.4 } }, [makeHistogram()]),
		])
	)

	const loadedVdom$ = xs.combine(
		data$.drop(1),
		state$
	)
		.map(([data, state]) => div([
			(equals(data, emptyData))
				? div({ style: { visibility: 'hidden' } }, [makeHistogram()])
				: div([makeHistogram()])
		]))

	const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

	const vdom$ = xs.merge(loadedVdom$, loadingVdom$, errorVdom$, initVdom$) 

	return {
		DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
	};

}

export {Histogram, histLens}