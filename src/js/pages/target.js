import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, input, span } from '@cycle/dom';

import { TargetForm } from '../components/TargetForm'
import { makeTable, compoundContainerTableLens } from '../components/Table'

import { CompoundTable, compoundTableLens } from '../components/CompoundTable/CompoundTable'
import { Histogram, histLens } from '../components/Histogram/Histogram'

import { initSettings } from '../configuration.js'
import { loggerFactory } from '../utils/logger'
import isolate from '@cycle/isolate'
import { SignatureForm, formLens } from '../components/SignatureForm'
import { Filter, filterLens } from '../components/Filter'

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

    const logger = loggerFactory('target', sources.onion.state$, 'settings.common.debug')

    const formLens = {
        get: state => ({ form: state.form, settings: { form: state.settings.form, api: state.settings.api, common: state.settings.common} }),
        set: (state, childState) => ({...state, form: childState.form })
    };

    // Initialize if not yet done in parent (i.e. router) component (useful for testing)
    const defaultReducer$ = xs.of(prevState => {
        // compound -- defaultReducer
        if (typeof prevState === 'undefined') {
            return ({
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
    // TODO: Check if this is not better moved to the targetform component itself
    // Especially after the change in autocomplete behavior.
    const target$ = TargetFormSink.output.map(t => t.split(" (")[0])

    const TableContainer = makeTable(CompoundTable, compoundTableLens)

    const Table = isolate(TableContainer, { onion: compoundContainerTableLens })
        ({...sources, input: target$.map((t) => ({ query: t}) ).remember() });

    // Granular access to global state and parts of settings
    const thisFormLens = {
        get: state => ({ form: state.sform, settings: { form: state.settings.form, api: state.settings.api, common: state.settings.common } }),
        set: (state, childState) => ({...state, sform: childState.form })
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
    const filterForm = isolate(Filter, { onion: filterLens })({...sources, input: signature$ })
    const filter$ = filterForm.output

    // Histogram plot component
    const histogram = isolate(Histogram, { onion: histLens })
        ({...sources, input: xs.combine(signature$, filter$, target$).map(([s, f, t]) => ({ signature: s, filter: f, target: t })).remember() });

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
        ]) => div('.row .target', { style: { margin: '0px 0px 0px 0px' } }, [
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
            // logger(defaultReducer$, 'defaultReducer$'),
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
          filterForm.HTTP,
            Table.HTTP,
            signatureForm.HTTP,
            histogram.HTTP
        ),
        vega: xs.merge(
            histogram.vega,
        ),
        popup: scenarioPopup$, // ghost mode
        ac: TargetFormSink.ac
    };

}

export default TargetWorkflow
