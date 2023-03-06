import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals, omit } from 'ramda';
import { histogramVegaSpec } from './HistogramSpec.js'
import { similarityPlotVegaSpec } from './SimilarityPlotSpec.js'
import { widthStream } from '../../utils/utils'
import { loggerFactory } from '../../utils/logger'
import { parse } from 'vega-parser'
import { dirtyWrapperStream } from "../../utils/ui"
import { BinnedZhangQuery } from '../../utils/asyncQuery.js';

// const elementID = '#hist'
// const component = 'histogram'

// Granular access to the settings, only api and sim keys
const plotsLens = {
    get: state => ({ core: state.plots, settings: { plots: state.settings.plots, api: state.settings.api }, 
        ui: (state.ui??{}).plots ?? {dirty: false}, // Get state.ui.prots in a safe way or else get a default
    }),
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
    return div('.card-panel .center-align', { style: { height: '400px' } }, [div(elementID)])
}

function BinnedPlots(sources) {

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
    const width$ = (el) => widthStream(sources.DOM, el)

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

    const triggerObject$ = triggerRequest$
        .map(state => ({
            query: state.core.input.signature,
            binsX: state.settings.plots.bins,
            binsY: state.settings.plots.binsX,
            filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : ''
        }))

    const queryData = BinnedZhangQuery(triggerObject$)(sources)

    // ========================================================================

    /** 
     * The histogram is based on a plot type that uses automatically generated widths for
     * the bars. When no data is encountered for an interval, the bars will be shifted and
     * thus not correspond to the correct value. Here we pad the data with zero-values.
     */
    const baseGrid$ = triggerRequest$.map(state => {
        const paddingArray = Array.from({ length: state.settings.plots.bins }).fill(null)
        return paddingArray.map((value, key) => ({
            "x": 0,
            "count": 0,
            "y": key
        }))
    }).remember()

    // Split the data$ stream in a stream of empty result sets and non-empty
    // Note: We only pad the zero-counts when the data is non-empty!
    const emptyData$ = queryData.data$
        .map(data => data.data)
        .filter(data => isEmptyData(data))
    const nonEmptyData$ = queryData.data$
        .map(data => data.data)
        .filter(data => !isEmptyData(data))
        .compose(sampleCombine(baseGrid$))
        .map(([data, baseGrid]) => (data.concat(baseGrid)))

    // Ingest the data in the spec and return to the driver
    const similarityPlotVegaSpec$ = xs.combine(nonEmptyData$, width$('#simplot'), visibility$('#simplot'), input$, resize$)
        .map(([data, newwidth, visible]) => ({ spec: similarityPlotVegaSpec(data), el: '#simplot', width: newwidth, height: 350 }))
        .compose(debounce(10))

    const histogramVegaSpec$ = xs.combine(nonEmptyData$, width$('#hist'), visibility$('#hist'), input$, resize$)
        .map(([data, newwidth, visible]) => ({ spec: histogramVegaSpec(data), el: '#hist', width: newwidth, height: 350 }))
        .compose(debounce(20))

    const specs$ = xs.merge(similarityPlotVegaSpec$, histogramVegaSpec$)

    const runtimes$ = specs$
        .map(spec => ({ runtime: parse(spec.spec), width: spec.width, el: spec.el, height: spec.height }))

    // ========================================================================

    const plotsContainerDifferent = (left, right) => {
        return div('.col .s12', {style : { padding: '0px'}}, [div('.col .s12 .l7', {style : { margin: '0 0 0 0', padding: 0}}, [
            left,
        ]), div('.col .s12 .l5', [
            right,
        ])])
    }

    // Initialization
    const initWrapper = (el) => {
        return div({ style: { opacity: 0.0 } }, [makeVega(el)])
    }

    // When no signature is available, don't show anything (+ init)
    const initVdom$ = emptyState$
        .mapTo(
            plotsContainerDifferent(
                initWrapper('#simplot'),
                initWrapper('#hist')
            )).startWith(div())

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
    const loadingVdom$ = triggerObject$
        .mapTo(
            plotsContainerDifferent(
                loadingWrapper('#simplot'),
                loadingWrapper('#hist')
            ))

    const emptyLoadedWrapper = (el) => div('.card-panel', { style: { height: '400px' } }, [
        div('.valign-wrapper', { style: { 'z-index': 1, position: 'absolute' } }, [
            p('.flow-text .valign .grey-text .center-align', 'No Data for given filter...')
        ]),
        div({ style: { opacity: 0.0 } }, [makeVega('#simplot')])
    ])

    // No data returned, make the vega element opaque and overlay with a comment
    const emptyLoadedVdom$ = emptyData$
        .mapTo(
            plotsContainerDifferent(
                emptyLoadedWrapper('simplot'),
                emptyLoadedWrapper('hist')
            ))

    // A real data set is returned, set up a visual div
    const nonEmptyLoadedVdom$ = nonEmptyData$
        .mapTo(
            plotsContainerDifferent(
                div([makeVega('#simplot')]),
                div([makeVega('#hist')])
            )
        )

    // Initialization
    const errorWrapper = (el) => {
        return div({ style: { opacity: 0.0 } }, [makeVega(el)])
    }

    const killedWrapper = (el) => {
        return div([
            div('.small .active .valign-wrapper .center-align', { style: { 'z-index': 1, position: 'absolute', margin: '20px' } }, [
                div('Job interrupted by user')
            ]),
            div({ style: { opacity: 0.2 } }, [makeVega(el)]),
        ])
    }

    const killedVdom$ = queryData.jobDeleted$
        .mapTo(
            plotsContainerDifferent(
                killedWrapper('#simplot'),
                killedWrapper('#hist')
            ))

    // In case of error, show this
    const errorVdom$ = queryData.invalidData$
        .mapTo(plotsContainerDifferent(
            div(".component-error-state", [
                p(".header", "An error occured!"),
                p(".text", "Please try again in 5 minutes. If the issue persists please contact support.")
              ]),
              div(".component-error-state", [
                p(".header", "An error occured!"),
                p(".text", "Please try again in 5 minutes. If the issue persists please contact support.")
              ])
        ))

    
    // Merge the streams, last event is shown...
    // Wrap component vdom with an extra div that handles being dirty
    const vdom$ = dirtyWrapperStream(state$, 
        xs.merge(
            initVdom$,
            errorVdom$,
            loadingVdom$,
            killedVdom$,
            emptyLoadedVdom$,
            nonEmptyLoadedVdom$
        ) )

    // ========================================================================

    // Default reducer
    const defaultReducer$ = xs.of(prevState =>
            ({...prevState, core: {...prevState.core, input: { signature: '' } } })
        )
    // Add input to state
    const inputReducer$ = input$.map(i => prevState =>
            ({...prevState, core: {...prevState.core, input: i } })
        )
    // Add data from API to state, update output key when relevant
    const dataReducer$ = nonEmptyData$.map(newData => prevState =>
            ({...prevState, core: {...prevState.core, data: newData } })
        )
    // Add Vega spec (including data) to state
    const specReducer$ = specs$.map(specInfo => prevState =>
        ({...prevState, core: {...prevState.core, vegaSpec: specInfo.spec } })
    )

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            // logger(request$, 'request$'),
            // logger(validResponse$, 'validResponse$'),
            // logger(emptyState$, 'empty State')
            logger(baseGrid$, 'padding grid$')
        ),
        DOM: vdom$,
        HTTP: queryData.HTTP,
        asyncQueryStatus: queryData.asyncQueryStatus,
        vega: runtimes$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            dataReducer$,
            specReducer$,
        )
    };

}

export { BinnedPlots, plotsLens }
