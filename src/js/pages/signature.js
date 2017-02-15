// import Stream from 'xstream';
import { div, br, label, input, p, button, code, pre } from '@cycle/dom';
import { SignatureForm } from '../components/SignatureForm';
import xs from 'xstream';
import { SignatureCheck } from '../components/SignatureCheck';
// import { Histogram } from '../components/histogram/Histogram';
import isolate from '@cycle/isolate';
import {vegaHistogramSpec, exampleData} from '../components/Histogram/spec';

const log = (x) => console.log(x);

const initState = {
				body : {
					version : 'v2',
					query : 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 HMOX1 -TSEN2',
					bins: 20
				},
				connection : {
					url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.',
				},
				ux : {
					checkSignatureVisible : false
				}
    };

function SignatureWorkflow(sources) {

    const state$ = sources.onion.state$;
    const domSource$ = sources.DOM;
	const vegaSource$ = sources.vega;

	// const feedback$ = vegaSource$.map(item => item.key).startWith(null);

	// const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

    const reducer$ = xs.of(() => (initState))
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
	// const newState$ = signatureCheckSink.onion.state$;
	const signatureCheckReducer$ = signatureCheckSink.onion;

	// Binned Scatter plot
	// const histogramSink = Histogram(
	// 	{
	// 		DOM: sources.DOM,
	// 		state: signatureCheckSink.state,
	// 		HTTP: sources.HTTP,
	// 		vega: sources.vega
	// 	}
	// );
	// const histogramDom$ = histogramSink.DOM;
	// const histogramHTTP$ = histogramSink.HTTP;
	// const histogramState$ = histogramSink.state;
	// const newVega = histogramSink.vega;

	// Merging

	// HTTP
	// const mergedHTTP$ = $.merge(
	// 	signatureCheckHTTP$,
	// 	histogramHTTP$
	// );

	// DOM: Combine Form and Check
	// const vdom$ = $.combineLatest(
	// 	signatureFormDom$, signatureCheckDom$, histogramDom$,
	// 	(x,y,z) => div([ x, y, div('.p2', z ) ])
	// );

    // const vdom$ = signatureFormDom$;

    const vdom$ = xs.combine(
                        signatureFormDom$,
                        xs.of(div('#vega')),
						signatureCheckDom$)
					.map(([form, svg, check, obj]) => div('.container',{style: {fontSize: '20px'}},[form, check, ]));
					// .map(([form, svg, check, obj]) => div('.container',{style: {fontSize: '20px'}},[form, check, p('clicked on: ' + ((obj != null) ? obj : "nothing yet"))]));

    const vegaSpec$ = xs.of(vegaHistogramSpec(exampleData, 400, 250)).remember();

	// const HTTPLogger$ = $.catch(mergedHTTP$);
	// HTTPLogger$.subscribe( 
	// 	data => console.log(data),
	// 	err => console.log(err)
	// 	);

	// const stateLogger$ = $.catch(histogramState$);
	// stateLogger$.subscribe( 
	// 	data => console.log(data),
	// 	err => console.log(err)
	// 	);

	// histogramState$.map(x => console.log(x));

//, signatureCheckReducer$

	return {
        DOM: vdom$,
		onion: xs.merge(reducer$, signatureFormReducer$, signatureCheckReducer$),
		vega: vegaSpec$,
		// router: xs.of('/signature')
		// state: state$,
		HTTP: signatureCheckHTTP$,
	};
}

export default SignatureWorkflow;