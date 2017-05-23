import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody } from '@cycle/dom';
import { clone, equals, merge } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'


const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}
function SampleSelection(sources) {

    const state$ = sources.onion.state$.debug()

    const compoundQuery$ = sources.query//.startWith('1211912 123175')

    const request$ = xs.combine(compoundQuery$, sources.props)
        .map(([query, props]) => {
            return {
                url: props.url + '&classPath=com.dataintuitive.luciusapi.samples',
                method: 'POST',
                send: {
                    version: 'v2',
                    query: query
                },
                'category': 'samples'
            }
        })

    const response$ = sources.HTTP
        .select('samples')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()
        .debug()

    const data$ = response$
        .map(res => res.body)
        // .startWith(emptyData.body)
        .map(json => json.result.data)
        .debug()

    const useClick$ = sources.DOM
        .select('.selection')
        .events('click')
        .debug()
        .map(ev => ev.ownerTarget.id)

    // Helper function for rendering the table, based on the state
    const makeTable = (data) => {
        let rows = data.map(entry => [
            td(entry.jnjs),
            td((entry.compoundname.length > 10) ? entry.compoundname.substring(0, 10) : entry.compoundname),
            td(entry.id),
            td(entry.protocolname),
            td(entry.concentration),
            td(entry.batch),
            td(entry.year),
            td((entry.targets.length > 0) ? entry.targets.length : 0),
            td('.selection', { props: { id: entry.id } }, [
                input('.switch', { props: { type: 'checkbox', checked: entry.use, id: entry.id } }),
                label('', { props: { id: entry.id } })
            ])
        ]);
        const header = tr([
            th('JNJ'),
            th('Name'),
            th('Sample'),
            th('Protocol'),
            th('Conc'),
            th('Batch'),
            th('Year'),
            th('Nr. Targets'),
            th('Use?')
        ]);

        let body = [];
        rows.map(row => body.push(tr(row)));
        const tableContent = [thead([header]), tbody(body)];

        return (
            div([
                div('.row', [
                    div('.col .s6 .offset-s3', [table('.striped', tableContent)]),
                    div('.row .s6 .offset-s3', [
                        button('.doSelect .btn .col .offset-s4 .s4 .orange .darken-2', 'Select'),
                    ]),
                ])
            ])
        );
    }

    const vdom$ = state$
        .map((data) => makeTable(data))

    const defaultReducer$ = data$.map(data => prevState => {
        console.log('Default reducer')
        return data.map(el => merge(el, { use: true }))
    })

    const selectReducer$ = useClick$.map(id => prevState => {
        var newState = clone(prevState)
        return newState.map(el => {
            // One sample object
            var newEl = clone(el)
            const switchUse = (id === el.id)
            newEl.use = (switchUse) ? !el.use : el.use
            return newEl
        })

    })

    const sampleSelection$ = sources.DOM.select('.doSelect').events('click')
        .compose(sampleCombine(state$))
        .debug()
        .map(([ev, state]) => state.filter(x => x.use).map(x => x.id))
        .debug()

    return {
        DOM: vdom$,
        selection: sampleSelection$,
        HTTP: request$,
        onion: xs.merge(
            defaultReducer$,
            selectReducer$
        )
    }

}

export { SampleSelection }