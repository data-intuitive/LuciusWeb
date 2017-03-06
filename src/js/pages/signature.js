import { div, br, label, input, p, button, code, pre } from '@cycle/dom'
import { SignatureForm } from '../components/SignatureForm'
import xs from 'xstream'
import { SignatureCheck } from '../components/SignatureCheck'
import { Histogram } from '../components/Histogram/Histogram'
import { SimilarityPlot } from '../components/SimilarityPlot/SimilarityPlot'
import { Table } from '../components/Table'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'

const settings = {
	url : 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.',
	topTableSize : 5
}

const log = (x) => console.log(x);

const initState = {
				body : {
					version : 'v2',
					query : 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 HMOX1 -TSEN2',
					bins: 20,
					binsX:40,
					binxY:40,
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

    const state$ = sources.onion.state$;
    const domSource$ = sources.DOM;
	const vegaSource$ = sources.vega;

	// const feedback$ = vegaSource$.map(item => item.key).startWith(null);

	// const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

    const initReducer$ = xs.of(() => (initState))
    // .debug(x => console.log(x));

	// Queury Form
    const signatureFormSinks = SignatureForm(sources);
	const signatureFormDom$ = signatureFormSinks.DOM;
	// const signatureFomState$ = signatureFormSinks.state;
    const signatureFormReducer$ = signatureFormSinks.onion;

	// Check Signature
	const signatureCheckSink = SignatureCheck(sources);
	const signatureCheckDom$ = signatureCheckSink.DOM;
	const signatureCheckHTTP$ = signatureCheckSink.HTTP;
	const signatureCheckReducer$ = signatureCheckSink.onion;

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

	// Table HEAD
	const topNProps$ = xs.combine(state$, xs.of({ body : { head: settings.topTableSize } }))
						 .map(([state, toMerge]) => mergeWith(merge, state, toMerge))

	const TopTableSink = Table(sources, topNProps$);
	const TopTableDom$ = TopTableSink.DOM;
	const TopTableHTTP$ = TopTableSink.HTTP;
	const TopTableVega$ = TopTableSink.vega;
	const TopTableReducer$ = TopTableSink.onion

	// Table TAIL
	const bottomNProps$ = xs.combine(state$, xs.of({ body : { tail: settings.topTableSize } }))
							.map(([state, toMerge]) => mergeWith(merge, state, toMerge))

	const BottomTableSink = Table(sources, bottomNProps$);
	const BottomTableDom$ = BottomTableSink.DOM;
	const BottomTableHTTP$ = BottomTableSink.HTTP;
	const BottomTableVega$ = BottomTableSink.vega;
	const BottomTableReducer$ = BottomTableSink.onion

    const vdom$ = xs.combine(
                        signatureFormDom$,
						signatureCheckDom$,
                        histogramDom$,
						SimilarityPlotDom$,
						TopTableDom$,
						BottomTableDom$)
					.map(([form, check, hist, simplot, tableHead, tableTail]) => 
						div('.container',{style: {fontSize: '14px'}},
							[
								div('.row', []),
								form, 
								check,
								div('.row ', [div('.col .s7', [
								simplot,
									]), div('.col .s5', [
								hist,
										])]),
								tableHead,
								tableTail
							]
							)
						);

	return {
        DOM: vdom$,
		onion: xs.merge(initReducer$, signatureFormReducer$, signatureCheckReducer$, histogramReducer$, SimilarityPlotReducer$, TopTableReducer$, BottomTableReducer$),
		vega: xs.merge(histogramVega$,SimilarityPlotVega$),
		HTTP: xs.merge(signatureCheckHTTP$, histogramHTTP$, SimilarityPlotHTTP$, TopTableHTTP$, BottomTableHTTP$),
	};
}

export default SignatureWorkflow;