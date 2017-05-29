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
import { between } from '../utils/utils'

export function Table(sources) {

    console.log('Starting component: Table...');

    const state$ = sources.onion.state$.debug(state => {
        console.log('== State in table =================')
        console.log(state)
    });
    const domSource$ = sources.DOM;
    const httpSource$ = sources.HTTP;
    const props$ = sources.props

    const modifiedState$ = state$
        .filter(state => state.query != '')
        .filter(state => state.query != null)
        .compose(dropRepeats((x, y) => equals(omit(['result'], x), omit(['result'], y))))

    const updatedProps$ = xs.combine(
        props$,
        sources.DOM.select('.plus5').events('click').mapTo(5).startWith(0).fold((x, y) => x + y, 0),
        sources.DOM.select('.min5').events('click').mapTo(5).startWith(0).fold((x, y) => x + y, 0)
    ).map(([props, add5, min5]) => {
        let isHead = (typeof props.head !== 'undefined')
        if (isHead) {
            const count = parseInt(props.head) + add5 - min5
            return merge(props, { head: count })
        } else {
            const count = parseInt(props.tail) + add5 - min5
            return merge(props, { tail: count + add5 - min5 })
        }
    })

    const request$ = xs.combine(
        modifiedState$,
        updatedProps$)
        .map(([state, props]) => ({
            send: merge(state, props),
            method: 'POST',
            url: props.url + '&classPath=com.dataintuitive.luciusapi.topTable',
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

    const data$ = validResponse$
        .map(result => result.body.result.data)

    // Delegate effective rendering to SampleTable:
    const sampleTable = isolate(SampleTable, 'result')(sources);

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

    const filterText$ = xs.combine(modifiedState$, props$)
        .map(([state, props]) => {
            if (isDefined(state.filter)) {
                console.log(state.filter)
                let filters = keys(state.filter)
                console.log(filters)
                let nonEmptyFilters = filter(key => prop(key, state.filter).length > 0, filters)
                console.log(nonEmptyFilters)
                let divs = map(key => div('.chip', chipStyle, [key, ': ', prop(key, state.filter)]), nonEmptyFilters)
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

    const initVdom$ = xs.of(div())

    const loadingVdom$ = xs.combine(request$, filterText$, props$)
        .map(([
            r,
            filterText,
            props,
        ]) => div([
            div('.row .valign-wrapper', { style: { 'margin-bottom': '0px', 'padding-top': '5px', 'background-color': props.color, opacity: 0.5 } }, [
                h5('.white-text .col .s5 .valign', props.title),
                div('.white-text .col .s7 .valign .right-align', filterText)
            ]),
            div('.progress ', [div('.indeterminate')])
        ]),
    )

     const loadedVdom$ = xs.combine(
        data$,
        sampleTable.DOM,
        props$,
        filterText$
    )
        .map(([
            data,
            dom,
            props,
            filterText
            ]) => div([
                div('.row .valign-wrapper', { style: { 'margin-bottom': '0px', 'padding-top': '5px', 'background-color': props.color } }, [
                    h5('.white-text .col .s5 .valign', props.title),
                    div('.white-text .col .s7 .valign .right-align', filterText)
                ]),
                div('.row', { style: { 'margin-bottom': '0px', 'margin-top': '0px' } }, [
                    dom,
                    div('.col .s12 .right-align', [
                        button('.min5 .btn-floating waves-effect waves-light', smallBtnStyle(props.color), [i('.material-icons', 'fast_rewind')]),
                        button('.plus5 .btn-floating waves-effect waves-light', smallBtnStyle(props.color), [i('.material-icons', 'fast_forward')])
                    ])
                ]),
            ])
        )
     
    const errorVdom$ = invalidResponse$.mapTo(div('.red .white-text', [p('An error occured !!!')]))

    const vdom$ = xs.merge(initVdom$, loadingVdom$, loadedVdom$, errorVdom$)

    const defaultReducer$ = xs.of(prevState => {
        console.log('table -- defaultReducer')
        return {}
    })

    // Make sure that the state is cycled in order for SampleTable to pick it up
    const stateReducer$ = data$.map(data => prevState => {
        console.log('table -- stateReducer')
        return merge(prevState, { result: data })
    })

    return {
        DOM: vdom$,
        HTTP: request$, //.compose(debounce(2000)),
        onion: xs.merge(
            defaultReducer$,
            stateReducer$,
        )
    };

}
