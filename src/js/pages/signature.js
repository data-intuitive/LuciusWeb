import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone } from 'ramda';

// Components
import { SignatureForm } from '../components/SignatureForm'
import { Histogram } from '../components/Histogram/Histogram'
import { SimilarityPlot } from '../components/SimilarityPlot/SimilarityPlot'
import { Table } from '../components/Table'

const settings = {
	url : 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.',
	topTableSize : 5
}

const log = (x) => console.log(x);

const initState = {
				validated : true,
				body : {
					version : 'v2',
					// query : 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 HMOX1 -TSEN2',
					query : 'HSPA1A DNAJB1 DDIT4 HMOX1 -TSEN2',
					bins: 20,
					binsX:40,
					binxY:40,
					head: 3
				}, 
				connection : {
					url: settings.url,
				},
				ux : {
					checkSignatureVisible : false,
					histogramVisible : false,
					simplotVisible : false
				}
    };

function SignatureWorkflow(sources) {

	const state$ = sources.onion.state$.debug(log);
    const domSource$ = sources.DOM;
	const vegaSource$ = sources.vega;

	// const feedback$ = vegaSource$.map(item => item.key).startWith(null);

	// const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

    // const initReducer$ = xs.of(() => (initState))
    // .debug(x => console.log(x));

	const formSources = {
		DOM: sources.DOM, 
		HTTP: sources.HTTP,
		onion: sources.onion,
	}

	// Queury Form
	const signatureFormSinks = SignatureForm(formSources);
	const signatureFormDom$ = signatureFormSinks.DOM;
    const signatureFormReducer$ = signatureFormSinks.onion;

	// !!! Remove the startWith when running for real (makes testing easier)
	const query$ = signatureFormSinks.query
						.startWith('BRCA1')

	// Inject the query into the state objects for the table children:
	const stateReducer$ = query$.map(query => prevState => {
		console.log('update state ' + query)
		console.log(query)
		let newState = clone(prevState)
		let additionalState = {
			headTable : {
				query : query
			},
			tailTable : {
				query : query
			}
		}
		return merge(newState,additionalState)
	})

	// Binned Scatter plot
	const histogramSink = Histogram(sources);
	const histogramDom$ = histogramSink.DOM;
	const histogramHTTP$ = histogramSink.HTTP;
	const histogramVega$ = histogramSink.vega;
	const histogramReducer$ = histogramSink.onion

	// Binned Scatter plot
	const SimilarityPlotSink = SimilarityPlot(sources);
	const SimilarityPlotDom$ = SimilarityPlotSink.DOM;
	const SimilarityPlotHTTP$ = SimilarityPlotSink.HTTP;
	const SimilarityPlotVega$ = SimilarityPlotSink.vega;
	const SimilarityPlotReducer$ = SimilarityPlotSink.onion

	// tables
	const headTableProps$ = xs.of({ title: 'Top Table', version: 'v2', head : 5})
	const tailTableProps$ = xs.of({ title: 'Bottom Table', version: 'v2', tail : 5})

	const HeadTable = isolate(Table, 'headTable')(merge(sources, {props: headTableProps$}));
	const TailTable = isolate(Table, 'tailTable')(merge(sources, {props: tailTableProps$}));


    const vdom$ = xs.combine(
                        signatureFormDom$,
						// query$,
						// signatureCheckDom$,
                        // histogramDom$,
						// SimilarityPlotDom$,
						HeadTable.DOM,
						TailTable.DOM,
				)
					.map(([
						form,
						// query,
						// check, 
						// hist, 
						// simplot, 
						headTable, 
						tailTable
					]) => 
						div([
							div('.container',{style: {fontSize: '14px'}},
								[
									div('.row', []),
									form,
									// div('.row ', [div('.col .s7', [
									// // simplot,
									// 	]), div('.col .s5', [
									// // hist,
									// 		])]),
								// div('.row', [
									div('.col .s6', [headTable]),
									div('.col .s6', [tailTable])
								// ])
								])
						])
						);

	return {
        DOM: vdom$,
		onion: xs.merge(
			// initReducer$, 
			signatureFormReducer$,
			stateReducer$,
			// signatureCheckReducer$, 
			// histogramReducer$, 
			// SimilarityPlotReducer$, 
			HeadTable.onion,
			TailTable.onion
			// BottomTableReducer$, 
			),
		vega: xs.merge(
			histogramVega$,
			SimilarityPlotVega$
			),
		HTTP: xs.merge(
			signatureFormSinks.HTTP, 
			// histogramHTTP$, 
			// SimilarityPlotHTTP$, 
			HeadTable.HTTP, 
			TailTable.HTTP
			// BottomTableHTTP$
			),
	};
}

export default SignatureWorkflow;