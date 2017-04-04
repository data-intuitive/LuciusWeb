import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'

// Components
import { SignatureForm } from '../components/SignatureForm'
import { Histogram } from '../components/Histogram/Histogram'
import { SimilarityPlot } from '../components/SimilarityPlot/SimilarityPlot'
import { Table } from '../components/Table'
import { initSettings } from './settings'
import { Filter } from '../components/Filter'

const log = (x) => console.log(x);

function SignatureWorkflow(sources) {

	const state$ = sources.onion.state$.debug(state => {
		console.log('== State in signature =================')
		console.log(state)
	});

	/** 
	 * Parse feedback from vega components. Not used yet...
	 */
	const feedback$ = sources.vega.map(item => item).startWith(null).debug();
	// const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

	// Queury Form
	const signatureForm = SignatureForm(sources)

	// Filter Form
	const filter = isolate(Filter, 'filter')(sources)

	// Propagate filter to state of individual components
	const filterReducer$ = filter.filter.map(f => prevState => {
			console.log('signature -- filterReducer')
			let additionalState = {
				headTable : merge(prevState.headTable, {filter : f}),
				tailTable : merge(prevState.tailTable, {filter : f}),
				hist : merge(prevState.hist, {filter : f}),
				sim : merge(prevState.sim, {filter : f})
			}
			return merge(prevState, additionalState)
	})

	// Query updated in signatureForm, so push it to the other components
	const query$ = signatureForm.query

	// Initialize if not yet done in parent (i.e. router) component (useful for testing)
	const defaultReducer$ = xs.of(prevState => {
		console.log('signature -- defaultReducer')
		if (typeof prevState === 'undefined') {
			return (
				{
					settings : initSettings,
				})
		} else {
			return prevState
		}
	})

	// Propagate query to state of individual components
	const stateReducer$ = query$.map(query => prevState => {
			console.log('signature -- stateReducer')
			let additionalState = {
				headTable : merge(prevState.headTable, {query : query}),
				tailTable : merge(prevState.tailTable, {query : query}),
				hist : merge(prevState.hist, {query : query}),
				sim : merge(prevState.sim, {query : query})
			}
			return merge(prevState,additionalState)
	})

	// Similarity plot component
	const simProps$ = state$
				.compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
				.startWith({settings: initSettings})
				.map(state => merge(state.settings.sim, state.settings.api))
	const similarityPlot = isolate(SimilarityPlot, 'sim')(merge(sources, {props: simProps$}));

	// histogram component
	const histProps$ = state$
				.compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
				.startWith({settings: initSettings})
				.map(state => merge(state.settings.hist, state.settings.api))
	// const histProps$ = xs.of({hist : bins})
	const histogram = isolate(Histogram, 'hist')(merge(sources, {props: histProps$}));

	// tables
	// const headTableProps$ = xs.of({ title: 'Top Table', version: 'v2', head : 10, color: 'rgb(44,123,182)'})
	const headTableProps$ = state$
				.compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
				.startWith({settings: initSettings})
				.map(state => merge(state.settings.headTableSettings, state.settings.api))
	// const tailTableProps$ = xs.of({ title: 'Bottom Table', version: 'v2', tail : 10, color: 'rgb(215,25,28)'})
	const tailTableProps$ = state$
				.compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
				.startWith({settings: initSettings})
				.map(state => merge(state.settings.tailTableSettings, state.settings.api))
	const headTable = isolate(Table, 'headTable')(merge(sources, {props: headTableProps$}));
	const tailTable = isolate(Table, 'tailTable')(merge(sources, {props: tailTableProps$}));

	const pageStyle = {style: 
		{
			fontSize: '14px', 
			opacity: '0', 
			transition: 'opacity 1s', 
			delayed: {opacity: '1'}, 
			destroy: {opacity: '0'}}
	} 

    const vdom$ = xs.combine(
                        signatureForm.DOM,
						filter.DOM,
                        histogram.DOM,
						similarityPlot.DOM,
						headTable.DOM,
						tailTable.DOM,
						feedback$
				)
					.map(([
						form,
						filter,
						hist, 
						simplot,
						headTable, 
						tailTable,
						feedback
					]) => 
						div('.row .green .lighten-5 ', [
							// div('.col .s10 .offset-s1', pageStyle,
							// 	[
							// 		div('.row', []),
							// div('.col .s12',
							// 	[
									form,
							// 	]
							// ),
							div('.col .s10 .offset-s1', pageStyle,
								[
									// div('.row', []),
									// form,
									div('.row', [filter]),
									// Don't show feedback for now!
									// div('.pre', [JSON.stringify(feedback)]),
									// on mobile: under each other
									// on large screen: next to each other
									div('.row ', [div('.col .s12 .l7', [
											simplot,
												]), div('.col .s12 .l5', [
											hist,
									])]),
									div('.row', []),
									div('.col .s12', [headTable]),
									div('.row', []),
									div('.col .s12', [tailTable])
								])
						])
						);

	return {
		DOM: vdom$,
		onion: xs.merge(
			defaultReducer$,
			signatureForm.onion,
			filterReducer$,
			stateReducer$,
			headTable.onion,
			tailTable.onion
			),
		vega: xs.merge(
			histogram.vega,
			similarityPlot.vega
			),
		HTTP: xs.merge(
			signatureForm.HTTP,
			histogram.HTTP, 
			similarityPlot.HTTP,
			headTable.HTTP, 
			tailTable.HTTP
			),
		// router: xs.of('/signature')
	};
}

export default SignatureWorkflow;