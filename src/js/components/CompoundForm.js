import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { CompoundCheck, checkLens } from './CompoundCheck'
import { SampleSelection, sampleSelectionLens } from './SampleSelection'
import { mergeWith, merge } from 'ramda'
import { SignatureGenerator } from './SignatureGenerator'
import { stateDebug } from '../utils/utils'

function CompoundForm(sources) {

    const state$ = sources.onion.state$
                    // .debug(stateDebug('form'))


    // sources.HTTP.select('compounds').flatten().debug()

    const CompoundCheckSink = isolate(CompoundCheck, {onion: checkLens} )(sources)

    const compoundQuery$ = CompoundCheckSink.output

    const SampleSelectionSink = isolate(SampleSelection, {onion: sampleSelectionLens})({...sources, input: compoundQuery$})
    const sampleSelection$ = SampleSelectionSink.output

    // const SignatureGeneratorSink = isolate(SignatureGenerator, 'signatureGenerator')(merge(sources, { query: sampleSelection$ }))
    // const signature$ = SignatureGeneratorSink.signature

    const vdom$ = xs.combine(
        CompoundCheckSink.DOM,
        SampleSelectionSink.DOM,
        // SignatureGeneratorSink.DOM
        )
        .map(([
            formDom, 
            selectionDOM, 
            // signatureDOM
            ]) =>
            div([
                formDom,
                selectionDOM,
                div('.col .s10 .offset-s1', [
                    div('.row', [
                        div('.col .s12', [
                            // signatureDOM
                        ])
                    ])
                ])
            ])).startWith(div())

	// Takes care of initialization
	const defaultReducer$ = xs.of(function defaultReducer(prevState) {
		console.log('CompoundForm -- defaultReducer')
        if (typeof prevState === 'undefined') {
			// Settings are handled higher up, but in case we use this component standalone, ...
			console.log('prevState not exists')
			return {
				form: {
					check : {
                        query: ''
                    },
				},
				settings : initSettings
			}
        } else {
			console.log('prevState exists:')
			console.log(prevState)
            let newState = {...prevState,
				form: {
                    check: {},
                    sampleSelection: {}
				},
		    }
            console.log(newState)
			return (prevState) // !!!!!!!!!!!!!
        }
    });

    return {
        DOM: vdom$,
        onion: xs.merge(
            // defaultReducer$,
            CompoundCheckSink.onion,
            SampleSelectionSink.onion,
        ),
        HTTP: xs.merge(
            CompoundCheckSink.HTTP,
            SampleSelectionSink.HTTP,
            // SignatureGeneratorSink.HTTP
        ),
        // signature: signature$
    }
}

export { CompoundForm }