import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import dropRepeats from 'xstream/extra/dropRepeats';
import debounce from 'xstream/extra/debounce'
import { h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1 } from '@cycle/dom';
import { clone, equals, omit } from 'ramda';
import { similarityPlotSpecV3, exampleData, emptyData } from './spec.js'
import { widthStream } from '../../utils/utils'
import { stateDebug } from '../../utils/utils'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { parse } from 'vega-parser'

const elementID = '#vega'

const ENTER_KEYCODE = 13

// Granular access to the settings, only api and sim keys
const simLens = {
    get: state => ({ core: state.sim, settings: { sim: state.settings.sim, api: state.settings.api } }),
    set: (state, childState) => ({ ...state, sim: childState.core })
};

function SimilarityPlot(sources) {

    const logger = loggerFactory('similarityPlot', sources.onion.state$, 'settings.sim.debug')

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

    // Input handling
    const input$ = sources.input

    const newInput$ = xs.combine(
        input$,
        state$
    )
        .map(([newInput, state]) => ({ ...state, core: { ...state.core, input: newInput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))
    // .remember()

    // No requests when signature is empty!
    const triggerRequest$ = newInput$
        .filter(state => state.core.input.signature != '')

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

    // state$ handling
    const modifiedState$ = state$
        .filter(state => !isEmptyState(state))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    const initState$ = state$
        .filter(state => isEmptyState(state))
        .compose(dropRepeats(equals))

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
                'category': 'binnedZhang'
            }
        })
        .remember()

    const response$$ = sources.HTTP
        .select('binnedZhang')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()
    // .remember()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()
    // .remember()

    const data$ = validResponse$
        .map(result => result.body.result.data)
        // .debug('sim data')
        // .remember()
    // .filter(data => data != null)

    // Ingest the data in the spec and return to the driver
    const vegaSpec$ = xs.combine(data$, width$, visible$, input$)
        .filter(([data]) => data.length > 0)
        .map(([data, newwidth, visible]) => {
            return { spec: similarityPlotSpecV3(data), el: elementID, width: newwidth }
        })

    const vegaRuntime$ = vegaSpec$.map(spec => ({ runtime: parse(spec.spec), width: spec.width, el: spec.el }))
    // .remember()

    const makeChart = () => {
        return (
            div('.card-panel .center-align', { style: { height: '400px' } }, [div(elementID)])
        )
    }

    // A hack: the ele
    const initVdom$ = initState$.mapTo(div(elementID, { style: { opacity: 0.0 } }))

    const loadingVdom$ =
        request$
            .mapTo(
            div([
                div('.preloader-wrapper .small .active', { style: { 'z-index': 1, position: 'absolute' } }, [
                    div('.spinner-layer .spinner-green-only', [
                        div('.circle-clipper .left', [
                            div('.circle')
                        ])
                    ])
                ]),
                div({ style: { opacity: 0.4 } }, [makeChart()]),
            ])
            )
            // .debug('LoadingVdom$')
    // .remember()

    // const emptyData$ = initState$.mapTo(emptyData)

    // const emptyVdom$ = emptyData$
    //     .map((data) => div([
    //             div({ style: { visibility: 'hidden' } }, [makeChart()])
    //     ]))

    const loadedVdom$ = data$
    // state$
    //     .filter(state => state.core.data != null)
    //     // .compose(dropRepeats((x,y) => equals(x, y)))
    //     .map(state => state.core.data)
        .map((data) =>
            (!data.length > 0)    // If result is empty
                ? div('.card-panel', { style: { height: '400px' } }, [
                    div('.valign-wrapper', { style: { 'z-index': 1, position: 'absolute' } }, [
                        p('.flow-text .valign .grey-text .center-align', 'No Data for given filter...')
                    ]),
                    div({ style: { opacity: 0.0 } }, [div(elementID)])
                ])
                : div([makeChart()])
        )
        // .debug('Similarity Plot LoadedVdom$')

    const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

    const vdom$ = xs.merge(
        initVdom$,
        errorVdom$,
        loadingVdom$,
        loadedVdom$
    )

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
            // logger(validResponse$, 'validResponse$'),
            // logger(invalidResponse$, 'invalidResponse$')
        ),
        DOM: vdom$,
        HTTP: request$,
        vega: vegaRuntime$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$
        )
    };

}

export { SimilarityPlot, simLens };