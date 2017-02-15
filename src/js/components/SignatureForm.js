import { p, div, br, label, input, code, table, tr, td, b, h2, button } from '@cycle/dom';
import { clone } from 'ramda';
import xs from 'xstream';

const log = (x) => console.log(x);

function SignatureForm(sources) {

	console.log('Starting component: SignatureForm...');

	const state$ = sources.onion.state$;
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
										button('.SignatureCheck .btn .col .s5 .pink .accent-4', 'Check Signature'),
										button('.SignatureRun .btn .col .s5 .offset-s2', 'Run Query')
										])
									])
	});

	// const click$ = domSource$.select('.SignatureCheck').events('click').debug(log);
	// let morevdom$ = click$.mapTo('click !').startWith('Nothing in form');

	// const combinedvdom$ = xs.combine(vdom$, morevdom$).map(([vdom, morevdom]) => div([vdom, h2('', morevdom)]));

	const newQuery$ = domSource$.select('.Query')
			.events('input')
			.map(ev => ev.target.value);

	const reducer$ = newQuery$.map(
		query => function reducer(prevState) {
			let newState = clone(prevState);
			let newBody = clone(prevState.body);
			newBody.query = query;
			newState.body = newBody;
			return newState;
		}); //.debug(log);

  return { 
    	DOM: vdom$,
		onion: reducer$
  };

}

export { SignatureForm };