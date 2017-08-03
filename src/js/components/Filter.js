import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, h5, button, textarea, a, select, option, span } from '@cycle/dom';
import { clone, equals, merge, mergeAll } from 'ramda';
import xs from 'xstream';
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'

/**
 * Provide a filter form. We inject (via input) a signature in order to hide the form when an empty signature is present.
 * 
 */
function Filter(sources) {

    console.log('Starting component: Filter...');

    const domSource$ = sources.DOM;
    const state$ = sources.onion.state$
        .debug(state => {
			console.log('== State in Filter =================')
			console.log(state)
		});

    const input$ = sources.input

	// When the component should not be shown, including empty signature
	const isEmptyState = (state) => {
		if (typeof state.core === 'undefined') {
			return true 
		} else {
			if (typeof state.core.input === 'undefined') {
				return true
			} else {
				if (state.core.input === '') {
					return true
				} else {
					return false
				}
			}
		}
	}

    const emptyState$ = state$
        .filter(input => isEmptyState(input))
        .debug()

    const modifiedState$ = xs.combine(input$, state$)
        .filter(([input, state]) => ! isEmptyState(state))
        .map(([input, state]) => state.core.input)
        // .compose(dropRepeats(equals))
        .debug()

    // Make sure the input is generated only when some state is active.
    const filterInput$ = xs.of(x => ({
        concentration: '',
        protocol: '',
        type: ''
    }))

    const emptyVdom$ = emptyState$.mapTo(div())

    const loadedVdom$ = xs.combine(filterInput$, modifiedState$)
    .map(([filter, state]) =>
        div([
           div('.input-field .concentration .col .s12 .l4', [
                 span('.blue-grey-text',  ['Concentration']),
                 select('.browser-default', [
                    option('.selected', { props: { value: '' } }, ''),
                    option({ props: { value: '0.1' } }, 0.1),
                    option({ props: { value: '1' } }, 1),
                    option({ props: { value: '10' } }, 10),
                    option({ props: { value: '30' } }, 30)
                ]),
            ]),
            div('.input-field .protocol .col .s12 .l4', [
                span('.blue-grey-text',  ['Protocol']),
                select('.browser-default', [
                    option('.selected', { props: { value: '' } }, ''),
                    option({ props: { value: 'MCF7' } }, 'MCF7'),
                    option({ props: { value: 'PBMC' } }, 'PBMC')
                ]),
            ]),
            div('.input-field .type .col .s12 .l4', [
                span('.blue-grey-text',  ['Type']),
                select('.browser-default', [
                    option('.selected', { props: { value: '' } }, ''),
                    option({ props: { value: 'test' } }, 'test'),
                    option({ props: { value: 'poscon' } }, 'poscon')
                ]),
            ]),
        ])
    )

    const vdom$ = xs.merge(
        emptyVdom$, 
        loadedVdom$.startWith(div())
        )

    const concentrationChanged$ = sources.DOM
        .select('.concentration')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ concentration: value }))
        .startWith('')

    const typeChanged$ = sources.DOM
        .select('.type')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ type: value }))
        .startWith('')

    const protocolChanged$ = sources.DOM
        .select('.protocol')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ protocol: value }))
        .startWith('')

    const changes$ = xs.combine(
        concentrationChanged$,
        typeChanged$,
        protocolChanged$
    ).map((filters) => mergeAll(filters))
    .debug()

    // To be sent to sink as output
    const filter$ = changes$.remember()

    const defaultReducer$ = xs.of(prevState => ({...prevState, core: { input: '' }}))
    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i}}))
    const outputReducer$ = filter$.map(i => prevState => ({...prevState, core: {...prevState.core, output: i}}))
 
    return {
        DOM: vdom$,
        output: filter$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            outputReducer$
        )
    };

}

export { Filter }