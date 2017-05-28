import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll, omit } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

function Statistics(sources) {

    const state$ = sources.onion.state$.debug()

    // const feedback$ = sources.DOM.select('div').events('click').map(ev => ev.target.text).debug()

    // Check when the state has changed, omit the result key
    const modifiedState$ = state$
        .compose(dropRepeats((x, y) => equals(omit(['result'], x), omit(['result'], y))))
        .compose(debounce(2000))
        .debug()

    const props$ = sources.props.debug()

    const request$ = xs.combine(modifiedState$, props$)
        .map(([state, props]) => {
            return {
                url: props.url + '&classPath=com.dataintuitive.luciusapi.statistics',
                method: 'POST',
                send: {},
                'category': 'statistics'
            }
        })
        .debug();

    const response$$ = sources.HTTP
        .select('statistics')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()
        .compose(debounce(2000))
        .debug()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()
        .compose(debounce(2000))
        .debug()

    const data$ = validResponse$
        .map(result => result.body.result.data)
    // .debug()

    const initVdom$ = xs.of(div([p('Init')]))

    const loadingVdom$ = request$
        .mapTo(div([p('Loading...')]))

    const loadedVdom$ = xs.combine(
        data$,
        // xs.periodic(1000)
        )
        .map(([data]) => code(JSON.stringify(data) + ' '))

    const errorVdom$ = invalidResponse$.mapTo(div([p('An error occured !!!')]))

    const vdom$ = xs.merge(
        initVdom$,
        loadingVdom$,
        loadedVdom$,
        errorVdom$,
    ).remember()

    // This is needed in order to get the onion stream active!
    const defaultReducer$ = xs.of(prevState => {
        if (typeof prevState === 'undefined') {
            return {}
        } else {
            return prevState
        }
    });

    // Add the result to the state
    const stateReducer$ = data$.map(data => prevState => merge(prevState, { result: data }))

    return {
        DOM: vdom$,
        HTTP: request$,
        onion: xs.merge(
            defaultReducer$,
            stateReducer$
        )

    }
}

export { Statistics }
