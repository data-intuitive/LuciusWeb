import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone } from 'ramda';
import { similarityPlotSpec, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/width'

const log = (x) => console.log(x);

const elementID = '#vega'

const ENTER_KEYCODE = 13

export function SimilarityPlot(sources) {

	console.log('Starting component: SimilarityPlot...');

    const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$;
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
            .compose(dropRepeats((x, y) => x.query === y.query))
            .filter(state => state.query != null)

	const request$ = xs.combine(modifiedState$, visible$)
		.filter(([state, visible]) => visible)
		.map(([state, visible]) => state)
        .map(state => {
			let thisUrl = 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.' + 'binnedZhang';
			return {
				url : thisUrl,
				method : 'POST',
				send : {
					query : state.query,
					binsX: 20,
					binxY: 20
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
	const resultData$ = response$.map(response => response.body.result.data);
	const data$ = resultData$.startWith(emptyData);

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$, visible$)
		.map(([data, newwidth, visible]) => {
				return {spec : similarityPlotSpec(data) , el : elementID, width : newwidth}
		});

    const makeChart = data => {
            return (
                div('.card-panel .center-align', [div(elementID)])
            )
    };

	// View
	const vdom$ = data$
			.map(data =>  makeChart(data))

    const reducer$ = xs.of((prevState) => prevState);

  return { 
    	DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
  };

}
