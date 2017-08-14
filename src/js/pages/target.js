import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, input } from '@cycle/dom';
import { merge, prop, equals } from 'ramda';
import BMI from '../examples/bmi';
import Hello from '../examples/hello-world';
import { HttpRequest } from "../examples/http-request"

import { Check } from '../components/Check'
import { IsolatedSettings } from './settings'
import { TargetForm } from '../components/TargetForm'
import { makeTable, compoundContainerTableLens } from '../components/Table'

import { SampleTable, sampleTableLens } from '../components/SampleTable/SampleTable'
import { CompoundTable, compoundTableLens } from '../components/CompoundTable/CompoundTable'

import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from './settings'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'
import isolate from '@cycle/isolate'

function TargetWorkflow(sources) {

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
                    compoundTable: {}
                })
        } else {
            return ({
                ...prevState,
                settings: prevState.settings,
                form: {},
                compoundTable: {}
            })
        }
    })

    const TargetFormSink = isolate(TargetForm, { onion: formLens })(sources)
    const targets$ = TargetFormSink.output//.startWith('MELK')

    const TableContainer = makeTable(CompoundTable, compoundTableLens)

    const Table = isolate(TableContainer, { onion: compoundContainerTableLens })
        ({ ...sources, input: targets$.map((t) => ({ query: t })).remember() });

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
        Table.DOM
    )
        .map(([
            formDOM,
            table,
            //     tailTable
        ]) => div('.row .target', [
            formDOM,
            div('.col .s10 .offset-s1', pageStyle, [
                div('.row', []),
                div('.col .s12', [table]),
                div('.row', []),
             ])
        ]))

    return {
        log: xs.merge(
            logger(defaultReducer$, 'defaultReducer$'),
            logger(targets$, 'targets$'),
            TargetFormSink.log,
            Table.log
        ),
        DOM: vdom$.remember(),
        onion: xs.merge(
            defaultReducer$,
            TargetFormSink.onion,
            Table.onion
        ),
        HTTP: xs.merge(
            TargetFormSink.HTTP,
            Table.HTTP
        )
        // router: router$
    };

}

export default TargetWorkflow