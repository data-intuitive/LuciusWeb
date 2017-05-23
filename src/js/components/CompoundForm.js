import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { CompoundCheck } from './CompoundCheck'
import { SampleSelection } from './SampleSelection'
import { mergeWith, merge } from 'ramda'
import { SignatureGenerator } from './SignatureGenerator'

function CompoundForm(sources) {

    const CompoundCheckSink = isolate(CompoundCheck, 'compoundQuery')(sources)

    const compoundQuery$ = CompoundCheckSink.query

    const SampleSelectionSink = isolate(SampleSelection, 'sampleSelection')(merge(sources, { query: compoundQuery$ }))
    const sampleSelection$ = SampleSelectionSink.selection

    const SignatureGeneratorSink = isolate(SignatureGenerator, 'signatureGenerator')(merge(sources, { query: sampleSelection$ }))
    const signature$ = SignatureGeneratorSink.signature

    const vdom$ = xs.combine(
        CompoundCheckSink.DOM,
        SampleSelectionSink.DOM.startWith(''),
        SignatureGeneratorSink.DOM)
        .map(([formDom, selectionDOM, signatureDOM]) =>
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

    return {
        DOM: vdom$,
        onion: xs.merge(
            CompoundCheckSink.onion,
            SampleSelectionSink.onion,
        ),
        HTTP: xs.merge(
            CompoundCheckSink.HTTP,
            SampleSelectionSink.HTTP,
            SignatureGeneratorSink.HTTP
        ),
        signature: signature$
    }
}

export { CompoundForm }