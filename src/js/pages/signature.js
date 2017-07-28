import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'

// Components
import { SignatureForm, formLens } from '../components/SignatureForm'
import { Histogram, histLens } from '../components/Histogram/Histogram'
import { SimilarityPlot, simLens } from '../components/SimilarityPlot/SimilarityPlot'
import { Table } from '../components/Table'
import { initSettings } from './settings'
import { Filter } from '../components/Filter'

const log = (x) => console.log(x);

function SignatureWorkflow(sources) {

	const state$ = sources.onion.state$.debug(state => {
		console.log('== State in signature')
		console.log(state)
	});

	/** 
	 * Parse feedback from vega components. Not used yet...
	 */
	// const feedback$ = sources.vega.map(item => item).startWith(null).debug();
	// const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

	const signatureForm = isolate(SignatureForm, {onion: formLens})(sources)

	// Filter Form
	const filterForm = isolate(Filter, 'filter')(sources)

	// Propagate filter to state of individual components
	const filterReducer$ = filterForm.filter.map(f => prevState => {
		console.log('signature -- filterReducer')
		console.log(prevState)
			let additionalState = {
			headTable: merge(prevState.headTable, { filter: f }),
			tailTable: merge(prevState.tailTable, { filter: f }),
			hist: merge(prevState.hist, { filter: f }),
			sim: merge(prevState.sim, { filter: f })
		}
		return merge(prevState, additionalState)
	})

	// Query updated in signatureForm, so push it to the other components
	const query$ = signatureForm.query

	// Initialize if not yet done in parent (i.e. router) component (useful for testing)
	const defaultReducer$ = xs.of(prevState => {
		console.log('signature -- defaultReducer')
		if (typeof prevState === 'undefined') {
			return {
				settings: initSettings,
				}
		} else {
			return {...prevState,
				settings: prevState.settings
			}
		}
	})

	// Propagate query to state of individual components
	const stateReducer$ = query$.map(query => prevState => {
		console.log('signature -- stateReducer')
		console.log(prevState)
		let additionalState = {
			headTable: merge(prevState.headTable, { query: query }),
			tailTable: merge(prevState.tailTable, { query: query }),
			hist: merge(prevState.hist, { query: query }),
			sim: merge(prevState.sim, { query: query }),
			filter: {}
		}
		return merge(prevState, additionalState)
	})

	// Similarity plot component
	const similarityPlot = isolate(SimilarityPlot, {onion: simLens})(sources);

	// histogram component
	const histogram = isolate(Histogram, {onion: histLens})(sources);

	// tables: Join settings from api and sourire into props
	const headTableProps$ = state$
		.compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
		.startWith({ settings: initSettings })
		.map(state => merge(merge(merge(state.settings.headTableSettings, state.settings.common), state.settings.api), state.settings.sourire)).debug()
	const tailTableProps$ = state$
		.compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
		.startWith({ settings: initSettings })
		.map(state => merge(merge(merge(state.settings.tailTableSettings, state.settings.common), state.settings.api), state.settings.sourire))
	const headTable = isolate(Table, 'headTable')(merge(sources, { props: headTableProps$ }));
	const tailTable = isolate(Table, 'tailTable')(merge(sources, { props: tailTableProps$ }));

	const pageStyle = {
		style:
		{
			fontSize: '14px',
			opacity: '0',
			transition: 'opacity 1s',
			delayed: { opacity: '1' },
			destroy: { opacity: '0' }
		}
	}

	const vdom$ = xs.combine(
		signatureForm.DOM,
		filterForm.DOM,
		histogram.DOM,
		similarityPlot.DOM,
		headTable.DOM,
		tailTable.DOM,
		// feedback$
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
			div('.row .pink .lighten-5  ', [
				form,
				div('.col .s10 .offset-s1', pageStyle,
					[
						div('.row', [filter]),
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
	};
}

export default SignatureWorkflow;