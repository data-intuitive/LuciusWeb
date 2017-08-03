import { i, a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll } from 'ramda'
import { CompoundForm } from '../components/CompoundForm'
import dropRepeats from 'xstream/extra/dropRepeats'
import { initSettings } from './settings'
import { Table, headTableLens, tailTableLens } from '../components/Table'
import { Histogram, histLens } from '../components/Histogram/Histogram'
import { SimilarityPlot, simLens } from '../components/SimilarityPlot/SimilarityPlot'
import { Filter } from '../components/Filter'
import concat from 'xstream/extra/dropRepeats'

export default function CompoundWorkflow(sources) {

    const state$ = sources.onion.state$
    
    const stateLogger$ = state$
        .map(state => ([
            '>> State in compound =================\n', 
            state
        ]))

    const formLens = { 
        get: state => ({form: state.form, settings: {form: state.settings.form, api: state.settings.api}}),
        set: (state, childState) => ({...state, form: childState.form})
    };

    const CompoundFormSink = isolate(CompoundForm, {onion: formLens})(sources)
    const signature$ = CompoundFormSink.output//.startWith('BRCA1')

    // Initialize if not yet done in parent (i.e. router) component (useful for testing)
    const defaultReducer$ = xs.of(prevState => {
        console.log('compound -- defaultReducer')
        if (typeof prevState === 'undefined') {
            return (
                {
                    settings: initSettings,
                    form: {},
                    sim: {},
                    hist: {},
                })
        } else {
             return ({...prevState,
                settings: prevState.settings, 
                form: {},
                sim: {},
                hist: {},
             })
        }
    })
    .debug()

    // Propagate query to state of individual components
    // const stateReducer$ = signature$.map(query => prevState => {
    //     console.log('compound -- stateReducer')
    //     let additionalState = {
    //         headTable: merge(prevState.headTable, { query: query }),
    //         tailTable: merge(prevState.tailTable, { query: query }),
    //         compoundhist: merge(prevState.compoundhist, { query: query }),
    //         compoundsim: merge(prevState.compoundsim, { query: query }),
    //         compoundfilter: {}
    //     }
    //     return merge(prevState, additionalState)
    // })

    // Filter Form
    const filterForm = isolate(Filter, 'compoundfilter')({...sources, input: signature$})
    const filter$ = filterForm.output

    // Propagate filter to state of individual components
    // const filterReducer$ = filterForm.filter.map(f => prevState => {
    //     console.log('signature -- filterReducer')
    //     let additionalState = {
    //         headTable: merge(prevState.headTable, { filter: f }),
    //         tailTable: merge(prevState.tailTable, { filter: f }),
    //         compoundhist: merge(prevState.compoundhist, { filter: f }),
    //         compoundsim: merge(prevState.compoundsim, { filter: f }),
    //         form: merge(prevState.form, {filter: f})
    //     }
    //     return merge(prevState, additionalState)
    // })

	// Similarity plot component
	const similarityPlot = isolate(SimilarityPlot, {onion: simLens})
                                  ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

	// Histogram plot component
	const histogram = isolate(Histogram, {onion: histLens})
                            ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

    // tables: Join settings from api and sourire into props
    const headTable = isolate(Table, {onion: headTableLens})
                             ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});

    // tables: Join settings from api and sourire into props
    const tailTable = isolate(Table, {onion: tailTableLens})
                             ({...sources, input: xs.combine(signature$, filter$).map(([s, f]) => ({signature: s, filter: f})).remember()});


    // const tailTableProps$ = state$
    //     .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
    //     .startWith({ settings: initSettings })
	// 	.map(state => merge(merge(merge(state.settings.tailTableSettings, state.settings.common), state.settings.api), state.settings.sourire))
    // const tailTable = isolate(Table, 'tailTable')(merge(sources, { props: tailTableProps$ }));

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
        similarityPlot.DOM, 
        histogram.DOM, 
        headTable.DOM,
        tailTable.DOM,
        // state$
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
                    div('.col .s12 .l5', [hist]),
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
            similarityPlot.onion,
            histogram.onion,
            filterForm.onion,
            headTable.onion,
            tailTable.onion
        ),
        HTTP: xs.merge(
            CompoundFormSink.HTTP,
            histogram.HTTP,
            similarityPlot.HTTP,
            headTable.HTTP,
            tailTable.HTTP
        ),
        vega: xs.merge(
            histogram.vega,
            similarityPlot.vega
        ),
        log: stateLogger$
    };
}
