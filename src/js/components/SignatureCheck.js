import xs from 'xstream';
import { p, div, br, label, input, code, table, tr, th, td, b, h2, button, thead, tbody, i, h, hr } from '@cycle/dom';
import { clone } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine'
import {log, logThis} from '../utils/logger'
import {ENTER_KEYCODE} from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'

const emptyData = {
	body: {
		result: {
			data : []
		}
	}
}

const empty = {
		result: {
			data: []
	}
};

function SignatureCheck(sources) {

	console.log('Starting component: SignatureCheck...');

	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const state$ = sources.onion.state$

	// This component is active only when the signature is not yet validated
	const active$ = state$.map(state => !state.validated)

	const request$ = state$
		.filter(state => !state.validated)
		.map(state =>  {
			let thisUrl = state.connection.url + 'checkSignature';
			return {
				url : thisUrl,
				method : 'POST',
				send : state.body,
				'category' : 'checkSignature'
		}})
		.debug(log);

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
	const makeTable = (visible, data) => {
			// let visible = visible1 //state.ux.checkSignatureVisible;
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
								button('.collapseUpdate .btn .col .offset-s4 .s4 .pink .accent-4', 'Update/Validate'),
								// button('.collapse .btn .col .offset-s2 .s4 .pink .accent-4', 'Collapse')
								]),
							div('.row')
						])
					: div([])
			);
	}

	// Render table
	const vdom$ = xs.combine(active$, data$)
					.map(([active, data]) => 
						makeTable(active, data),
					);

	// Collapse button collapses the window
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

	// Update and Collapse button updates the query and collapses the window
	const collapseUpdate$ = domSource$.select('.collapseUpdate').events('click');
	const collapseUpdateReducer$ = collapseUpdate$.compose(sampleCombine(data$))
		.map(([collapse, data]) => function reducer(prevState) {

			let newState = clone(prevState);

			newState.validated = true

			// Update UX visibility of this component
			let newUx = clone(prevState.ux);
			newUx.checkSignatureVisible = false;
			newState.ux = newUx;

			// Update query value
			let newBody = clone(prevState.body);
			newBody.query = data.map(x => (x.inL1000) ? x.symbol : '').join(" ").replace(/\s\s+/g, ' ').trim();
			newState.body = newBody;			

			console.log(newState);
			return newState;
		});

  return { 
    HTTP: request$,
    DOM: vdom$,
	onion: xs.merge(
		collapseReducer$, 
		collapseUpdateReducer$)
  }

};

export { SignatureCheck };