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
import { loggerFactory } from '~/../../src/js/utils/logger'

export default function CompoundWorkflow(sources) {

    const logger = loggerFactory('compound', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$
    
    const formLens = { 
        get: state => ({form: state.form, settings: {form: state.settings.form, api: state.settings.api}}),
        set: (state, childState) => ({...state, form: childState.form})
    };

    const CompoundFormSink = isolate(CompoundForm, {onion: formLens})(sources)
    const signature$ = CompoundFormSink.output

    // Initialize if not yet done in parent (i.e. router) component (useful for testing)
    const defaultReducer$ = xs.of(prevState => {
        // compound -- defaultReducer
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

    // Filter Form
    const filterForm = isolate(Filter, 'compoundfilter')({...sources, input: signature$})
    const filter$ = filterForm.output

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
        ]) => div('.row .compound', [
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
        log: xs.merge(
            logger(state$, 'state$'),
            CompoundFormSink.log,
            filterForm.log,
            similarityPlot.log,
            histogram.log,
            headTable.log,
            tailTable.log
        ),
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
    };
}
