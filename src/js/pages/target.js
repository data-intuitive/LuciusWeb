import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, input, span } from '@cycle/dom';
import { merge, prop, equals, mergeAll, mergeWith, mergeDeepRight } from 'ramda';

// import { mockDOMSource } from '@cycle/dom'

import { Check } from '../components/Check'
import { IsolatedSettings } from './settings'
import { TargetForm } from '../components/TargetForm'
import { makeTable, compoundContainerTableLens } from '../components/Table'

import { SampleTable, sampleTableLens } from '../components/SampleTable/SampleTable'
import { CompoundTable, compoundTableLens } from '../components/CompoundTable/CompoundTable'
import { Histogram, histLens } from '../components/Histogram/Histogram'

import { pick, mix } from 'cycle-onionify';
import { initSettings } from './settings'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'
import isolate from '@cycle/isolate'
import { SignatureForm, formLens } from '../components/SignatureForm'
import { Filter } from '../components/Filter'

// Support for ghost mode
import { scenario } from '../scenarios/targetScenario'
import { runScenario } from '../utils/scenario'


function TargetWorkflow(sources) {

    // EXPERIMENTS with mockDOMSource
    // const domSource = mockDOMSource({
    //     '.___form': {
    //         '.___check': {
    //             // '.Default': {
    //             //     'click': xs.of({ target: {} }).compose(delay(1000)).remember()
    //             // },
    //             '.TargetQuery': {
    //                 'input': concat(
    //                     xs.of( {target : { value : "ME"} }  ).compose(delay(500)),
    //                     xs.of( {target : { value : "MEL"} } ).compose(delay(800))
    //                 )
    //             },
    //             '.TargetComplete': {
    //                 'click': xs.of({ target: {parentNode : {dataset : { index : "MELK"}}}}).compose(delay(3000))
    //             },
    //             '.TargetCheck': {
    //                 'click': xs.of({ target: {} }).compose(delay(8000))
    //             }
    //         }
    //     },
    // });

    // sources = { ...sources, DOM: mergeDeepRight(sources.DOM, domSource) }

    const logger = loggerFactory('target', sources.onion.state$, 'settings.debug')

    const formLens = {
        get: state => ({ form: state.form, settings: { form: state.settings.form, api: state.settings.api } }),
        set: (state, childState) => ({ ...state, form: childState.form })
    };

    // Initialize if not yet done in parent (i.e. router) component (useful for testing)
    const defaultReducer$ = xs.of(prevState => {
        // compound -- defaultReducer
        if (typeof prevState === 'undefined') {
            return (
                {
                    settings: initSettings,
                    form: {},
                    compoundTable: {},
                    sform: {},
                    filter: {},
                    hist: {}
                })
        } else {
            return ({
                ...prevState,
                settings: prevState.settings,
                form: {},
                compoundTable: {},
                sform: {},
                filter: {},
                hist: {}
            })
        }
    })

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
            .startWith({ text: 'Welcome to Target Workflow', duration: 4000 })

    const TargetFormSink = isolate(TargetForm, { onion: formLens, DOM: 'form' })(sources)
    const target$ = TargetFormSink.output

    const TableContainer = makeTable(CompoundTable, compoundTableLens)

    const Table = isolate(TableContainer, { onion: compoundContainerTableLens })
        ({ ...sources, input: target$.map((t) => ({ query: t })).remember() });

    // Granular access to global state and parts of settings
    const thisFormLens = {
        get: state => ({ form: state.sform, settings: { form: state.settings.form, api: state.settings.api } }),
        set: (state, childState) => ({ ...state, sform: childState.form })
    };

    const signatureForm = isolate(SignatureForm, { onion: thisFormLens })(sources)
    // only show signature form when a target has been selected !!!
    const signatureMessage$ = xs.of('Optional Signature:')
    const signatureFormVdom$ = xs.combine(signatureForm.DOM, signatureMessage$, target$).map(([s, m, t]) =>
        div([
            p('.col .s12', { style: { margin: "0px 0px 0px 0px", padding: 0 } }, [m]),
            div('.col .s12', { style: { margin: "0px 0px 0px 0px", padding: 0 } }, [s])
        ]),
    ).startWith(div())
    const signature$ = signatureForm.output

    // Filter Form
    const filterForm = isolate(Filter, 'filter')({ ...sources, input: signature$ })
    const filter$ = filterForm.output

    // Histogram plot component
    const histogram = isolate(Histogram, { onion: histLens })
        ({ ...sources, input: xs.combine(signature$, filter$, target$).map(([s, f, t]) => ({ signature: s, filter: f, target: t })).remember() });

    const pageStyle = {
        style:
        {
            fontSize: '14px',
            opacity: '0',
            transition: 'opacity 1s',
            delayed: { opacity: '1' },
            destroy: { opacity: '0' }
        }
    }

    const vdom$ = xs.combine(
        TargetFormSink.DOM,
        Table.DOM,
        signatureFormVdom$,
        filterForm.DOM,
        histogram.DOM
    )
        .map(([
            formDOM,
            table,
            signatureForm,
            filter,
            hist
        ]) => div('.row .target', [
            formDOM,
            div('.col .s10 .offset-s1', [signatureForm]),
            div('.row', ''),
            div('.col .s10 .offset-s1', pageStyle, [
                div('.row', [filter]),
                div('.row ', [div('.col .s12 .l6 .offset-l3', [
                    hist
                ])]),
            ]),
            div('.row', ''),
            div('.col .s10 .offset-s1', pageStyle, [
                div('.col .s12', [table]),
                div('.row', []),
            ]),
            div('.row', '')
        ]))

    return {
        log: xs.merge(
            logger(defaultReducer$, 'defaultReducer$'),
            logger(target$, 'target$'),
            TargetFormSink.log,
            Table.log,
            histogram.log,
            // logger(popup$, 'popup$')
        ),
        DOM: vdom$.remember(),
        onion: xs.merge(
            defaultReducer$,
            TargetFormSink.onion,
            Table.onion,
            signatureForm.onion,
            filterForm.onion,
            histogram.onion,
            // ghost mode
            scenarioReducer$
        ),
        HTTP: xs.merge(
            TargetFormSink.HTTP,
            Table.HTTP,
            signatureForm.HTTP,
            histogram.HTTP
        ),
        vega: xs.merge(
            histogram.vega,
        ),
        popup: scenarioPopup$ // ghost mode
    };

}

export default TargetWorkflow