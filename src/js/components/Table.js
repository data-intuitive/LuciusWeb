import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import debounce from 'xstream/extra/debounce'
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h5, th, thead, tbody, i, span, ul, li } from '@cycle/dom';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, values, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'
import { SampleTable, sampleTableLens } from './SampleTable/SampleTable'
import isolate from '@cycle/isolate'
import dropRepeats from 'xstream/extra/dropRepeats'
import dropUntil from 'xstream/extra/dropUntil'
import { stateDebug } from '../utils/utils'
import { loggerFactory } from '~/../../src/js/utils/logger'

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const headTableLens = {
    get: state => ({
        core: state.headTable,
        settings: {
            table: state.settings.headTable,
            api: state.settings.api,
            common: state.settings.common,
            sourire: state.settings.sourire
        }
    }),
    set: (state, childState) => ({ ...state, headTable: childState.core, settings: { ...state.settings, headTable: childState.settings.table } })
};

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const tailTableLens = {
    get: state => ({
        core: state.tailTable,
        settings: {
            table: state.settings.tailTable,
            api: state.settings.api,
            common: state.settings.common,
            sourire: state.settings.sourire
        }
    }),
    set: (state, childState) => ({ ...state, tailTable: childState.core, settings: { ...state.settings, tailTable: childState.settings.table } })
};

function Table(sources) {

    const logger = loggerFactory('table', sources.onion.state$, 'settings.table.debug')

    const state$ = sources.onion.state$
    const domSource$ = sources.DOM;
    const httpSource$ = sources.HTTP;

    // Input handling
    const input$ = sources.input

    const newInput$ = xs.combine(
        input$,
        state$
    )
        .map(([newInput, state]) => ({ ...state, core: { ...state.core, input: newInput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))
        .remember()

    // When the component should not be shown, including empty signature
    const isEmptyState = (state) => {
        if (typeof state.core === 'undefined') {
            return true
        } else {
            if (typeof state.core.input === 'undefined') {
                return true
            } else {
                if (state.core.input.signature === '') {
                    return true
                } else {
                    return false
                }
            }
        }
    }

    // Split off properties in separate stream to make life easier in subcomponents
    const props$ = state$
        .filter(state => !isEmptyState(state))
        .map(state => state.settings)
        .remember()

    const modifiedState$ = state$
        .filter(state => !isEmptyState(state))
    // .compose(dropRepeats(equals))

    const emptyState$ = state$
        .filter(state => isEmptyState(state))

    const plus5$ = sources.DOM.select('.plus5').events('click').mapTo(5).startWith(0).fold((x, y) => x + y, 0).remember()
    const min5$ = sources.DOM.select('.min5').events('click').mapTo(5).startWith(0).fold((x, y) => x + y, 0).remember()
    const plus10$ = sources.DOM.select('.plus10').events('click').mapTo(10).startWith(0).fold((x, y) => x + y, 0).remember()
    const min10$ = sources.DOM.select('.min10').events('click').mapTo(10).startWith(0).fold((x, y) => x + y, 0).remember()

    const triggerRequest$ = xs.combine(
        newInput$,
        plus5$,
        min5$,
        plus10$,
        min10$
    ).map(([state, plus5, min5, plus10, min10]) => {
        let isHead = (state.settings.table.title === 'Top Table')
        const cnt = parseInt(state.settings.table.count) + plus5 - min5 + plus10 - min10
        return (isHead)
            ? ({ ...state, core: { ...state.core, count: { head: cnt } } })
            : ({ ...state, core: { ...state.core, count: { tail: cnt } } })
    }
        )
        .compose(dropRepeats((x, y) => equals(x.core, y.core)))
        .filter(state => state.core.input.signature != '')

    const request$ = triggerRequest$
        .map(state => ({
            send: merge(state.core.count, {
                query: state.core.input.signature,
                version: 'v2',
                filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : ''
            }
            ),
            method: 'POST',
            url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.topTable',
            category: 'topTable'
        }))
        .remember()

    const response$$ = sources.HTTP
        .select('topTable')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()
        .remember()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()
        .remember()

    const data$ = validResponse$
        .map(result => result.body.result.data)

    // const sampleTable = isolate(SampleTable, 'core.data')({...sources, props: props$});
    const sampleTable = isolate(SampleTable, { onion: sampleTableLens })({ ...sources, props: props$ });

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
            if (isDefined(state.core.input.filter)) {
                let filters = keys(state.core.input.filter)
                let nonEmptyFilters = filter(key => prop(key, state.core.input.filter).length > 0, filters)
                let divs = map(key => div('.chip', chipStyle, [key, ': ', prop(key, state.core.input.filter)]), nonEmptyFilters)
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
            'color': 'white',
            opacity: 0.8,
            fontWeight: 'lighter',
            fontSize: '16px',
            'vertical-align': 'middle'
        }
    })

    const initVdom$ = emptyState$.mapTo(div())

    const loadingVdom$ = request$.compose(sampleCombine(filterText$, modifiedState$))
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


    function convertToCSV(objArray) {
        const header = keys(objArray[0])
        const data = objArray.map(obj => values(obj))

        const arrArray = [header].concat(data)

        const csv = arrArray.map(arr => arr.map(el => el.toString()).join('\t')).join('\n')

        return csv;
    }

    const csvData$ = data$.map(data => convertToCSV(data)).map(csv => "text/csv;charset=utf-8," + encodeURIComponent(csv))
    const jsonData$ = data$.map(json => "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json)))

    const loadedVdom$ = xs.combine(sampleTable.DOM, csvData$, jsonData$, filterText$, modifiedState$)
        .map(([
            dom,
            csvData,
            jsonData,
            filterText,
            state
        ]) => div('.page', [
            div('.row .valign-wrapper .switch', { style: { 'margin-bottom': '0px', 'padding-top': '5px', 'background-color': state.settings.table.color } }, [
                h5('.white-text .col', [
                    state.settings.table.title,
                    span([' ']),
                    i('.material-icons .grey-text', {
                        style: {
                            fontSize: '16px',
                            'background-color': state.settings.table.color,
                            opacity: 0.5,
                        }
                    }, 'add')
                ]),
                div('.white-text .col .s7 .valign .right-align', filterText)
            ]),
            div('.row .valign-wrapper', { style: { 'margin-bottom': '0px', 'padding-top': '0px', 'background-color': state.settings.table.color, opacity: 0.8 } }, [
                (state.settings.table.expandOptions)
                    ? div([
                        button('.btn-flat .waves-effect .waves-light', smallBtnStyle(state.settings.table.color), [
                            a('', { style: { 'color': 'white' }, props: { href: 'data:' + csvData, download: 'table.csv' } }, [
                                span({ style: { 'vertical-align': 'top', fontSize: '8px' } }, 'csv'),
                                i('.material-icons', 'file_download'),
                            ])
                        ]),
                        button('.btn-flat .waves-effect .waves-light', smallBtnStyle(state.settings.table.color), [
                            a('', { style: { 'color': 'white' }, props: { href: 'data:' + jsonData, download: 'table.json' } }, [
                                span({ style: { 'vertical-align': 'top', fontSize: '8px' } }, 'json'),
                                i('.material-icons', 'file_download'),
                            ])
                        ]),
                        button('.min10 .btn-flat .waves-effect .waves-light', smallBtnStyle(state.settings.table.color), [
                            span({ style: { 'vertical-align': 'top', fontSize: '10px' } }, '-10'),
                            i('.material-icons', 'fast_rewind'),
                        ]),
                        button('.min5 .btn-flat .waves-effect .waves-light', smallBtnStyle(state.settings.table.color), [
                            span({ style: { 'vertical-align': 'top', fontSize: '10px' } }, '-5'),
                            i('.material-icons', 'fast_rewind'),
                        ]),
                        button('.plus5 .btn-flat .waves-effect .waves-light', smallBtnStyle(state.settings.table.color), [
                            span({ style: { 'vertical-align': 'top', fontSize: '10px' } }, '+5'),
                            i('.material-icons', 'fast_forward')
                        ]),
                        button('.plus10 .btn-flat .waves-effect .waves-light', smallBtnStyle(state.settings.table.color), [
                            span({ style: { 'vertical-align': 'top', fontSize: '10px' } }, '+10'),
                            i('.material-icons', 'fast_forward')
                        ])
                    ])
                    : div()
            ]),
            div('.row', { style: { 'margin-bottom': '0px', 'margin-top': '0px' } }, [
                dom,
                // div('.col .s6', [
                //     i('.tiny .material-icons', { style: { fontSize: '10px', fontColor: 'grey' } }, 'file_download'),
                // ]),
                // div('.col .s6 .right-align', [
                //     i('.small .material-icons .orange-text', { style: { fontSize: '20px', fontColor: state.settings.table.color } }, 'file_download'),
                //     button('.min5 .btn-floating waves-effect waves-light', smallBtnStyle(state.settings.table.color), [
                //         i('.material-icons', 'fast_rewind')
                //     ]),
                //     // button('.plus5 .btn-floating waves-effect waves-light .tiny', smallBtnStyle(state.settings.table.color), [
                //     i('.plus5 .material-icons', { style: { fontSize: '16px' } }, 'fast_forward')
                //     // ])
                // ]),
                // // test !!!
                // a('.col .s6 .offset-s3 .btn .center .grey', { props: { href: 'data:' + data, download: 'compass-state.csv' } }, 'download')
            ]),
        ])
        )

    const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

    const vdom$ = xs.merge(
        initVdom$,
        errorVdom$,
        loadingVdom$,
        loadedVdom$
    )
        .startWith(div())

    // Default Re
    const defaultReducer$ = xs.of(prevState => ({ ...prevState, core: { ...prevState.core, input: { signature: '' } } }))

    // Add input to state
    const inputReducer$ = input$.map(i => prevState =>
        // inputReducer
        ({ ...prevState, core: { ...prevState.core, input: i } })
    )
    // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({ ...prevState, core: { ...prevState.core, request: req } }))

    const dataReducer$ = data$.map(newData => prevState => ({ ...prevState, core: { ...prevState.core, data: newData } }))

    const switchReducer$ = sources.DOM.select('.switch').events('click').fold((x, y) => !x, false)
        .map(bool => prevState => ({ ...prevState, settings: { ...prevState.settings, table: { ...prevState.settings.table, expandOptions: bool } } }))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            logger(request$, 'request$'),
            logger(validResponse$, 'validResponse$'),
            logger(invalidResponse$, 'invalidResponse$'),
            logger(csvData$, 'stringData$'),
        ),
        DOM: vdom$,
        HTTP: request$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$,
            switchReducer$
        )
    };

}

export { Table, headTableLens, tailTableLens }