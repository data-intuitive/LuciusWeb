import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody } from '@cycle/dom';
import { clone, equals, merge } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import { loggerFactory } from '~/../../src/js/utils/logger'

const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}

const sampleSelectionLens = {
    get: state => ({ core: (typeof state.form !== 'undefined') ? state.form.sampleSelection : {}, settings: state.settings }),
    // get: state => ({core: state.form.sampleSelection, settings: state.settings}),
    set: (state, childState) => ({...state, form: {...state.form, sampleSelection: childState.core } })
};

/**
 * Based on a (list of) compound(s), get the samples that correspond to it and allow users to select them.
 * 
 * input: compound(s) (string)
 * output: list of samples (array)
 */
function SampleSelection(sources) {

    const logger = loggerFactory('sampleSelection', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$

    const input$ = sources.input

    // When the component should not be shown, including empty signature
    const isEmptyState = (state) => {
        if (typeof state.core === 'undefined') {
            return true
        } else {
            if (typeof state.core.input === 'undefined') {
                return true
            } else {
                if (state.core.input == '') {
                    return true
                } else {
                    return false
                }
            }
        }
    }

    const emptyState$ = state$
        // .filter(state => state.core.input == null || state.core.input == '')
        .filter(state => isEmptyState(state))
        .compose(dropRepeats((x, y) => equals(x, y)))

    // When the state is cycled because of an internal update
    const modifiedState$ = state$
        // .filter(state => state.core.input != '')
        .filter(state => !isEmptyState(state))
        .compose(dropRepeats((x, y) => equals(x, y)))

    const newInput$ = xs.combine(
            input$,
            state$
        )
        .map(([newinput, state]) => ({...state, core: {...state.core, input: newinput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    // When a new query is required
    const updatedState$ = state$
        .compose(dropRepeats((x, y) => equals(x.core, y.core)))

    const request$ = newInput$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.compoundToSamples',
                method: 'POST',
                send: {
                    version: 'v2',
                    query: state.core.input
                },
                'category': 'samples'
            }
        })
        // .remember()

    const response$ = sources.HTTP
        .select('samples')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()
        // .remember()

    const data$ = response$
        .map(res => res.body)
        .map(json => json.result.data)
        .remember()

    const useClick$ = sources.DOM
        .select('.selection')
        .events('click')
        .map(ev => ev.ownerTarget.id)

    // Helper function for rendering the table, based on the state
    const makeTable = (state) => {
        const data = state.core.data
        const blurStyle = (state.settings.common.blur) ? { style: { filter: 'blur(' + state.settings.common.amountBlur + 'px)' } } : {}
        const selectedClass = (selected) => (selected) ? '.black-text' : '.grey-text .text-lighten-2'
        let rows = data.map(entry => [
            td('.selection', { props: { id: entry.id } }, [
                (entry.use) ? i('.small .material-icons .red-text','remove')
                : i('.small .material-icons .green-text','add')
            ]),
            td(selectedClass(entry.use), blurStyle, entry.jnjs),
            td(selectedClass(entry.use), blurStyle, (entry.compoundname.length > 10) ? entry.compoundname.substring(0, 10) + '...' : entry.compoundname),
            td(selectedClass(entry.use), entry.id),
            td(selectedClass(entry.use), entry.protocolname),
            td(selectedClass(entry.use), entry.concentration),
            td(selectedClass(entry.use), entry.batch),
            td(selectedClass(entry.use), entry.year),
            td(selectedClass(entry.use), entry.significantGenes)
            // td('.selection', { props: { id: entry.id } }, [
            //     label('', { props: { id: entry.id } }, [
            //         input('.filled-in .grey', { props: { type: 'checkbox', checked: entry.use, id: entry.id } }, 'tt'),
            //         span([''])
            //     ])
            // ])

        ]);
        const header = tr([
            th('Use?'),
            th('JNJ'),
            th('Name'),
            th('Sample'),
            th('Protocol'),
            th('Conc'),
            th('Batch'),
            th('Year'),
            th('Sign. Genes')
        ]);

        let body = [];
        rows.map(row => body.push(tr(row)));
        const tableContent = [thead([header]), tbody(body)];

        return (
            div([
                div('.row', [
                    div('.col .s10 .offset-s1 .l8 .offset-l2', [table('.striped .centered', tableContent)]),
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
        .map(state => makeTable(state))

    const vdom$ = xs.merge(initVdom$, loadingVdom$, loadedVdom$)

    const dataReducer$ = data$.map(data => prevState => {
        const newData = data.map(el => merge(el, { use: true }))
        return {
            ...prevState,
            core: {
                ...prevState.core,
                data: newData,
                output: newData.filter(x => x.use).map(x => x.id)
            }
        }
    })

    const selectReducer$ = useClick$.map(id => prevState => {
        const newData = prevState.core.data.map(el => {
            // One sample object
            var newEl = clone(el)
            const switchUse = (id === el.id)
            newEl.use = (switchUse) ? !el.use : el.use
            return newEl
        })
        return ({
            ...prevState,
            core: {
                ...prevState.core,
                data: newData,
                output: newData.filter(x => x.use).map(x => x.id)
            }
        })
    })

    const defaultReducer$ = xs.of(prevState => ({...prevState, core: { input: '', data: [] } }))
    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i } }))
    const requestReducer$ = request$.map(req => prevState => ({...prevState, core: {...prevState.core, request: req } }))

    const sampleSelection$ =
        xs.merge(
            sources.DOM.select('.doSelect').events('click'),
            // Ghost mode
            sources.onion.state$.map(state => state.core.ghostoutput).filter(ghost => ghost).compose(dropRepeats())
        )
        .compose(sampleCombine(state$))
        .map(([ev, state]) => state.core.output)

    return {
        log: xs.merge(
            logger(state$, 'state$'),
        ),
        DOM: vdom$,
        HTTP: request$, //.compose(debounce(2000)),
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$,
            selectReducer$
        ),
        output: sampleSelection$
    }
}

export { SampleSelection, sampleSelectionLens }