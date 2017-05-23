import { i, a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll } from 'ramda'
import { CompoundForm } from '../components/CompoundForm'
import dropRepeats from 'xstream/extra/dropRepeats'
import { initSettings } from './settings'
import { Table } from '../components/Table'
import { Histogram } from '../components/Histogram/Histogram'
import { SimilarityPlot } from '../components/SimilarityPlot/SimilarityPlot'
import { Filter } from '../components/Filter'

export default function CompoundWorkflow(sources) {

    const state$ = sources.onion.state$.debug(state => {
        console.log('== State in compound =================')
        console.log(state)
    });

    const formProps$ = state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .startWith({ settings: initSettings })
        .map(state => merge(state.settings.form, state.settings.api))
    const CompoundFormSink = isolate(CompoundForm, 'compoundWorkflow')(merge(sources, { props: formProps$ }))

    const signature$ = CompoundFormSink.signature.debug()

    // Initialize if not yet done in parent (i.e. router) component (useful for testing)
    const defaultReducer$ = xs.of(prevState => {
        console.log('compound -- defaultReducer')
        if (typeof prevState === 'undefined') {
            return (
                {
                    settings: initSettings,
                })
        } else {
            // return (
            //     {
            //         settings: initSettings,
            //     })
             return prevState
        }
    })

    // Propagate query to state of individual components
    const stateReducer$ = signature$.map(query => prevState => {
        console.log('compound -- stateReducer')
        let additionalState = {
            headTable: merge(prevState.headTable, { query: query }),
            tailTable: merge(prevState.tailTable, { query: query }),
            hist: merge(prevState.hist, { query: query }),
            sim: merge(prevState.sim, { query: query }),
            filter: {}
        }
        return merge(prevState, additionalState)
    })

    // Filter Form
    const filterForm = isolate(Filter, 'filter')(sources)

    // Propagate filter to state of individual components
    const filterReducer$ = filterForm.filter.map(f => prevState => {
        console.log('signature -- filterReducer')
        let additionalState = {
            headTable: merge(prevState.headTable, { filter: f }),
            tailTable: merge(prevState.tailTable, { filter: f }),
            hist: merge(prevState.hist, { filter: f }),
            sim: merge(prevState.sim, { filter: f })
        }
        return merge(prevState, additionalState)
    })

    // Similarity plot component
    const simProps$ = state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .startWith({ settings: initSettings })
        .map(state => merge(state.settings.sim, state.settings.api))
    const similarityPlot = isolate(SimilarityPlot, 'sim')(merge(sources, { props: simProps$ }));

    // histogram component
    const histProps$ = state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .startWith({ settings: initSettings })
        .map(state => merge(state.settings.hist, state.settings.api))
    const histogram = isolate(Histogram, 'hist')(merge(sources, { props: histProps$ }));

    // tables: Join settings from api and sourire into props
    const headTableProps$ = state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .startWith({ settings: initSettings })
        .map(state => merge(merge(state.settings.headTableSettings, state.settings.api), state.settings.sourire))
    const tailTableProps$ = state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .startWith({ settings: initSettings })
        .map(state => merge(merge(state.settings.tailTableSettings, state.settings.api), state.settings.sourire))
    const headTable = isolate(Table, 'headTable')(merge(sources, { props: headTableProps$ }));
    const tailTable = isolate(Table, 'tailTable')(merge(sources, { props: tailTableProps$ }));

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
        CompoundFormSink.DOM,
        filterForm.DOM,
        similarityPlot.DOM, //.DOM.startWith(''),
        histogram.DOM, //.startWith(''),
        headTable.DOM,
        tailTable.DOM
    )
        .map(([
            formDOM,
            filter,
            simplot,
            hist,
            headTable,
            tailTable
        ]) => div('.row .orange .lighten-5 ', [
            formDOM,
            div('.col .s10 .offset-s1', pageStyle, [
                div('.row', [filter]),
                 div('.row ', [
                    div('.col .s12 .l7', [simplot]),
                    div('.col .s12 .l5', [hist])
                ]),
               div('.row', []),
                div('.col .s12', [headTable]),
                div('.row', []),
                div('.col .s12', [tailTable])
            ])
        ]))

    return {
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            CompoundFormSink.onion,
            stateReducer$,
            filterReducer$,
            headTable.onion,
            tailTable.onion
        ),
        HTTP: xs.merge(
            CompoundFormSink.HTTP,
            similarityPlot.HTTP,
            histogram.HTTP,
            headTable.HTTP,
            tailTable.HTTP
        ),
        vega: xs.merge(
           histogram.vega,
            similarityPlot.vega,
         )
    };
}
