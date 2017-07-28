import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import debounce from 'xstream/extra/debounce'
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h5, th, thead, tbody, i, span, ul, li } from '@cycle/dom';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'
import { SampleTable } from './SampleTable/SampleTable'
import isolate from '@cycle/isolate'
import dropRepeats from 'xstream/extra/dropRepeats'
import dropUntil from 'xstream/extra/dropUntil'
import { stateDebug } from '../utils/utils'

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const headTableLens = { 
    get: state => ({
        table: state.headTable,
        results: state.headTable.results, 
        settings: {
            table: state.settings.headTable, 
            api: state.settings.api, 
            common: state.settings.common,
            sourire: state.settings.sourire
        }
    }),
    set: (state, childState) => ({...state, headTable: childState.table})
};

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const tailTableLens = { 
    get: state => ({
        table: state.tailTable,
        results: state.tailTable.results, 
        settings: {
            table: state.settings.tailTable, 
            api: state.settings.api, 
            common: state.settings.common,
            sourire: state.settings.sourire
         }
    }),
    set: (state, childState) => ({...state, tailTable: childState.table})
};

function Table(sources) {

    console.log('Starting component: Table...');

    const state$ = sources.onion.state$
                    .debug(stateDebug('table'));
    const domSource$ = sources.DOM;
    const httpSource$ = sources.HTTP;

    // Split off properties in separate stream to make life easier in subcomponents
    const props$ = state$.map(state => state.settings).debug()

    const modifiedState$ = state$
        .filter(state => state.table.query != null && state.table.query != '')
        .compose(dropRepeats((x, y) => equals(x.results, y.results)))
        .debug()

    const emptyState$ = state$
         .filter(state => state.table.query == null || state.table.query == '')
         .compose(dropRepeats((x, y) => equals(x.results, y.results)))

    const updatedSettings$ = xs.combine(
            modifiedState$,
            sources.DOM.select('.plus5').events('click').mapTo(5).startWith(0).fold((x, y) => x + y, 0),
            sources.DOM.select('.min5').events('click').mapTo(5).startWith(0).fold((x, y) => x + y, 0)
        ).map(([state, add5, min5]) => {
            let isHead = (state.settings.table.title === 'Top Table')
            const count = parseInt(state.settings.table.count) + add5 - min5
            if (isHead) {
                return {...state, table: {...state.table,  head: count }}
            } else {
                return {...state, table: {...state.table,  tail: count }}
            }
            
    }).debug()

    const request$ = updatedSettings$
        .map(state => ({
            send: merge(state.table, state.settings.table),
            method: 'POST',
            url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.topTable',
            category: 'topTable'
        })).debug()

    const response$$ = sources.HTTP
        .select('topTable')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()
        .debug()

    const data$ = validResponse$
        .map(result => result.body.result.data)

    // Delegate effective rendering to SampleTable:
    const sampleTable = isolate(SampleTable, 'results')({...sources, props: props$});

    function isDefined(obj) {
        if (typeof obj !== 'undefined') {
            return true
        } else {
            return false
        }
    }

    const chipStyle = {
        style: {
            fontWeight: 'lighter',
            'color': 'rgba(255, 255, 255, 0.5)',
            'background-color': 'rgba(0, 0, 0, 0.2)'
        }
    }

    const filterText$ = modifiedState$
        .map(state => {
            if (isDefined(state.filter)) {
                console.log(state.table.filter)
                let filters = keys(state.table.filter)
                console.log(filters)
                let nonEmptyFilters = filter(key => prop(key, state.table.filter).length > 0, filters)
                console.log(nonEmptyFilters)
                let divs = map(key => div('.chip', chipStyle, [key, ': ', prop(key, state.table.filter)]), nonEmptyFilters)
                console.log(divs)
                return divs
            } else {
                return []
            }
        }).startWith([])

    const smallBtnStyle = bgcolor => ({
        style: {
            'margin-bottom': '0px',
            'margin-top': '0px',
            'background-color': bgcolor,
            opacity: 0.3,
            fontWeight: 'lighter'
        }
    })

    const initVdom$ = emptyState$.mapTo(div())

    const loadingVdom$ = xs.combine(request$, filterText$, modifiedState$)
        .map(([
            r,
            filterText,
            state
        ]) => div([
            div('.row .valign-wrapper', { style: { 'margin-bottom': '0px', 'padding-top': '5px', 'background-color': state.settings.table.color, opacity: 0.5 } }, [
                h5('.white-text .col .s5 .valign', state.settings.table.title),
                div('.white-text .col .s7 .valign .right-align', filterText)
            ]),
            div('.progress ', [div('.indeterminate')])
        ]),
    )

     const loadedVdom$ = xs.combine(
        data$,
        sampleTable.DOM,
        filterText$,
        modifiedState$
    )
        .map(([
            data,
            dom,
            filterText,
            state
            ]) => div([
                div('.row .valign-wrapper', { style: { 'margin-bottom': '0px', 'padding-top': '5px', 'background-color': state.settings.table.color } }, [
                    h5('.white-text .col .s5 .valign', state.settings.table.title),
                    div('.white-text .col .s7 .valign .right-align', filterText)
                ]),
                div('.row', { style: { 'margin-bottom': '0px', 'margin-top': '0px' } }, [
                    dom,
                    div('.col .s12 .right-align', [
                        button('.min5 .btn-floating waves-effect waves-light', smallBtnStyle(state.settings.table.color), [i('.material-icons', 'fast_rewind')]),
                        button('.plus5 .btn-floating waves-effect waves-light', smallBtnStyle(state.settings.table.color), [i('.material-icons', 'fast_forward')])
                    ])
                ]),
            ])
        )
     
    const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

    const vdom$ = xs.merge(
        loadingVdom$, 
        loadedVdom$, 
        errorVdom$, 
        initVdom$
        )

    // Make sure that the state is cycled in order for SampleTable to pick it up
    const stateReducer$ = data$.map(data => prevState => {
        console.log('table -- stateReducer')
        let newState = {
            ...prevState,  
            table: {...prevState.table, 
                results: data
            }
        }
        console.log(prevState)
        console.log(newState)
        return newState
    })

    return {
        DOM: vdom$,
        HTTP: request$, //.compose(debounce(2000)),
        onion: xs.merge(
            stateReducer$,
        )
    };

}

export { Table, headTableLens, tailTableLens }