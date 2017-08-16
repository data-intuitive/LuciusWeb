import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { vegaHistogramSpecV3, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import { log } from '../../utils/logger'
import { ENTER_KEYCODE } from '../../utils/keycodes.js'
import { stateDebug } from '../../utils/utils'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { parse } from 'vega-parser'

const elementID = '#hist'

// Granular access to the settings, only api and sim keys
const histLens = {
    get: state => ({ core: state.hist, settings: { hist: state.settings.hist, api: state.settings.api } }),
    set: (state, childState) => ({ ...state, hist: childState.core })
};

/**
 * Be careful, the vega driver expects the DOM to be available in order to insert the canvas node.
 * This means that this component should not run before the actual DOM (not vdom) is rendered!
 * 
 * In other words, we have a visible variable that toggles when necessary.
 */
function Histogram(sources) {

    const logger = loggerFactory('histogram', sources.onion.state$, 'settings.hist.debug')

    const ENTER_KEYCODE = 13

    const state$ = sources.onion.state$

    const domSource$ = sources.DOM;
    const httpSource$ = sources.HTTP;
    const vegaSource$ = sources.vega;
    const visible$ = sources.DOM.select(elementID)
        .elements()
        .map(els => els[0])
        .map(el => (typeof el !== 'undefined'))
        .compose(dropRepeats())
        .startWith(false)
        .remember()

    // Size stream
    const width$ = widthStream(domSource$, elementID)

    const input$ = sources.input

    const newInput$ = xs.combine(
        input$,
        state$
    )
        .map(([newInput, state]) => ({ ...state, core: { ...state.core, input: newInput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))
        .remember()

    // No requests when signature is empty!
    const triggerRequest$ = newInput$
        .filter(state => state.core.input.signature != '')

    // When the component should not be shown
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

    // state$ handling
    const modifiedState$ = state$
        .filter(state => !isEmptyState(state))
        .compose(dropRepeats((x,y) => equals(x.core.data, y.core.data)))

    const initState$ = state$
        .filter(state => isEmptyState(state))

    const request$ = triggerRequest$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.histogram',
                method: 'POST',
                send: {
                    query: state.core.input.signature,
                    bins: state.settings.hist.bins,
                    filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : '',
                    features: state.core.input.target
                },
                'category': 'histogram'
            }
        })
        .remember()

    const response$$ = sources.HTTP
        .select('histogram')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()
        .remember()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()
        .remember()

    const data$ = validResponse$
        .map(result => result.body.result.data)

    // Ingest the data in the spec and return to the driver
    const vegaSpec$ = xs.combine(data$, width$, visible$, input$)
        .map(([data, newwidth, visible, input]) => {
            return { spec: vegaHistogramSpecV3(data, input.target), el: elementID, width: newwidth }
        })
        .remember()

    const vegaRuntime$ = vegaSpec$.map(spec => ({runtime: parse(spec.spec), width: spec.width, el: spec.el})).remember()

    const makeHistogram = () => {
        return (
            div('.card-panel .center-align', { style: { height: '400px' } }, [div(elementID)])
        )
    }

    const initVdom$ = initState$.mapTo(div(elementID))

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
            div({ style: { opacity: 0.4 } }, [makeHistogram()]),
        ])
        )
        .remember()

    const loadedVdom$ = xs.combine(data$, modifiedState$)
        .map(([data, state]) => div([
            (equals(data, emptyData))
                ? div({ style: { visibility: 'hidden' } }, [makeHistogram()])
                : div([makeHistogram()])
        ]))

    const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

    const vdom$ = xs.merge(
        initVdom$,
        errorVdom$,
        loadingVdom$,
        loadedVdom$,
        // vegadom$
    )//.startWith(div(elementID))

    const defaultReducer$ = xs.of(prevState => ({ ...prevState, core: { ...prevState.core, input: { signature: '' } } }))

    // Add input to state
    const inputReducer$ = input$.map(i => prevState =>
        // inputReducer
        ({ ...prevState, core: { ...prevState.core, input: i } })
    )
    // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({ ...prevState, core: { ...prevState.core, request: req } }))
    // Add data from API to state, update output key when relevant
    const dataReducer$ = data$.map(newData => prevState => ({ ...prevState, core: { ...prevState.core, data: newData } }))

    const specReducer$ = vegaSpec$.map(specInfo => prevState => ({ ...prevState, core: { ...prevState.core, vegaSpec: specInfo.spec } }))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            logger(request$, 'request$'),
            logger(validResponse$, 'validResponse$'),
            // logger(invalidResponse$, 'invalidResponse$'),
            // logger(vegaSpec$, 'vegaSpec$'),
            logger(vegaRuntime$, 'vegaRuntime$')
        ),
        DOM: vdom$,
        HTTP: request$, //.compose(debounce(4000)),
        vega: vegaRuntime$,
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