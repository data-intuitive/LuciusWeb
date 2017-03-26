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

function SignatureCheck(sources) {

	console.log('Starting component: SignatureCheck...');

	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
	const state$ = sources.onion.state$

	// const stateHistory$ = state$
	// 			.fold((acc,x) => acc + '||' + x, 'History:')
	// 			// .debug((x => console.log('----' + x)))

	const request$ = state$
		.compose(debounce(1000))
		.filter(state => state !== '')
		.compose(dropRepeats((x,y) => x === y))
		.map(state =>  {
			let thisUrl = 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.' + 'checkSignature';
			return {
				url : thisUrl,
				method : 'POST',
				send : {
					version : 'v2',
					query : state
				},
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
		.debug(log);

	const data$ = response$
		.map(res => res.body)
		.startWith(emptyData.body)
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
							div('.row'),
							div('.row', [table('.striped', tableContent)]),
							div('.row', [
								button('.collapseUpdate .btn .col .offset-s4 .s4 .pink .accent-4', 'Update/Validate'),
								// button('.collapse .btn .col .offset-s2 .s4 .pink .accent-4', 'Collapse')
								]),
							div('.row')
						])
			);
	}

	// vdom
	const vdom$ = data$
					.map((data) => makeTable(data))

	// Update and Collapse button updates the query and collapses the window
	const collapseUpdate$ = domSource$.select('.collapseUpdate').events('click');
	const collapseUpdateReducer$ = collapseUpdate$.compose(sampleCombine(data$))
		.map(([collapse, data]) => function reducer(prevState) {
			return data.map(x => (x.inL1000) ? x.symbol : '').join(" ").replace(/\s\s+/g, ' ').trim();
		});

	// The result of this component is an event when valid
	const validated$ = collapseUpdate$.map(update => true)

  return { 
    HTTP: request$,
    DOM: vdom$,
	onion: xs.merge(
		collapseUpdateReducer$, 
		),
	validated : validated$
  }

};

export { SignatureCheck };