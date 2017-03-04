import xs from 'xstream';
import { p, div, br, label, input, code, table, tr, th, td, b, h2, button, thead, tbody, i, h, hr } from '@cycle/dom';
import { clone } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine';

const emptyData = {
	body: {
		result: {
			data : []
		}
	}
}

// import {thumb_up} from 'webpack-material-design-icons/material-design-icons.css';

// import 'test.css';

let debug = true;
const log = (x) => console.log(x);

const empty = {
		result: {
			data: []
	}
};

function SignatureCheck(sources) {

	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
    
	console.log('Starting component: SignatureCheck...');

	const state$ = sources.onion.state$;
	// const body$ = state$.map(json => json);

	// Change in state is the trigger for launching the http request
	const click$ = domSource$.select('.SignatureCheck').events('click');
	const request$ = click$.compose(sampleCombine(state$))
		.map(([click, state]) =>  {
			let thisUrl = state.connection.url + 'checkSignature';
			return {
				url : thisUrl,
				method : 'POST',
				send : state.body,
				'category' : 'checkSignature'
		}})
		// .debug(log);

	// Catch the response in a stream
	// Handle errors by returning an empty object
	const response$ = httpSource$
		.select('checkSignature')
		.map((response$) =>
				response$.replaceError(() => xs.of(emptyData))
			)		
		.flatten()
		// .debug(log);

	const data$ = response$
		.map(res => res.body)
		.startWith(empty)
		.map(json => json.result.data)
		// .debug(log);

	// Helper function for rendering the table, based on the state
	const makeTable = (state, data) => {
			let visible = state.ux.checkSignatureVisible;
			let rows = data.map(entry => [ 
				(entry.inL1000) ? td(entry.query) : td('.red .lighten-4 .red-text .text-darken-4', entry.query),
				(entry.inL1000) ? td(i('.material-icons .dp48',''), 'x') : td('.red .lighten-4 .red-text .text-darken-4', '-'),
				(entry.inL1000) ? td(entry.symbol) : td('.red .lighten-4 .red-text .text-darken-4', entry.symbol)
			]);
			const header = tr([
								th('Input'),
								th('In L1000?'),
								th('Symbol')
					]);

			let body = [];
			rows.map(row => body.push(tr(row)));
			const tableContent = [thead([header]), tbody(body)];

			return ( 
					(visible) 
					? div([
							div('.row'),
							div('.row', [table('.striped', tableContent)]),
							div('.row', [
								button('.collapseUpdate .btn .col .offset-s1 .s4 .pink .accent-4', 'Update Query'),
								button('.collapse .btn .col .offset-s2 .s4 .pink .accent-4', 'Collapse')
								]),
							div('.row')
						])
					: div([])
			);
	}

	// Render table
	const vdom$ = xs.combine(state$, data$)
					.map(([state, data]) => 
						makeTable(state, data),
					);

	// When clicked, show table by switching ux visibility state:
	const expandReducer$ = click$.map(
		click => function reducer(prevState) {
			let newState = clone(prevState);
			let newUx = clone(prevState.ux);
			newUx.checkSignatureVisible = true;
			newState.ux = newUx;
			console.log(newState);
			return newState;
		})
		// .debug(log);


	// When clicked, show table by switching ux visibility state:
	const collapse$ = domSource$.select('.collapse').events('click');
	const collapseReducer$ = collapse$.compose(sampleCombine(data$))
		.map(([collapse, data]) => function reducer(prevState) {

			let newState = clone(prevState);

			// Update UX visibility of this component
			let newUx = clone(prevState.ux);
			newUx.checkSignatureVisible = false;
			newState.ux = newUx;

			console.log(newState);
			return newState;
		});

	const collapseUpdate$ = domSource$.select('.collapseUpdate').events('click');
	const collapseUpdateReducer$ = collapseUpdate$.compose(sampleCombine(data$))
		.map(([collapse, data]) => function reducer(prevState) {

			let newState = clone(prevState);

			// Update UX visibility of this component
			let newUx = clone(prevState.ux);
			newUx.checkSignatureVisible = false;
			newState.ux = newUx;

			// Update query value
			let newBody = clone(prevState.body);
			newBody.query = data.map(x => (x.inL1000) ? x.symbol : '').join(" ").replace(/\s\s+/g, ' ');
			newState.body = newBody;			

			console.log(newState);
			return newState;
		});

  return { 
    HTTP: request$,
    DOM: vdom$,
	onion: xs.merge(expandReducer$, collapseReducer$, collapseUpdateReducer$)
  }

};

export { SignatureCheck };