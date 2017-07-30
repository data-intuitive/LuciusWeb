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

const sampleSelectionLens = { 
    get: state => ({sampleSelection: state.form.sampleSelection, settings: state.settings}),
    set: (state, childState) => ({...state, form: {...state.form, sampleSelection: childState.sampleSelection}})
};

/**
 * Based on a (list of) compound(s), get the samples that correspond to it and allow users to select them.
 * 
 * input: compound(s) (string)
 * output: list of samples (array)
 */
function SampleSelection(sources) {

    const state$ = sources.onion.state$.debug(state => {
        console.log('== State in SampleSelection =================')
        console.log(state)
    });

    const input$ = sources.input

    const emptyState$ = state$
         .filter(state => state.sampleSelection.input == null || state.sampleSelection.input == '')
         .compose(dropRepeats((x, y) => equals(x, y)))

    // When the state is cycled because of an internal update
    const modifiedState$ = 	state$
        .filter(state => state.sampleSelection.input != '')
        .compose(dropRepeats((x,y) => equals(x,y)))
        // .debug()

    const newInput$ = xs.combine(
            input$, 
            state$
        )
        .map(([newinput, state]) => ({...state, sampleSelection: {...state.sampleSelection, input: newinput}}))
        .compose(dropRepeats((x,y) => equals(x.sampleSelection.input,y.sampleSelection.input)))
        // .debug()

    // When a new query is required
    const updatedState$ = state$
		.compose(dropRepeats((x, y) => equals(x.sampleSelection, y.sampleSelection)))
        .debug()

    const request$ = newInput$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.samples',
                method: 'POST',
                send: {
                    version: 'v2',
                    query: state.sampleSelection.input
                },
                'category': 'samples'
            }
        }).debug()

    const response$ = sources.HTTP
        .select('samples')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()
        .debug()

    const data$ = response$
        .map(res => res.body)
        .map(json => json.result.data)

    const useClick$ = sources.DOM
        .select('.selection')
        .events('click')
        .debug()
        .map(ev => ev.ownerTarget.id)

    // Helper function for rendering the table, based on the state
    const makeTable = (data) => {
        console.log(data)
        let rows = data.map(entry => [
            td(entry.jnjs),
            td((entry.compoundname.length > 10) ? entry.compoundname.substring(0, 10) : entry.compoundname),
            td(entry.id),
            td(entry.protocolname),
            td(entry.concentration),
            td(entry.batch),
            td(entry.year),
            td(entry.significantGenes),
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
            th('Sign. Genes'),
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

    const initVdom$ = emptyState$.mapTo(div())

    const loadingVdom$ = xs.combine(request$, modifiedState$).mapTo(div())

    const loadedVdom$ = modifiedState$
        .map(state => makeTable(state.sampleSelection.data))

    const vdom$ = xs.merge(initVdom$, loadingVdom$, loadedVdom$)

    const dataReducer$ = data$.map(data => prevState => {
        const newData = data.map(el => merge(el, { use: true }))
        return {...prevState, sampleSelection: {...prevState.sampleSelection, 
            data: newData,
            output: newData.filter(x => x.use).map(x => x.id) }}
    })

    const selectReducer$ = useClick$.map(id => prevState => {
        const newData = prevState.sampleSelection.data.map(el => {
                    // One sample object
                    var newEl = clone(el)
                    const switchUse = (id === el.id)
                    newEl.use = (switchUse) ? !el.use : el.use
                    return newEl
                })
        return ({...prevState, 
            sampleSelection: {...prevState.sampleSelection,
                data: newData,
                output: newData.filter(x => x.use).map(x => x.id) 
        }})
    })

   const defaultReducer$ = xs.of(prevState => ({...prevState, sampleSelection: {input: '', data: []}}))
   const inputReducer$ = input$.map(i => prevState => ({...prevState, sampleSelection: {...prevState.sampleSelection, input: i}}))
   const requestReducer$ = request$.map(req => prevState => ({...prevState, sampleSelection: {...prevState.sampleSelection, request: req}}))

   const sampleSelection$ = sources.DOM.select('.doSelect').events('click')
        .compose(sampleCombine(state$))
        .map(([ev, state]) => state.sampleSelection.output)

    return {
        DOM: vdom$,
        HTTP: request$,//.compose(debounce(2000)),
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$,
            selectReducer$
        ),
        output: sampleSelection$,
    }
}

export { SampleSelection, sampleSelectionLens }