import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals, omit } from 'ramda';
import { vegaSpec } from './spec.js'
import { widthStream } from '../../utils/utils'
import { stateDebug } from '../../utils/utils'
import { loggerFactory } from '../../utils/logger'
import { parse } from 'vega-parser'

const elementID = '#hist'
const component = 'histogram'

// Granular access to the settings, only api and sim keys
const histLens = {
    get: state => ({ core: state.hist, settings: { sim: state.settings.sim, api: state.settings.api } }),
    set: (state, childState) => ({...state, hist: childState.core })
};

// When the component should not be shown, including empty signature
const isEmptyState = (state) => {
    if (typeof state.core === 'undefined') {
        return true
    } else {
        if (typeof state.core.input === 'undefined') {
            return true
        } else {
            if (state.core.input.signature === '') {
                return true
            } else {
                return false
            }
        }
    }
}

// For this component, when is a API result empty?
const isEmptyData = (data) => {
    return data.length == 0
}

const makeVega = () => {
    return (
        div('.card-panel .center-align', { style: { height: '400px' } }, [div(elementID)])
    )
}

function Histogram(sources) {

    const logger = loggerFactory('histogram', sources.onion.state$, 'settings.hist.debug')

    const state$ = sources.onion.state$
    const input$ = sources.input

    const visible$ = sources.DOM.select(elementID)
        .elements()
        .map(els => els[0])
        .map(el => (typeof el !== 'undefined'))
        .compose(dropRepeats())
        .startWith(false)
        .remember()

    // Size stream
    const width$ = widthStream(sources.DOM, elementID)
    const resize$ = sources.resize.startWith('go!')

    // ========================================================================

    const newInput$ = xs.combine(
            input$,
            state$
        )
        .map(([newInput, state]) => ({...state, core: {...state.core, input: newInput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    // state$ handling
    const emptyState$ = state$
        .filter(state => isEmptyState(state))
        .compose(dropRepeats(equals))

    // ========================================================================

    // No requests when signature is empty!
    const triggerRequest$ = newInput$
        .filter(state => state.core.input.signature != '')

    const request$ = triggerRequest$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.binnedZhang',
                method: 'POST',
                send: {
                    query: state.core.input.signature,
                    binsX: state.settings.sim.binsX,
                    binsY: state.settings.sim.binsY,
                    filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : ''
                },
                'category': component
            }
        })

    const response$$ = sources.HTTP
        .select(component)

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
            .filter(response => false) // ignore regular event
            .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()

    const validResponse$ = response$$
        .map(response$ =>
            response$
            .replaceError(error => xs.empty())
        )
        .flatten()

    // ========================================================================

    // Data to pad for correct aligment in the plot
    const baseGrid = Array.from(Array(20).keys())
        .map(key => ({
            "x": 0,
            "count": 0,
            "y": key
        }))

    const data$ = validResponse$
        .map(result => result.body.result.data)

    // Split the data$ stream in a stream of empty result sets and non-empty:
    const emptyData$ = data$
        .filter(data => isEmptyData(data))
    const nonEmptyData$ = data$
        .filter(data => !isEmptyData(data))
        .map(data => data.concat(baseGrid))

    // Ingest the data in the spec and return to the driver
    const vegaSpec$ = xs.combine(nonEmptyData$, width$, visible$, input$, resize$)
        .map(([data, newwidth, visible]) => ({ spec: vegaSpec(data), el: elementID, width: newwidth }))

    const vegaRuntime$ = vegaSpec$
        .map(spec => ({ runtime: parse(spec.spec), width: spec.width, el: spec.el }))

    // ========================================================================

    // When no signature is available, don't show anything (+ init)
    const initVdom$ = emptyState$
        .mapTo(div(elementID, { style: { opacity: 0.0 } }))


    // A spinner while the data is loading...
    const loadingVdom$ = request$
        .mapTo(
            div([
                div('.preloader-wrapper .small .active', { style: { 'z-index': 1, position: 'absolute' } }, [
                    div('.spinner-layer .spinner-green-only', [
                        div('.circle-clipper .left', [
                            div('.circle')
                        ])
                    ])
                ]),
                div({ style: { opacity: 0.2 } }, [makeVega()]),
            ])
        )

    // No data returned, make the vega element opaque and overlay with a comment
    const emptyLoadedVdom$ = emptyData$
        .mapTo(
            div('.card-panel', { style: { height: '400px' } }, [
                div('.valign-wrapper', { style: { 'z-index': 1, position: 'absolute' } }, [
                    p('.flow-text .valign .grey-text .center-align', 'No Data for given filter...')
                ]),
                div({ style: { opacity: 0.0 } }, [div(elementID)])
            ])
        )

    // A real data set is returned, set up a visual div
    const nonEmptyLoadedVdom$ = nonEmptyData$
        .mapTo(div([makeVega()]))

    // In case of error, show this
    const errorVdom$ = invalidResponse$
        .mapTo(div('.red .white-text', [p('An error occured !!!')]))

    // Merge the streams, last event is shown...
    const vdom$ = xs.merge(
        initVdom$,
        errorVdom$,
        loadingVdom$,
        emptyLoadedVdom$,
        nonEmptyLoadedVdom$
    )

    // ========================================================================

    // Default reducer
    const defaultReducer$ = xs.of(prevState =>
            ({...prevState, core: {...prevState.core, input: { signature: '' } } })
        )
        // Add input to state
    const inputReducer$ = input$.map(i => prevState =>
            ({...prevState, core: {...prevState.core, input: i } })
        )
        // Add request body to state
    const requestReducer$ = request$.map(req => prevState =>
            ({...prevState, core: {...prevState.core, request: req } })
        )
        // Add data from API to state, update output key when relevant
    const dataReducer$ = nonEmptyData$.map(newData => prevState =>
            ({...prevState, core: {...prevState.core, data: newData } })
        )
        // Add Vega spec (including data) to state
    const specReducer$ = vegaSpec$.map(specInfo => prevState =>
        ({...prevState, core: {...prevState.core, vegaSpec: specInfo.spec } })
    )

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            // logger(request$, 'request$'),
            // logger(validResponse$, 'validResponse$'),
            // logger(invalidResponse$, 'invalidResponse$')
        ),
        DOM: vdom$,
        HTTP: request$,
        vega: vegaRuntime$.compose(debounce(20)),
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$,
            specReducer$
        )
    };

}

export { Histogram, histLens }
