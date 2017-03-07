import sampleCombine from 'xstream/extra/sampleCombine'
import { i,p, div, br, label, input, code, table, tr, td, b, h2, button, textarea } from '@cycle/dom';
import { clone } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { search } from 'webpack-material-design-icons' 

function SignatureForm(sources) {

	console.log('Starting component: SignatureForm...');

	const state$ = sources.onion.state$.debug(log);
	const domSource$ = sources.DOM;

	const vdom$ = state$
					.debug(x => console.log('>> Query in form vdom: ' + x.body.query))
					.map(
						(state) => {
							const query = state.body.query;
							return div(
									[  
										 div('.row', []),
										 div('.row', [
											// label('Query: '),
											i('.col .s1 .large .material-icons', {style: {fontSize: '45px', fontColor: 'gray'}}, 'search'),
											textarea('.Query .col s11 .materialize-textarea', {style: {fontSize: '20px'} , props: {type: 'text', value: query.trim()}, value: query.trim()}),
											// div('.row', [
											// 	// div('.col .s1'),
											// 	// button('.SignatureCheck .btn .col .s4 .pink .accent-4', 'Check Signature (ENTER)'),
											// 	// div('.col .s2'),
											// 	// button('.SignatureRun .btn .col .s4 .offset-s2', 'Run Query (CTRL-ENTER)'),
											// 	// div('.col s1')
											// ])
										])
									])
	});

	// Update in query, or simply ENTER
	const newQuery$ = xs.merge(
				// state$.map(state => state.body.query),
				domSource$.select('.Query').events('input').map(ev => ev.target.value)
			)

	// Update happened elsewhere (SignatureCheck?)
	const newQueryValid$ = state$
				.map(state => state.body.query.replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim())

	// Signature check: Update state on click
	// Updated state is propagated and picked up by the necessary components
	const click$ = domSource$.select('.SignatureCheck').events('click')
    const enter$ = domSource$.select('.Query').events('keydown').filter(({keyCode, ctrlKey}) => keyCode === ENTER_KEYCODE && ctrlKey === false) ;
	const update$ = xs.merge(click$, enter$)

	const reducer$ = update$.compose(sampleCombine(newQuery$))
						.map(
							([x, query]) => function reducer(prevState) {
								let newState = clone(prevState);
								let newBody = clone(prevState.body);
								newState.validated = false
								newBody.query = query;
								newState.body = newBody;
								let newUx = clone(prevState.ux);
								newUx.checkSignatureVisible = true;
								newState.ux = newUx;
								return newState;
							});

	const validReducer$ = update$.compose(sampleCombine(newQueryValid$))
						.map(
							([x, query]) => function reducer(prevState) {
								let newState = clone(prevState);
								let newBody = clone(prevState.body);
								// newState.validated = true
								newBody.query = query;
								newState.body = newBody;
								let newUx = clone(prevState.ux);
								newUx.checkSignatureVisible = true;
								newState.ux = newUx;
								return newState;
							});

  return { 
    	DOM: vdom$,
		onion: xs.merge(reducer$, 
						validReducer$
						)
  };

}

export { SignatureForm };