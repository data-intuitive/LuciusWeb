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

	// const resize$ = domSource$.select('.document').events('onload').debug(log)
	// const resize$ = xs.of('something');

	// Size stream
	const width$ = widthStream(domSource$, elementID)

    // Intent
	// Refresh is triggered by click on button or ctrl-enter on input field
	const click$ = domSource$.select('.SignatureRun').events('click').debug(log);
    const ctrlEnter$ = domSource$.select('.Query').events('keydown').filter(({keyCode, ctrlKey}) => keyCode === ENTER_KEYCODE && ctrlKey === true).debug(log) ;
	const refresh$ = xs.merge(click$, ctrlEnter$)

    const request$ = refresh$.compose(sampleCombine(state$))
        .map(([x, state]) => {
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

    const makeChart = (state, data) => {
            let visible = state.ux.histogramVisible;
            return (
                (visible)
                ? div('.card-panel .center-align', [div(elementID)])
                : div('.card-panel .center-align', [div(elementID, {style: {visibility:'hidden'}})])
            )
    };

	// View
	const vdom$ = data$
			.compose(sampleCombine(state$))
			.map(([data, state]) =>  makeChart(state, data))

	// When clicked, switch to visible:
	const expandReducer$ = refresh$.map(
		click => function reducer(prevState) {
			let newState = clone(prevState);
			let newUx = clone(prevState.ux);
			newUx.histogramVisible = true;
			newState.ux = newUx;
			console.log(newState);
			return newState;
		});

    // const reducer$ = xs.of((prevState) => prevState);

  return { 
    	DOM: vdom$,
		HTTP: request$,
		vega: vegaSpec$,
        onion: expandReducer$
  };

}
