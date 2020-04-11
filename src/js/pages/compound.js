import { i, a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll } from 'ramda'
import { CompoundForm } from '../components/CompoundForm'
import dropRepeats from 'xstream/extra/dropRepeats'
import { initSettings } from './settings'
import { makeTable, headTableLens, tailTableLens } from '../components/Table'
import { BinnedPlots, plotsLens } from '../components/BinnedPlots/BinnedPlots'
import { Filter, compoundFilterLens } from '../components/Filter'
import concat from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { SampleTable, sampleTableLens } from '../components/SampleTable/SampleTable'

// Support for ghost mode
import { scenario } from '../scenarios/compoundScenario'
import { runScenario } from '../utils/scenario'
import { SignatureGenerator } from '../components/SignatureGenerator';

export default function CompoundWorkflow(sources) {

    const logger = loggerFactory('compound', sources.onion.state$, 'settings.common.debug')

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
        .startWith({ text: 'Welcome to Compound Workflow', duration: 4000 })

    const formLens = {
        get: state => ({
            form: state.form,
            settings: {
                form: state.settings.form,
                api: state.settings.api,
                common: state.settings.common,
                geneAnnotations: state.settings.geneAnnotations,
                compoundAnnotations: state.settings.compoundAnnotations
             }
        }),
        set: (state, childState) => ({...state, form: childState.form })
    };

    const CompoundFormSink = isolate(CompoundForm, { onion: formLens })(sources)
    const signature$ = CompoundFormSink.output

    // Initialize if not yet done in parent (i.e. router) component (useful for testing)
    const defaultReducer$ = xs.of(prevState => {
        // compound -- defaultReducer
        if (typeof prevState === 'undefined') {
            return ({
                settings: initSettings,
                form: {},
                sim: {},
                hist: {},
                filter: {},
                headTable: {},
                tailTable: {},
                geneAnnotations: {}
            })
        } else {
            return ({
                ...prevState,
                settings: prevState.settings,
                form: {},
                sim: {},
                hist: {},
                filter: {},
                headTable: {},
                tailTable: {},
                geneAnnotations: {}
            })
        }
    })

    // Filter Form
    const filterForm = isolate(Filter, { onion: compoundFilterLens })({...sources, input: signature$ })
    const filter$ = filterForm.output.remember()

    // Binned Plots Component
    const binnedPlots = isolate(BinnedPlots, { onion: plotsLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ signature: s, filter: f })).remember() });

    // tables
    const headTableContainer = makeTable(SampleTable, sampleTableLens)
    const tailTableContainer = makeTable(SampleTable, sampleTableLens)

    // Join settings from api and sourire into props
    const headTable = isolate(headTableContainer, { onion: headTableLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });
    const tailTable = isolate(tailTableContainer, { onion: tailTableLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });

    const pageStyle = {
        style: {
            fontSize: '14px',
            opacity: '0',
            transition: 'opacity 1s',
            delayed: { opacity: '1' },
            destroy: { opacity: '0' }
        }
    }

    const vdom$ = xs.combine(
            CompoundFormSink.DOM,
            filterForm.DOM,
            binnedPlots.DOM,
            headTable.DOM,
            tailTable.DOM,
        )
        .map(([
            formDOM,
            filter,
            plots,
            headTable,
            tailTable
        ]) => div('.row .compound', { style: { margin: '0px 0px 0px 0px' } }, [
            formDOM,
            div('.col .s10 .offset-s1', pageStyle, [
                div('.row', [filter]),
                div('.row', [ plots ]),
                div('.col .s12', [headTable]),
                div('.row', []),
                div('.col .s12', [tailTable]),
                div('.row', [])
            ])
        ]))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            CompoundFormSink.log,
            filterForm.log,
            binnedPlots.log,
            headTable.log,
            tailTable.log
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            CompoundFormSink.onion,
            binnedPlots.onion,
            filterForm.onion,
            headTable.onion,
            tailTable.onion,
            scenarioReducer$
        ),
        HTTP: xs.merge(
            CompoundFormSink.HTTP,
            binnedPlots.HTTP,
            headTable.HTTP,
            tailTable.HTTP
        ),
        vega: binnedPlots.vega,
        popup: scenarioPopup$,
        modal: xs.merge(
            CompoundFormSink.modal
        ),
        ac: CompoundFormSink.ac
    };
}
