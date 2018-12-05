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

    const TargetCheckSink = isolate(TargetCheck, {onion: checkLens, DOM: 'check'} )(sources)
    const targetQuery$ = TargetCheckSink.output.remember()

    const vdom$ = xs.combine(
        TargetCheckSink.DOM, 
        targetQuery$.startWith('')
        )
        .map(([
            formDom, 
            targetQuery
        ]) =>
            div([
                formDom,
            ]))

    const defaultReducer$ = xs.of(prevState => {
        // TargetForm -- default Reducer
        return ({...prevState, form: {}, compoundTable: {}})
    })

    return {
        log: xs.merge(
           TargetCheckSink.log,
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            TargetCheckSink.onion,
        ),
        HTTP: xs.merge(
            TargetCheckSink.HTTP,
        ),
        output: targetQuery$,
        ac: TargetCheckSink.ac
    }
}

export { TargetForm }