import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'

// Components
import { SignatureForm, formLens } from '../components/SignatureForm'
import { Histogram, histLens } from '../components/HistogramBasedOnSimPlot/HistogramBasedOnSimPlot'
import { SimilarityPlot, simLens } from '../components/SimilarityPlot/SimilarityPlot'
import { makeTable, headTableLens, tailTableLens } from '../components/Table'
import { initSettings } from './settings'
import { Filter, compoundFilterLens } from '../components/Filter'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { SampleTable, sampleTableLens } from '../components/SampleTable/SampleTable'

// Support for ghost mode
import { scenario } from '../scenarios/diseaseScenario'
import { runScenario } from '../utils/scenario'

function DiseaseWorkflow(sources) {

    const logger = loggerFactory('signature', sources.onion.state$, 'settings.common.debug')

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
        .startWith({ text: 'Welcome to Disease Workflow', duration: 4000 })


    /** 
     * Parse feedback from vega components. Not used yet...
     */
    // const feedback$ = sources.vega.map(item => item).startWith(null).debug();
    // const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);

    const signatureForm = isolate(SignatureForm, { onion: formLens })(sources)
    const signature$ = signatureForm.output

    // Filter Form
    const filterForm = isolate(Filter, { onion: compoundFilterLens })({...sources, input: signature$ })
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

    // Similarity plot component
    const similarityPlot = isolate(SimilarityPlot, { onion: simLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ signature: s, filter: f })).remember() });

    // Histogram plot component
    const histogram = isolate(Histogram, { onion: histLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ signature: s, filter: f })).remember() });


    const headTableContainer = makeTable(SampleTable, sampleTableLens)

    // tables: Join settings from api and sourire into props
    const headTable = isolate(headTableContainer, { onion: headTableLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });


    const tailTableContainer = makeTable(SampleTable, sampleTableLens)

    // tables: Join settings from api and sourire into props
    const tailTable = isolate(tailTableContainer, { onion: tailTableLens })
        ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({ query: s, filter: f })).remember() });

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
            signatureForm.DOM,
            filterForm.DOM,
            histogram.DOM,
            similarityPlot.DOM,
            headTable.DOM,
            tailTable.DOM,
            // feedback$
        )
        .map(([
                form,
                filter,
                hist,
                simplot,
                headTable,
                tailTable,
                // feedback
            ]) =>
            div('.row .disease', { style: { margin: '0px 0px 0px 0px' } }, [
                form,
                div('.col .s10 .offset-s1', pageStyle, [
                    div('.row', [filter]),
                    div('.row ', [div('.col .s12 .l7', [
                        simplot,
                    ]), div('.col .s12 .l5', [
                        hist,
                    ])]),
                    div('.row', []),
                    div('.col .s12', [headTable]),
                    div('.row', []),
                    div('.col .s12', [tailTable]),
                    div('.row', [])
                ])
            ])
        );

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            signatureForm.log
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            signatureForm.onion,
            filterForm.onion,
            histogram.onion,
            similarityPlot.onion,
            headTable.onion,
            tailTable.onion,
            scenarioReducer$
        ),
        vega: xs.merge(
            histogram.vega,
            similarityPlot.vega
        ),
        HTTP: xs.merge(
            signatureForm.HTTP,
            histogram.HTTP,
            similarityPlot.HTTP,
            headTable.HTTP,
            tailTable.HTTP
        ),
        popup: scenarioPopup$
    };
}

export default DiseaseWorkflow;