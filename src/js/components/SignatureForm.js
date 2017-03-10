import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i,p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a } from '@cycle/dom';
import { clone } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { search, play_arrow } from 'webpack-material-design-icons'
import { SignatureCheck } from '../components/SignatureCheck'
import dropRepeats from 'xstream/extra/dropRepeats'

function SignatureForm(sources) {

	console.log('Starting component: SignatureForm...');

	const state$ = sources.onion.state$
	const domSource$ = sources.DOM;
	const props$ = sources.props;

	// Check Signature subcomponent, via isolation
	const signatureCheckSink = isolate(SignatureCheck, 'query')(sources)
	const signatureCheckDom$ = signatureCheckSink.DOM;
	const signatureCheckHTTP$ = signatureCheckSink.HTTP;
	const signatureCheckReducer$ = signatureCheckSink.onion;

	// Valid query?
	const validated$ = state$.map(state => state.validated)

	const vdom$ = xs.combine(state$, signatureCheckDom$, validated$)
					.map(
						([state, checkdom, validated]) => {
							const query = state.query
							return div(
									[  
										 div('.row', []),
										 div('.row', [
											// label('Query: '),
											i('.col .s1 .large .material-icons .grey-text', {style: {fontSize: '45px', fontColor: 'gray'}}, 'search'),
											// textarea('.Query .col s11 .materialize-textarea', {style: {fontSize: '20px'} , props: {type: 'text', value: query.trim()}, value: query.trim()}),
											input('.Query .col s10', {style: {fontSize: '20px'} , props: {type: 'text', value: query}, value: query}),
											// div('.row', [
												// div('.col .s1'),
												(validated) 
												? div('.SignatureCheck .waves-effect .col .s1', [
													i('.large .material-icons', {style: {fontSize: '45px', fontColor: 'grey'}}, 'play_arrow')])
												: div('.SignatureCheck .col .s1', [
													i('.large .material-icons .grey-text .text-lighten-2', {style: {fontSize: '45px', fontColor: 'grey'}}, 'play_arrow')])
											// ])
										]),
										(!validated) ? checkdom : div()
									])
	});

	// Update in query, or simply ENTER
	const newQuery$ = xs.merge(
				// state$.map(state => state.query),
				domSource$.select('.Query').events('input').map(ev => ev.target.value)
			)

	// Updated state is propagated and picked up by the necessary components
	const click$ = domSource$.select('.SignatureCheck').events('click')
    const enter$ = domSource$.select('.Query').events('keydown').filter(({keyCode, ctrlKey}) => keyCode === ENTER_KEYCODE && ctrlKey === false) ;
	const update$ = xs.merge(click$, enter$).debug(log)

	// Takes care of initialization
	const defaultReducer$ = xs.of(function defaultReducer(prevState) {
		// console.log('Default reducer ...')
        if (typeof prevState === 'undefined') {
			return {
				query : 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2',
				validated : false
			}
        } else {
            return prevState;
        }
    });

	// Update the state when input changes
	const queryReducer$ = newQuery$.map(query => prevState => {
		// console.log('Reducing state with update ' + query)
		let newState = clone(prevState)
		console.log(newState)
		newState.query = query
		return newState
	})

	// invalidates the query when input changes
	const invalidateReducer$ = newQuery$.map(query => prevState => {
		// console.log('Invalidate !!!!')
		let newState = clone(prevState)
		newState.validated = false
		return newState
	})

	// Validates the state when validated from check
	const validateReducer$ = signatureCheckSink.validated
		// .compose(sampleCombine(state$))
		// .map(([update, query]) => prevState => {
		.map(signal => prevState => {
			// console.log('Validate !!!!')
			let newState = clone(prevState)
			newState.validated = true
			return newState
		})

	// When update is clicked, update the query. Onionify does the rest
	const childReducer$ = signatureCheckReducer$

	// When GO clicked or enter -> send updated 'value' to sink
	// Maybe catch when no valid query?
	const query$ = update$
		.compose(sampleCombine(state$))
		.map(([update, state]) => state.query)
		// .startWith(null).debug(log)

  return { 
    	DOM: vdom$,
		onion: xs.merge(
			defaultReducer$, 
			childReducer$,
			invalidateReducer$,
			validateReducer$,
			queryReducer$
			),
		HTTP: signatureCheckHTTP$,
		query: query$
  };

}

export { SignatureForm };