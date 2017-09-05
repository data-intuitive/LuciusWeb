import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, h5, button, textarea, a, select, option, span } from '@cycle/dom';
import { clone, equals, merge, mergeAll } from 'ramda';
import xs from 'xstream';
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'


export const compoundFilterLens = {
    get: state => ({ core: state.filter, settings: state.settings }),
    set: (state, childState) => ({...state, filter: childState.core })
}

const concentrations = ['', '0.1', '1', '10', '30']
const protocols = ['', 'MCF7', 'PBMC']
const types = ['', 'test', 'poscon']


/**
 * Provide a filter form. We inject (via input) a signature in order to hide the form when an empty signature is present.
 * 
 */
function Filter(sources) {

    const logger = loggerFactory('filter', sources.onion.state$, 'settings.filter.debug')

    const domSource$ = sources.DOM;
    const state$ = sources.onion.state$

    const input$ = sources.input

    // When the component should not be shown, including empty signature
    const isEmptyState = (state) => {
        if (typeof state.core === 'undefined') {
            return true
        } else {
            if (typeof state.core.input === 'undefined') {
                return true
            } else {
                if (state.core.input === '') {
                    return true
                } else {
                    return false
                }
            }
        }
    }

    const emptyState$ = state$
        .filter(input => isEmptyState(input))

    const modifiedState$ = xs.combine(input$, state$)
        .filter(([input, state]) => !isEmptyState(state))
        .map(([i, state]) => ({...state, core: {...state.core, input: i } }))

    const emptyVdom$ = emptyState$.mapTo(div())

    const isSelected = (x, y) => (x === y) ? { props: { value: y, selected: true } } : { props: { value: y } }

    const loadedVdom$ = xs.combine(modifiedState$)
        .map(([state]) => {
            const concentration = state.core.output.concentration
            const protocol = state.core.output.protocol
            const type = state.core.output.type

            return div([
                div('.input-field .concentration .col .s12 .l4', [
                    span('.blue-grey-text', ['Concentration']),
                    select('.browser-default',
                        concentrations.map(conc => option(isSelected(concentration, conc), conc))
                    ),
                ]),
                div('.input-field .protocol .col .s12 .l4', [
                    span('.blue-grey-text', ['Protocol']),
                    select('.browser-default',
                        protocols.map(prot => option(isSelected(protocol, prot), prot))
                    ),
                ]),
                div('.input-field .type .col .s12 .l4', [
                    span('.blue-grey-text', ['Type']),
                    select('.browser-default',
                        types.map(t => option(isSelected(type, t), t))
                    ),
                ]),
            ])
        })

    const vdom$ = xs.merge(
        emptyVdom$,
        loadedVdom$.startWith(div())
    )

    const concentrationChanged$ = sources.DOM
        .select('.concentration')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ concentration: value }))
        .startWith('')

    const typeChanged$ = sources.DOM
        .select('.type')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ type: value }))
        .startWith('')
    const protocolChanged$ = sources.DOM
        .select('.protocol')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ protocol: value }))
        .startWith('')

    const domChanges$ = xs.combine(
        concentrationChanged$,
        typeChanged$,
        protocolChanged$
    ).map((filters) => mergeAll(filters))

    // This for ghost mode, inject changes via external state updates...
    const ghostChanges$ = state$
        .filter(state => typeof state.core.ghostinput !== 'undefined')
        .map(state => state.core.ghostinput)
        .compose(dropRepeats())
        .debug()

    const changes$ = xs.merge(domChanges$, ghostChanges$)

    // To be sent to sink as output
    const filter$ = changes$.remember()

    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i } }))
    const outputReducer$ = filter$.map(i => prevState => ({...prevState, core: {...prevState.core, output: i } }))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
        ),
        DOM: vdom$,
        output: filter$,
        onion: xs.merge(
            inputReducer$,
            outputReducer$
        )
    };

}

export { Filter }