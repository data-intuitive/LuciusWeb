import { div, span, i } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'

// Components
import { CorrelationForm, formLens } from '../components/CorrelationForm'
import { CorrelationPlot, correlationPlotsLens } from '../components/BinnedPlots/CorrelationPlot'
import { initSettings } from '../configuration.js'
import { Filter, filterLens } from '../components/Filter'
import { loggerFactory } from '../utils/logger'
import { Exporter } from "../components/Exporter"

// Support for ghost mode
import { scenario } from '../scenarios/correlationScenario'
import { runScenario } from '../utils/scenario'

function CorrelationWorkflow(sources) {

    const logger = loggerFactory('correlation', sources.onion.state$, 'settings.common.debug')

    const state$ = sources.onion.state$

    // Scenario for ghost mode
    const scenarios$ = sources.onion.state$
    .take(1)
    .filter((state) => state.settings.common.ghostMode)
    .map(state => runScenario(scenario(state.settings.common.ghost.correlation), state$))
  const scenarioReducer$ = scenarios$.map(s => s.scenarioReducer$)
    .flatten()
  const scenarioPopup$ = scenarios$.map(s => s.scenarioPopup$)
    .flatten()
    .startWith({ text: "Welcome to Correlation Workflow", duration: 4000 })

    const correlationForm = isolate(CorrelationForm, { onion: formLens })(sources)
    const queries$ = correlationForm.output

    const doubleSignature$ = queries$
        .filter((queries) => (queries.query1 != undefined && queries.query1 != ""))
        .filter((queries) => (queries.query2 != undefined && queries.query2 != ""))
        .map((queries) => (queries.query1 + " + " + queries.query2))
    // Filter Form
    const filterForm = isolate(Filter, { onion: filterLens })({
        ...sources,
        input: doubleSignature$
    })
    const filter$ = filterForm.output.remember()

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
    const correlationPlot = isolate(CorrelationPlot, { onion: correlationPlotsLens })({
        ...sources, 
        input: xs
            .combine(queries$, filter$)
            .map(([queries, filter]) =>
                ({
                    ...queries,
                    filter: filter,
                })
            )
            .remember()
    });

    // tables
    // const headTableContainer = makeTable(SampleTable, sampleTableLens)
    // const tailTableContainer = makeTable(SampleTable, sampleTableLens)

    // Join settings from api and sourire into props
    // const headTable = isolate(headTableContainer, { onion: headTableLens })
    //     ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });
    // const tailTable = isolate(tailTableContainer, { onion: tailTableLens })
    //     ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });

    const exporter = Exporter({
        ...sources, 
        config: {
            plotId: "#corrplot",
            plotName: "correlation",
            fabSignature: ".hide",
            workflowName: "Correlation"
        }
    })

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
            filterForm.DOM,
            correlationPlot.DOM,
            // headTable.DOM,
            // tailTable.DOM,
            // feedback$
            exporter.DOM,
        )
        .map(([
                form,
                filter,
                plot,
                // headTable,
                // tailTable,
                // feedback
                exporter,
            ]) =>
            div('.row .correlation', { style: { margin: '0px 0px 0px 0px' } }, [
                form,
                div('.col .s10 .offset-s1', pageStyle, [
                    div('.row', [filter]),
                    div('.row', [plot]),
                    // div('.row', []),
                    // div('.col .s12', [headTable]),
                    // div('.row', []),
                    // div('.col .s12', [tailTable]),
                    // div('.row', [])
                ]),
                exporter,
            ])
        );

    return {
        log: xs.merge(
            // logger(state$, 'state$'),
            exporter.log,
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            correlationForm.onion,
            filterForm.onion,
            correlationPlot.onion,
            // headTable.onion,
            // tailTable.onion,
            exporter.onion,
            scenarioReducer$
        ),
        vega: xs.merge(
            correlationPlot.vega
        ),
        HTTP: xs.merge(
            correlationForm.HTTP,
            filterForm.HTTP,
            correlationPlot.HTTP,
            // headTable.HTTP,
            // tailTable.HTTP
        ),
        asyncQueryStatus: xs.merge(
            correlationForm.asyncQueryStatus,
            filterForm.asyncQueryStatus,
            correlationPlot.asyncQueryStatus,  
        ),
        popup: scenarioPopup$,
        modal: exporter.modal,
        fab: exporter.fab,
        clipboard: exporter.clipboard,
    };
}

export default CorrelationWorkflow;
