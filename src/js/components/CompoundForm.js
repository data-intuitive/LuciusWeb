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
import { SignatureGenerator, signatureLens } from './SignatureGenerator'
import { stateDebug } from '../utils/utils'

function CompoundForm(sources) {

    const state$ = sources.onion.state$.debug()

    const CompoundCheckSink = isolate(CompoundCheck, {onion: checkLens} )(sources)
    const compoundQuery$ = CompoundCheckSink.output

    const SampleSelectionSink = isolate(SampleSelection, {onion: sampleSelectionLens})({...sources, input: compoundQuery$})
    const sampleSelection$ = SampleSelectionSink.output

    const SignatureGeneratorSink = isolate(SignatureGenerator, {onion: signatureLens})({...sources, input: sampleSelection$ })
    const signature$ = SignatureGeneratorSink.output

    const vdom$ = xs.combine(
        CompoundCheckSink.DOM,
        SampleSelectionSink.DOM,
        SignatureGeneratorSink.DOM,
        // state$
        )
        .map(([
            formDom, 
            selectionDOM, 
            signatureDOM,
            // state
        ]) =>
            div([
                formDom,
                selectionDOM,
                div('.col .s10 .offset-s1', [
                    div('.row', [
                        div('.col .s12', [
                            signatureDOM
                        ])
                    ])
                ])
            ]))

    const defaultReducer$ = xs.of(prevState => {
        console.log('CompoundForm -- default Reducer')
        return ({...prevState, sampleSelection: {}, check: {}, signature: {}})
    })

    return {
        DOM: vdom$,
        onion: xs.merge(
            // defaultReducer$,
            CompoundCheckSink.onion,
            SampleSelectionSink.onion,
            SignatureGeneratorSink.onion
        ),
        HTTP: xs.merge(
            CompoundCheckSink.HTTP,
            SampleSelectionSink.HTTP,
            SignatureGeneratorSink.HTTP
        ),
        output: signature$
    }
}

export { CompoundForm }