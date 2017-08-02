import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals, omit } from 'ramda';
import { similarityPlotSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import { stateDebug } from '../../utils/utils'

const elementID = '#vega'

const ENTER_KEYCODE = 13

// Granular access to the settings, only api and sim keys
const simLens = { 
	get: state => ({core: state.sim, settings: {sim: state.settings.sim, api: state.settings.api}}),
	set: (state, childState) => ({...state, sim: childState.core})
};

function SimilarityPlot(sources) {

	console.log('Starting component: SimilarityPlot...');

	const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$.debug(state => {
        console.log('== State in SimilarityPlot =================')
        console.log(state)
    });

	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const vegaSource$ = sources.vega;
	const visible$ = sources.DOM.select(elementID)
		.elements()
		.map(els => els[0])
		.map(el => (typeof el !== 'undefined'))
		.compose(dropRepeats())
		.startWith(false)
		.remember()

	// Size stream
	const width$ = widthStream(domSource$, elementID)

    const input$ = sources.input.debug()

	const isInitState = (state) => {
		if (typeof state.core === 'undefined') {
			return true
		} else {
			if (typeof state.core.input === 'undefined') {
				return true
			} else {
				// return false
				if (state.core.input.signature === '') {
					return true
				} else {
					return false
				}
			}
		}
	}

	// state$ handling
	const modifiedState$ = state$
		.filter(state => ! isInitState(state))
		// .filter(state => state.core.input.signature != '')
		// .compose(dropRepeats((x, y) => equals(omit(['request', 'data', 'output'], x.core), omit(['request', 'data', 'output'], y.core))))
		// .compose(dropRepeats((x, y) => equals(x, y)))
		.remember()

	const initState$ = state$
		.filter(state => isInitState(state))
		// .remember()
		// .compose(dropRepeats((x, y) => equals(x, y)))

	const newInput$ = xs.combine(
		input$, 
		state$)
	.map(([newInput, state]) => ({...state, core: {...state.core, input : newInput}}))
	.compose(dropRepeats((x,y) => equals(x.core.input, y.core.input)))
	.remember()
	.debug()

	// const newInput$ = modifiedState$
	// // .map(([state]) => ({...state, core: {...state.core, input : newinput}}))
	// // .compose(dropRepeats((x,y) => equals(x.core.input, y.core.input)))
	// .debug()

	// No requests when signature is empty!
	const triggerRequest$ = newInput$
		.filter(state => state.core.input.signature != '')

	const request$ = triggerRequest$
		.map(state => {
			return {
				url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.binnedZhang',
				method: 'POST',
				send: {
					query: state.core.input.signature,
					binsX: state.settings.sim.binsX,
					binsY: state.settings.sim.binsY,
					filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : ''
				},
				'category': 'binnedZhang'
			}
		})
		.remember()
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
		// .startWith(emptyData)

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$, visible$)
		.map(([data, newwidth, visible]) => {
			return { spec: similarityPlotSpec(data), el: elementID, width: newwidth }
		}).remember();

	const makeChart = () => {
		return (
			div('.card-panel .center-align', { style: { height: '400px' } }, [div(elementID)])
		)
	};

	const initVdom$ = initState$.mapTo(div()).debug()

	const loadingVdom$ = xs.merge(request$).mapTo(
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
	).debug()

	const loadedVdom$ = modifiedState$
		.map(state => div([
			(equals(state.core.data, emptyData))
				? div({ style: { visibility: 'hidden' } }, [makeChart()])
				: div([makeChart()])
		])).debug()

	const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

	const vdom$ = xs.merge(
		initVdom$, 
		errorVdom$, 
		loadingVdom$, 
		loadedVdom$
	)

	const defaultReducer$ = xs.of(prevState => ({...prevState, core: {...prevState.core, input: {signature: ''}}})).debug()

	// Add input to state
    const inputReducer$ = input$.map(i => prevState => 
		// inputReducer
		({...prevState, core: {...prevState.core, input: i}})
	)
    // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({...prevState, core: {...prevState.core, request: req}})).debug()
    // Add data from API to state, update output key when relevant
    const dataReducer$ = data$.map(newData => prevState => ({...prevState, core: {...prevState.core, data: newData}})).debug()
 
	return {
		DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
		onion: xs.merge(
			defaultReducer$,
			inputReducer$,
			requestReducer$,
			dataReducer$
		)
	};

}

export { SimilarityPlot, simLens };