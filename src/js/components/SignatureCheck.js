import xs from 'xstream';
import { p, div, br, label, input, code, table, tr, th, td, b, h2, button, thead, tbody, i, h, hr } from '@cycle/dom';
import { clone, equals } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine'
import {log, logThis} from '../utils/logger'
import {ENTER_KEYCODE} from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

import { check, flash, play_arrow } from 'webpack-material-design-icons'

const emptyData = {
	body: {
		result: {
			data : []
		}
	}
}

const stateTemplate = {
	query: 'The query to send to the checkSignature endpoint',
	settings: 'settings passed from root state'
}

const checkLens = { 
	get: state => ({query: state.form.query, settings: state.settings}),
	set: (state, childState) => ({...state, form : {...state.form, query: childState.query}})
};

function SignatureCheck(sources) {

	console.log('Starting component: SignatureCheck...');

	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const state$ = sources.onion.state$
	// .debug(state => {
	// 	console.log('== State in Signaturecheck')
	// 	console.log(state)
	// });

	const request$ = state$
		.filter((state) => state.query !== '')
		.compose(debounce(200))
		.map(state =>  {
			return {
				url : state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.checkSignature',
				method : 'POST',
				send : {
					version : 'v2',
					query : state.query
				},
				'category' : 'checkSignature'
		}})
		.debug();

	// Catch the response in a stream
	// Handle errors by returning an empty object
	const response$ = httpSource$
		.select('checkSignature')
		.map((response$) =>
				response$.replaceError(() => xs.of(emptyData))
			)		
		.flatten()
		.debug(log);

	const data$ = response$
		.map(res => res.body)
		.map(json => json.result.data)

	// Helper function for rendering the table, based on the state
	const makeTable = (data) => {
			// let visible = visible1 //state.ux.checkSignatureVisible;
			let rows = data.map(entry => [ 
				(entry.inL1000) ? td([i('.small .material-icons', 'done')] ) : td('.red .lighten-4 .red-text .text-darken-4', [i('.small .material-icons', 'mode_edit')] ),
				(entry.inL1000) ? td(entry.query) : td('.red .lighten-4 .red-text .text-darken-4', entry.query),
				(entry.inL1000) ? td(entry.symbol) : td('.red .lighten-4 .red-text .text-darken-4', entry.symbol)
			]);
			const header = tr([
								th('In L1000?'),
								th('Input'),
								th('Symbol')
					]);

			let body = [];
			rows.map(row => body.push(tr(row)));
			const tableContent = [thead([header]), tbody(body)];

			return ( 
					div([
							div('.row', [
								div('.col .s6 .offset-s3', [table('.striped', tableContent)]),
								div('.row .s6 .offset-s3', [
									button('.collapseUpdate .btn .col .offset-s4 .s4 .pink .darken-2', 'Update/Validate'),
									]),
							])
						])
			);
	}

	// vdom
	const vdom$ = data$
					.map((data) => makeTable(data))
					.startWith(div())

	// Update and Collapse button updates the query and collapses the window
	const collapseUpdate$ = domSource$.select('.collapseUpdate').events('click');
	const collapseUpdateReducer$ = collapseUpdate$.compose(sampleCombine(data$))
		.map(([collapse, data]) => prevState => {
			return ({...prevState, query : data.map(x => (x.inL1000) ? x.symbol : '').join(" ").replace(/\s\s+/g, ' ').trim()});
		});

	// The result of this component is an event when valid
	// XXX: stays true the whole cycle, so maybe tackle this as well!!!!
	const validated$ = collapseUpdate$.map(update => true)

	// const defaultReducer$ = xs.of(prevState => {return {query : 'TEST123'}})

  return { 
    HTTP: request$,
    DOM: vdom$,
	onion: xs.merge(
		// defaultReducer$.debug(),
		collapseUpdateReducer$, 
		),
	validated : validated$
  }

};

export { SignatureCheck, checkLens };