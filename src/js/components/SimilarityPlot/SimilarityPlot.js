import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone } from 'ramda';
import { similarityPlotSpec, exampleData, emptyData } from './spec.js'

const log = (x) => console.log(x);

export function SimilarityPlot(sources) {

	console.log('Starting component: Histogram...');

    const ENTER_KEYCODE = 13

	const state$ = sources.onion.state$;
	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const vegaSource$ = sources.vega;

    // Intent
	// Refresh is triggered by click on button or enter on input field
	const click$ = domSource$.select('.SignatureRun').events('click').debug(log);
    // This does not work yet!!!
    const enter$ = domSource$.select('.Query').events('keydown').debug(log) //.filter(({keyCode}) => keyCode === ENTER_KEYCODE);
	const refresh$ = $.merge(click$, enter$)

	// const body$ = state$.map(json => json.body);
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
        .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
	const data$ = resultData$.startWith(emptyData);

	// Ingest the data in the spec and return to the driver
    const vegaSpec$ = data$.map(data => ({spec : similarityPlotSpec(data) , el : '#vega', width: 700, height: 300})).remember();

    const makeHistogram = (state, data) => {
            let visible = state.ux.histogramVisible;
            return (
                (visible)
                ? div('.card-panel .center-align', [div('#vega', {style: {border:'1px'}})])
                : div('.card-panel .center-align', [div('#vega', {style: {visibility:'hidden'}})])
            )
    };

	// View
    const vdom$ = //data$.compose(sampleCombine(state$))
            xs.combine(data$, state$)
            .map(([data, state]) =>  makeHistogram(state, data) )
            .debug(log);

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
