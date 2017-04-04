import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { similarityPlotSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import { between } from '../../utils/utils'

const log = (x) => console.log(x);

const elementID = '#vega'

const ENTER_KEYCODE = 13

export function SimilarityPlot(sources) {

	console.log('Starting component: SimilarityPlot...');

    const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$.debug(state => {
		console.log('== State in Sim =================')
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
            .compose(dropRepeats((x, y) => equals(x,y)))
            .filter(state => state.query != null)
			// .remember()

	const request$ = xs.combine(modifiedState$, props$, visible$)
		.filter(([state, props, visible]) => visible)
        .map(([state, props, visible]) => {
			return {
				url : props.url + '&classPath=com.dataintuitive.luciusapi.binnedZhang',
				method : 'POST',
				send : {
					query : state.query,
					binsX: props.binsX,
					binsY: props.binsY,
					filter : (typeof state.filter !== 'undefined') ? state.filter : ''
				},
				'category' : 'binnedZhang'
		}})
		.debug(console.log);
	
	// Catch the response in a stream
	const response$ = httpSource$
        .select('binnedZhang')
        .flatten()
        .debug(console.log);

	// Extract the data from the result
	// TODO: check for errors coming back
	// Please note: since the Vega driver looks for an element in the dom, it needs to exist prior to rendering it!
	const resultData$ = response$.map(response => response.body.result.data);

	// While doing a request and parsing the new vega spec, display render the empty spec:
	const data$ = resultData$.startWith(emptyData);

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$, visible$)
		.map(([data, newwidth, visible]) => {
				return {spec : similarityPlotSpec(data) , el : elementID, width : newwidth}
		});

	const makeChart = () => {
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
									div({style: {opacity: 0.4}}, [makeChart()]),
								]))
                            .compose(between(request$, vegaSpec$))
    // Show table when query is not in progress
    const renderVdom$ = xs.combine(state$, data$)
							.map(([state, data]) =>  div([
									div([makeChart()])
								]))
							.compose(between(data$, request$))
							// .startWith(div([makeChart()]))      // Initial state not needed, data is initialized


	// View
    const vdom$ = xs.merge(renderVdom$, loadingVdom$)


  return { 
    	DOM: vdom$,
		HTTP: request$, //.compose(debounce(5000)),
		vega: vegaSpec$,
  };

}
