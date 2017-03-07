import sampleCombine from 'xstream/extra/sampleCombine'
import { p, div, br, label, input, code, table, tr, td, b, h2, button } from '@cycle/dom';
import { clone } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'

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
									[ label('Query: '),
										input('.Query', {style: {fontSize: '20px'} , props: {type: 'text', value: query}, value: query}),
										div('.row', [
											div('.col .s1'),
											button('.SignatureCheck .btn .col .s4 .pink .accent-4', 'Check Signature (ENTER)'),
											div('.col .s2'),
											button('.SignatureRun .btn .col .s4 .offset-s2', 'Run Query (CTRL-ENTER)'),
											div('.col s1')
										])
									])
	});

	// Update in query, or simply ENTER
	const newQuery$ = xs.merge(
				// state$.map(state => state.body.query),
				domSource$.select('.Query').events('input').map(ev => ev.target.value)
			)

	// Update happened elsewhere (SignatureCheck?)
	const newQueryValid$ = state$.map(state => state.body.query)

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