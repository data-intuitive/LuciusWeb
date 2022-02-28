import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'

// Components
import { CorrelationForm, formLens } from '../components/CorrelationForm'
import { CorrelationPlot, correlationPlotsLens } from '../components/BinnedPlots/CorrelationPlot'
import { makeTable, headTableLens, tailTableLens } from '../components/Table'
import { initSettings } from '../configuration.js'
import { Filter, compoundFilterLens } from '../components/Filter'
import { loggerFactory } from '../utils/logger'
import { SampleTable, sampleTableLens } from '../components/SampleTable/SampleTable'

// Support for ghost mode
import { scenario } from '../scenarios/diseaseScenario'
import { runScenario } from '../utils/scenario'

function CorrelationWorkflow(sources) {

    const logger = loggerFactory('correlation', sources.onion.state$, 'settings.common.debug')

    const state$ = sources.onion.state$

    // Scenario for ghost mode
    const scenarioReducer$ =
        sources.onion.state$.take(1)
        .filter(state => state.settings.common.ghostMode)
        .mapTo(runScenario(scenario).scenarioReducer$)
        .flatten()
        .startWith(prevState => prevState)
    const scenarioPopup$ =
        sources.onion.state$.take(1)
        .filter(state => state.settings.common.ghostMode)
        .mapTo(runScenario(scenario).scenarioPopup$)
        .flatten()
        .startWith({ text: 'Welcome to Correlation Workflow', duration: 4000 })

    const correlationForm = isolate(CorrelationForm, { onion: formLens })(sources)
    const queries$ = correlationForm.output

    // Filter Form
    // const filterForm = isolate(Filter, { onion: compoundFilterLens })({...sources, input: queries$})
    // const filter$ = filterForm.output.remember()

    // default Reducer, initialization
    const defaultReducer$ = xs.of(prevState => {
        // disease -- defaultReducer
        if (typeof prevState === 'undefined') {
            return ({
                settings: initSettings,
                form: {},
            })
        } else {
            return ({
                ...prevState,
                settings: prevState.settings,
                form: {},
            })
        }
    })

    // Binned Plots Component
    const correlationPlot = isolate(CorrelationPlot, { onion: correlationPlotsLens })
        ({...sources, input: queries$.remember() });

    // tables
    // const headTableContainer = makeTable(SampleTable, sampleTableLens)
    // const tailTableContainer = makeTable(SampleTable, sampleTableLens)

    // Join settings from api and sourire into props
    // const headTable = isolate(headTableContainer, { onion: headTableLens })
    //     ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });
    // const tailTable = isolate(tailTableContainer, { onion: tailTableLens })
    //     ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });

    const pageStyle = {
        style: {
            fontSize: '14px',
            opacity: '0',
            transition: 'opacity 1s',
            delayed: { opacity: '1' },
            destroy: { opacity: '0' },
        }
    }

    const vdom$ = xs.combine(
            correlationForm.DOM,
            // filterForm.DOM,
            correlationPlot.DOM,
            // headTable.DOM,
            // tailTable.DOM,
            // feedback$
        )
        .map(([
                form,
                // filter,
                plot,
                // headTable,
                // tailTable,
                // feedback
            ]) =>
            div('.row .correlation', { style: { margin: '0px 0px 0px 0px' } }, [
                form,
                div('.col .s10 .offset-s1', pageStyle, [
                    // div('.row', [filter]),
                    div('.row', [plot]),
                    // div('.row', []),
                    // div('.col .s12', [headTable]),
                    // div('.row', []),
                    // div('.col .s12', [tailTable]),
                    // div('.row', [])
                ])
            ])
        );

    return {
        log: xs.merge(
            // logger(state$, 'state$'),
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            correlationForm.onion,
            // filterForm.onion,
          correlationPlot.onion,
            // headTable.onion,
            // tailTable.onion,
            scenarioReducer$
        ),
        vega: xs.merge(
            correlationPlot.vega
        ),
        HTTP: xs.merge(
            correlationForm.HTTP,
            correlationPlot.HTTP,
            // headTable.HTTP,
            // tailTable.HTTP
        ),
        popup: scenarioPopup$
    };
}

export default CorrelationWorkflow;
