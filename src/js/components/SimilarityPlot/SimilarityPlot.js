import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { similarityPlotSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import { between } from '../../utils/utils'

const elementID = '#vega'

const ENTER_KEYCODE = 13

export function SimilarityPlot(sources) {

	console.log('Starting component: SimilarityPlot...');

	const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$.debug(state => {
		console.log('== State in Sim')
		console.log(state)
	});;
	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const vegaSource$ = sources.vega;

	const props$ = sources.props

	const visible$ = sources.DOM.select(elementID)
		.elements()
		.map(els => els[0])
		.map(el => (typeof el !== 'undefined'))
		.compose(dropRepeats())
		.startWith(false)
	//  .debug(visible => console.log('Visibility: ' + visible))

	// Size stream
	const width$ = widthStream(domSource$, elementID)

	const modifiedState$ = state$
		.compose(dropRepeats((x, y) => equals(x, y)))
		.filter(state => state.query != null && state.query != '')

	const emptyState$ = state$
		.compose(dropRepeats((x, y) => equals(x, y)))
		.filter(state => state.query == null || state.query == '')

	const request$ = xs.combine(modifiedState$, props$)//, visible$)
		// .filter(([state, props, visible]) => visible)
		.map(([state, props]) => {
			return {
				url: props.url + '&classPath=com.dataintuitive.luciusapi.binnedZhang',
				method: 'POST',
				send: {
					query: state.query,
					binsX: props.binsX,
					binsY: props.binsY,
					filter: (typeof state.filter !== 'undefined') ? state.filter : ''
				},
				'category': 'binnedZhang'
			}
		})
		.debug();

	const response$$ = sources.HTTP
		.select('binnedZhang')

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
			return { spec: similarityPlotSpec(data), el: elementID, width: newwidth }
		});

	const makeChart = () => {
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
			div({ style: { opacity: 0.4 } }, [makeChart()]),
		])
	)

	const loadedVdom$ = xs.combine(
		data$.drop(1),
		state$
	)
		.map(([data, state]) => div([
			(equals(data, emptyData))
				? div({ style: { visibility: 'hidden' } }, [makeChart()])
				: div([makeChart()])
		]))

	const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

	const vdom$ = xs.merge(loadedVdom$, loadingVdom$, errorVdom$, initVdom$)

	return {
		DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
	};

}
