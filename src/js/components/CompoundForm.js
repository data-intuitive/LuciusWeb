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
import { loggerFactory } from '~/../../src/js/utils/logger'

function CompoundForm(sources) {

    const logger = loggerFactory('compoundForm', sources.onion.state$, 'settings.debug')

    const state$ = sources.onion.state$

    const CompoundCheckSink = isolate(CompoundCheck, {onion: checkLens} )(sources)
    const compoundQuery$ = CompoundCheckSink.output.remember()

    const SampleSelectionSink = isolate(SampleSelection, {onion: sampleSelectionLens})({...sources, input: compoundQuery$})
    const sampleSelection$ = SampleSelectionSink.output.remember()

    const SignatureGeneratorSink = isolate(SignatureGenerator, {onion: signatureLens})({...sources, input: sampleSelection$ })
    const signature$ = SignatureGeneratorSink.output.remember()

    const vdom$ = xs.combine(
        CompoundCheckSink.DOM.startWith(div()),
        SampleSelectionSink.DOM,
        SignatureGeneratorSink.DOM,
        )
        .map(([
            formDom, 
            selectionDOM, 
            signatureDOM,
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
        // CompoundForm -- default Reducer
        return ({...prevState, form: {}, sampleSelection: {}, signature: {}})
    })

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            CompoundCheckSink.log,
            SampleSelectionSink.log,
            SignatureGeneratorSink.log
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            CompoundCheckSink.onion,
            SampleSelectionSink.onion,
            SignatureGeneratorSink.onion
        ),
        HTTP: xs.merge(
            CompoundCheckSink.HTTP,
            SampleSelectionSink.HTTP,
            SignatureGeneratorSink.HTTP
        ),
        output: signature$,
        modal: SignatureGeneratorSink.modal,
        ac: CompoundCheckSink.ac
    }
}

export { CompoundForm }