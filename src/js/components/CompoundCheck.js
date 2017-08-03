import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import concat from 'xstream/extra/concat'
import { prop } from 'ramda'

const checkLens = { 
    get: state => {
        // console.log('global state:')
        // console.log(state)
        var result = {core: (typeof state.form !== 'undefined') ? state.form.check : {}, settings: state.settings}
        // console.log('local state:')
        // console.log(result)
        return result
    },
    set: (state, childState) => {
        var result = {...state, form : {...state.form, check: childState.core}}
        return result
    }};

/**
 * Form for entering compounds with autocomplete.
 * 
 * Input: Form input
 * Output: compound (string)
 */
function CompoundCheck(sources) {
    // States of autosuggestion field:
    // - Less than N characters -> no query, no suggestions
    // - N or more -> with every character a query is done (after 500ms). suggestions are shown
    // - Clicking on a suggestion activates it in the search field and sets validated to true
    // - At that point, the dropdown should dissapear!!!
    // - The suggestions appear again whenever something changes in the input...

    console.log('Starting component: CompoundCheck...')

    const state$ = sources.onion.state$.debug(state => {
        console.log('== State in compoundCheck =================')
        console.log(state)
    });

    const input$ = sources.DOM
        .select('.compoundQuery')
        .events('input')
        .map(ev => ev.target.value)
        .startWith('')

	// When the component should not be shown, including empty signature
	const isEmptyState = (state) => {
		if (typeof state.core === 'undefined') {
			return true 
		} else {
			if (typeof state.core.input === 'undefined') {
				return true 
			} else {
                return false
			}
		}
	}

    const emptyState$ = state$
        .filter(state => isEmptyState(state))
        .compose(dropRepeats(equals))
        // .filter(state => typeof state.core === 'undefined')

    // When the state is cycled because of an internal update
    const modifiedState$ = 	state$
        .filter(state => ! isEmptyState(state))
        // .filter(state => typeof state.core !== 'undefined')
        .compose(dropRepeats((x,y) => equals(x,y)))

    // An update to the input$, join it with state$
    const newInput$ = xs.combine(
            input$, 
            state$
        )
        .map(([newinput, state]) => ({...state, core: {...state.core, input: newinput}}))
        .compose(dropRepeats((x,y) => equals(x.core.input, y.core.input)))
 
    const triggerRequest$ = newInput$
            .filter(state => state.core.input.length >= 2)
            .compose(debounce(500))
 
    const request$ = triggerRequest$ 
           .map(state => {
            return {
                url:  state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.compounds',
                method: 'POST',
                send: {
                    version: 'v2',
                    query: state.core.input
                },
                'category': 'compounds'
            }
        })
        .remember()
        .debug()

    const response$ = sources.HTTP
        .select('compounds')
        .map((response$) =>
            response$.replaceError(() => xs.of([1,2,3]))
        )
        .flatten()
        .debug()
    
    const data$ = response$
        .map(res => res.body.result.data)

    const suggestionStyle = {
        style: {
            'margin-bottom': '0px',
            'margin-top': '0px',
            fontWeight: 'lighter',
        }
    }

   const initVdom$ = emptyState$
        .mapTo(div())
        .debug()

    const loadedVdom$ = modifiedState$
        .map(state => {
            // console.log(state)
            const query = state.core.input
            const validated = state.core.validated
            const showSuggestions = state.core.showSuggestions
            return div(
                [
                    div('.row  .orange .darken-4 .white-text', { style: { padding: '20px 10px 10px 10px' } }, [
                        div('.Default .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons .orange-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        div('.col .s10 .input-field', {style : {margin : '0px 0px 0px 0px'}}, [
                            input('.compoundQuery .col .s12 .autocomplete-input', { style: { fontSize: '20px' }, props: { type: 'text', value: query }, value: query}),
                            (showSuggestions)
                                ? ul('.autocomplete-content .dropdown-content .col .s12 .orange .lighten-4 .z-depth-5',
                                    state.core.data.map(x => li({ attrs: { 'data-index': x.jnjs } }, [
                                        div('.col .s3 .compoundComplete', suggestionStyle, [x.jnjs]),
                                        div('.col .s9 .compoundComplete ', suggestionStyle, [x.name])
                                    ])))
                                : ul([])
                        ]),
                        (validated)
                            ? div('.CompoundCheck .waves-effect .col .s1 .center-align', [
                                i('.large .material-icons', { style: { fontSize: '45px', fontColor: 'grey' } }, ['play_arrow'])])
                            : div('.CompoundCheck .col .s1 .center-align', [
                                i('.large .material-icons .orange-text', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')]),
                    ]),
                ])
        })
        .debug()

    const vdom$ = xs.merge(initVdom$, loadedVdom$).startWith(div()).remember()

    // Set a initial reducer, showing suggestions
    const defaultReducer$ = xs.of(prevState => {
        console.log('-- CompoundCheck -- defaultReducer$')
        console.log(prevState)
        let newState = {...prevState, 
            core : {...prevState.core,
                showSuggestions : true, 
                validated: false, 
                input: '',
                data: []
            }
        }
        console.log(newState)
        return newState
    })

    // Reducer for showing suggestions again after an input event
    const inputReducer$ = input$.map(value => prevState => ({...prevState, core: {...prevState.core, 
        showSuggestions: true,
        validated: false,
        input: value,
    }}))

    // Set a default signature for demo purposes
    const setDefault$ = sources.DOM.select('.Default').events('click')
    const setDefaultReducer$ = setDefault$.map(events => prevState => ({...prevState, core: {...prevState.core, 
        showSuggestions: false,
        validated: true,
        input: '7108491',
    }}))

    // When a suggestion is clicked, update the state so the query becomes this
    const autocomplete$ = sources.DOM.select('.compoundComplete').events('click')
    const autocompleteReducer$ = autocomplete$.map(event => prevState => {
        const newInput = event.target.parentNode.dataset.index
        return ({...prevState, core: {...prevState.core, 
            input: newInput,
            showSuggestions: false,
            validated:true,
            output: newInput
        }})
    })

    // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({...prevState, core: {...prevState.core, request: req}}))
    // Add data from API to state, update output key when relevant
    const dataReducer$ = data$.map(newData => prevState => ({...prevState, core: {...prevState.core, data: newData}}))

    // GO!!!
    const run$ = sources.DOM
        .select('.CompoundCheck')
        .events('click')
        .debug()

    const query$ = run$
        .compose(sampleCombine(state$))
        .map(([ev, state]) => state.core.input)
        .remember()
        .debug()

    return {
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            dataReducer$,
            requestReducer$,
            setDefaultReducer$,
            autocompleteReducer$
        ),
        HTTP: request$,
        output: query$
    };
}

export { CompoundCheck, checkLens }
