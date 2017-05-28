import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

function CompoundCheck(sources) {

    console.log('Starting component: CompoundCheck...')

    const state$ = sources.onion.state$.debug(state => {
        console.log('== State in compoundCheck =================')
        console.log(state)
    });

    const validated$ = state$.map(state => state.validated)

    const input$ = sources.DOM
        .select('.compoundQuery')
        .events('input')
        .map(ev => ev.target.value)
        .startWith('')

    const triggerRequest$ = input$
        .map(x => x.trim())
        .compose(dropRepeats())
        .filter(x => x.length >= 2)
        .compose(debounce(500))

    const request$ = xs.combine(triggerRequest$, sources.props)
            .map(([substring, props]) => {
            return {
                url:  props.url + '&classPath=com.dataintuitive.luciusapi.compounds',
                method: 'POST',
                send: {
                    version: 'v2',
                    query: substring
                },
                'category': 'compounds'
            }
        })

    const response$ = sources.HTTP
        .select('compounds')
        .map((response$) =>
            response$.replaceError(() => xs.of([]))
        )
        .flatten()
        .map(res => res.body.result.data)
        .debug()


    const suggestionStyle = {
        style: {
            'margin-bottom': '0px',
            'margin-top': '0px',
            fontWeight: 'lighter',
        }
    }

    // States of autosuggestion field:
    // - Less than N characters -> no query, no suggestions
    // - N or more -> with every character a query is done (after 500ms). suggestions are shown
    // - Clicking on a suggestion activates it in the search field and sets validated to true
    // - At that point, the dropdown should dissapear!!!
    // - The suggestions appear again whenever something changes in the input...

    const vdom$ = xs.combine(state$, validated$, input$, response$.startWith([]))
        .map(
        ([state, validated, q, response]) => {
            const query = state.query
            return div(
                [
                    div('.row  .orange .darken-4 .white-text', { style: { padding: '20px 10px 10px 10px' } }, [
                        div('.Default .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons .orange-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        div('.col .s10 .input-field', {style : {margin : '0px 0px 0px 0px'}}, [
                            input('.compoundQuery .col .s12 .autocomplete-input', { style: { fontSize: '20px' }, props: { type: 'text', value: query }, value: query }),
                            (state.showSuggestions)
                                ? ul('.autocomplete-content .dropdown-content .col .s12 .orange .lighten-4 .z-depth-5',
                                    response.map(x => li({ attrs: { 'data-index': x.jnjs } }, [
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
        });

    // Handle processing this compound (list)
    // Encapsulate compound selection in seapr

    // Set a initial reducer, showing suggestions
    const initialReducer$ = xs.of(prevState => {
        let newState = {}
        newState.showSuggestions = true
        // newState.query = ''
        newState.validated = false
        return newState
    })

    // Reducer for showing suggestions again after an input event
    const inputReducer$ = input$.map(value => prevState => {
        let newState = clone(prevState)
        newState.showSuggestions = true
        newState.validated = false
        newState.query = value
        return newState
    })

    // Set a default signature for demo purposes
    const setDefault$ = sources.DOM.select('.Default').events('click')
    const setDefaultReducer$ = setDefault$.map(events => prevState => {
        let newState = clone(prevState)
        newState.query = '7108491'
        newState.validated = true
        return newState
    })

    // When a suggestion is clicked, update the state so the query becomes this
    const autocomplete$ = sources.DOM.select('.compoundComplete').events('click')
    const autocompleteReducer$ = autocomplete$.map(event => prevState => {
        console.log(event.target.parentNode.dataset.index)
        let newState = clone(prevState)
        newState.query = event.target.parentNode.dataset.index
        newState.showSuggestions = false
        newState.validated = true
        return newState
    })

    // GO!!!
    const run$ = sources.DOM
        .select('.CompoundCheck')
        .events('click')
        .debug()

    const query$ = run$
        .compose(sampleCombine(state$))
        .map(([ev, state]) => state.query)
        .debug()

    return {
        DOM: vdom$,
        onion: xs.merge(
            initialReducer$,
            inputReducer$,
            setDefaultReducer$,
            autocompleteReducer$
        ),
        HTTP: request$,
        query: query$
    };

}

export { CompoundCheck }
