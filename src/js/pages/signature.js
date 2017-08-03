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
import { Table, headTableLens, tailTableLens } from '../components/Table'
import { initSettings } from './settings'
import { Filter } from '../components/Filter'

function SignatureWorkflow(sources) {

	const state$ = sources.onion.state$
						.debug(state => {
							console.log('== State in signature')
							console.log(state)
						});

	/** 
	 * Parse feedback from vega components. Not used yet...
	 */
	// const feedback$ = sources.vega.map(item => item).startWith(null).debug();
	// const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

	const signatureForm = isolate(SignatureForm, {onion: formLens})(sources)
	const signature$ = signatureForm.output

    // Filter Form
    const filterForm = isolate(Filter, 'filter')({...sources, input: signature$})
    const filter$ = filterForm.output

	// default Reducer, initialization
    const defaultReducer$ = xs.of(prevState => {
        console.log('disease -- defaultReducer')
        if (typeof prevState === 'undefined') {
            return (
                {
                    settings: initSettings,
                    form: {},
                 })
        } else {
             return ({...prevState,
                 settings: prevState.settings, 
                 form: {},
                 })
        }
    })

	// Similarity plot component
	const similarityPlot = isolate(SimilarityPlot, {onion: simLens})
                                  ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

	// Histogram plot component
	const histogram = isolate(Histogram, {onion: histLens})
                            ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

    // tables: Join settings from api and sourire into props
    const headTable = isolate(Table, {onion: headTableLens})
                             ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

    // tables: Join settings from api and sourire into props
    const tailTable = isolate(Table, {onion: tailTableLens})
                             ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

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
			// feedback
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
			filterForm.onion,
			histogram.onion,
			similarityPlot.onion,
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