import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { TargetCheck, checkLens } from './TargetCheck'
import { SampleSelection, sampleSelectionLens } from './SampleSelection'
import { mergeWith, merge } from 'ramda'
import { SignatureGenerator, signatureLens } from './SignatureGenerator'
import { stateDebug } from '../utils/utils'
import { loggerFactory } from '~/../../src/js/utils/logger'

function TargetForm(sources) {

    const logger = loggerFactory('targetForm', sources.onion.state$, 'settings.debug.form')

    const state$ = sources.onion.state$

    const TargetCheckSink = isolate(TargetCheck, {onion: checkLens} )(sources)
    const targetQuery$ = TargetCheckSink.output.remember()

    // const SampleSelectionSink = isolate(SampleSelection, {onion: sampleSelectionLens})({...sources, input: TargetQuery$})
    // const sampleSelection$ = SampleSelectionSink.output.remember()

    // const SignatureGeneratorSink = isolate(SignatureGenerator, {onion: signatureLens})({...sources, input: sampleSelection$ })
    // const signature$ = SignatureGeneratorSink.output.remember()

    const vdom$ = xs.combine(
        TargetCheckSink.DOM, //.startWith(p('test')),
        targetQuery$.startWith('')
        // SampleSelectionSink.DOM,
        // SignatureGeneratorSink.DOM,
        )
        .map(([
            formDom, 
            targetQuery
            // selectionDOM, 
            // signatureDOM,
        ]) =>
            div([
                formDom,
                // selectionDOM,
                div('.col .s10 .offset-s1', [
                    div('.row', [
                        div('.col .s12', [
                            // targetQuery
                            // signatureDOM
                        ])
                    ])
                ])
            ]))

    const defaultReducer$ = xs.of(prevState => {
        // TargetForm -- default Reducer
        return ({...prevState, form: {}, compoundTable: {}})
    })

    return {
        log: xs.merge(
            // logger(state$, 'state$'),
            // logger(targetQuery$, 'targetQuery$'),
            TargetCheckSink.log,
            // SampleSelectionSink.log,
            // SignatureGeneratorSink.log
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            TargetCheckSink.onion,
            // SampleSelectionSink.onion,
            // SignatureGeneratorSink.onion
        ),
        HTTP: xs.merge(
            TargetCheckSink.HTTP,
            // SampleSelectionSink.HTTP,
            // SignatureGeneratorSink.HTTP
        ),
        output: targetQuery$
    }
}

export { TargetForm }