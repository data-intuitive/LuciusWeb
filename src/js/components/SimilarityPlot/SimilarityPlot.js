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

	// This component is active only when the signature is validated
	const active$ = state$.map(state => state.validated)

	// const resize$ = domSource$.select('.document').events('onload').debug(log)
	// const resize$ = xs.of('something');

	// Size stream
	const width$ = widthStream(domSource$, elementID)

	const request$ = state$
		.filter(state => state.validated)
        .map(state => {
			let thisUrl = state.connection.url + 'binnedZhang';
			return {
				url : thisUrl,
				method : 'POST',
				send : state.body,
				'category' : 'binnedZhang'
		}})
		.debug(log);

	// Catch the response in a stream
	const response$ = httpSource$
        .select('binnedZhang')
        .flatten()
        // .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
	const data$ = resultData$.startWith(emptyData);

	// Ingest the data in the spec and return to the driver
	const vegaSpec$ = xs.combine(data$, width$)
		.map(([data, newwidth]) => ({spec : similarityPlotSpec(data) , el : elementID, width : newwidth})).remember();

    const makeChart = (active, data) => {
            return (
                (active)
                ? div('.card-panel .center-align', [div(elementID)])
                : div('.card-panel .center-align', [div(elementID, {style: {visibility:'hidden'}})])
            )
    };

	// View
	const vdom$ = xs.combine(active$, data$)
			.map(([active, data]) =>  makeChart(active, data))

    const reducer$ = xs.of((prevState) => prevState);

  return { 
    	DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
        onion: reducer$
  };

}
