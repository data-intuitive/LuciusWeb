import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals, omit } from 'ramda';
import { CorrelationVegaSpec } from './CorrelationSpec.js'
import { widthStream, widthHeightStream } from '../../utils/utils'
import { loggerFactory } from '../../utils/logger'
import { parse } from 'vega-parser'

// Granular access to the settings, only api and sim keys
const correlationPlotsLens = {
    get: state => ({ core: state.plots, settings: { plots: state.settings.plots, api: state.settings.api } }),
    set: (state, childState) => ({...state, plots: childState.core })
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
    return data == undefined || data.length == 0
}

const makeVega = (elementID) => {
    return div('.card-panel .center-align', { style: { height: '65vh', maxHeight: '75vw', width: '100%' } }, [div(elementID)])
}

function CorrelationPlot(sources) {

    const logger = loggerFactory('plots', sources.onion.state$, 'settings.plots.debug')

    const state$ = sources.onion.state$
    const input$ = sources.input

    const visibility$ = (el) => sources.DOM.select(el)
        .elements()
        .map(els => els[0])
        .map(el => (typeof el !== 'undefined'))
        .compose(dropRepeats())
        .startWith(false)
        .remember()

    // Size stream
    const size$ = (el) => widthHeightStream(sources.DOM, el)

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
        .remember()

    const request$ = triggerRequest$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.correlation',
                method: 'POST',
                send: {
                    query1: state.core.input.query1,
                    query2: state.core.input.query2,
                    binsX: state.settings.plots.bins,
                    filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : ''
                },
                'category': 'plot'
            }
        })

    const response$$ = sources.HTTP
        .select('plot')

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

    const data$ = validResponse$
        .map(result => result.body.result.data)

    // Split the data$ stream in a stream of empty result sets and non-empty
    // Note: We only pad the zero-counts when the data is non-empty!
    const emptyData$ = data$
        .filter(data => isEmptyData(data))
    const nonEmptyData$ = data$
        .filter(data => !isEmptyData(data))

    // Ingest the data in the spec and return to the driver
    const spec$ = xs.combine(nonEmptyData$, size$('#corrplot'), visibility$('#corrplot'), input$, resize$)
        .map(([data, newSize, visible]) => ({ spec: CorrelationVegaSpec(data), el: '#corrplot', width: newSize[0], height: newSize[1] }))
        .compose(debounce(10))

    const runtime$ = spec$
        .map(spec => ({ runtime: parse(spec.spec), width: spec.width, el: spec.el, height: spec.height }))

    // ========================================================================

    const plotContainer = (plot) => {
        return div('.col .s10 .l8 .offset-s1 .offset-l2', {style : { padding: '0px'}}, [div('.col .s12', {style : { margin: '0 0 0 0', padding: 0}}, [
            plot,
        ]) ])
    }

    // Initialization
    const initWrapper = (el) => {
        return div({ style: { opacity: 0.0 } }, [makeVega(el)])
    }

    // When no signature is available, don't show anything (+ init)
    const initVdom$ = emptyState$
        .mapTo(
                initWrapper('#corrplot'),
            ).startWith(div())

    // Loading
    const loadingWrapper = (el) => {
        return div([
            div('.preloader-wrapper .small .active', { style: { 'z-index': 1, position: 'absolute' } }, [
                div('.spinner-layer .spinner-green-only', [
                    div('.circle-clipper .left', [
                        div('.circle')
                    ])
                ])
            ]),
            div({ style: { opacity: 0.2 } }, [makeVega(el)]),
        ])
    }

    // A spinner while the data is loading...
    const loadingVdom$ = request$
        .mapTo(
                plotContainer(loadingWrapper('#corrplot'))
            )

    const emptyLoadedWrapper = (el) => div('.card-panel', { style: { height: '500px' } }, [
        div('.valign-wrapper', { style: { 'z-index': 1, position: 'absolute' } }, [
            p('.flow-text .valign .grey-text .center-align', 'No Data for given filter...')
        ]),
        div({ style: { opacity: 0.0 } }, [makeVega('#corrplot')])
    ])

    // No data returned, make the vega element opaque and overlay with a comment
    const emptyLoadedVdom$ = emptyData$
        .mapTo(
                emptyLoadedWrapper('#corrplot')
            )

    // A real data set is returned, set up a visual div
    const nonEmptyLoadedVdom$ = nonEmptyData$
        .mapTo(
                plotContainer(div([makeVega('#corrplot')]))
        )

    // Initialization
    const errorWrapper = (el) => {
        return div({ style: { opacity: 0.0 } }, [makeVega(el)])
    }

    // In case of error, show this
    const errorVdom$ = invalidResponse$
        .mapTo(
            div('.red .white-text', [p('An error occured !!!')]))

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
    const specReducer$ = spec$.map(specInfo => prevState =>
        ({...prevState, core: {...prevState.core, vegaSpec: specInfo.spec } })
    )

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            // logger(request$, 'request$'),
            // logger(validResponse$, 'validResponse$'),
            // logger(emptyState$, 'empty State')
        ),
        DOM: vdom$,
        HTTP: request$,
        vega: runtime$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$,
            specReducer$
        )
    };

}

export { CorrelationPlot, correlationPlotsLens }
