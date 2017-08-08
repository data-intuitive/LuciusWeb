import { a, div, br, label, input, p, button, code, pre, i, span } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll, omit } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

function Check(sources) {

    const state$ = sources.onion.state$

    const props$ = sources.props.debug()

   const modifiedState$ = state$
        .compose(dropRepeats((x, y) => equals(omit(['result'], x), omit(['result'], y))))
        .compose(debounce(2000))
        // .debug()

    const request$ = xs.combine(modifiedState$, props$)
        .map(([state, props]) => {
            return {
                url: props.url + '&classPath=com.dataintuitive.luciusapi.statistics',
                method: 'POST',
                send: {},
                'category': 'test'
            }
        })
        .remember()

    const response$$ = sources.HTTP
        .select('test')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()
        // .compose(debounce(2000))
        .remember()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()
        // .compose(debounce(2000))
        .remember()

    const data$ = validResponse$
        .map(result => result.body.result.data)

    const initVdom$ = xs.of('...')

    const loadingVdom$ = request$
        .mapTo('...')

    const loadedVdom$ = data$
        .mapTo(i('.material-icons .green-text .medium', 'done'))

    const errorVdom$ = invalidResponse$.mapTo(i('.material-icons .red-text .medium', 'trending_down'))

    const vdom$ = xs.merge(
        initVdom$,
        loadingVdom$,
        loadedVdom$,
        errorVdom$,
    ).remember()

    const alert$ = invalidResponse$
        .remember()

    // This is needed in order to get the onion stream active!
    const defaultReducer$ = xs.of(prevState => {
        if (typeof prevState === 'undefined') {
            return {}
        } else {
            return prevState
        }
    });

    return {
        DOM: vdom$,
        HTTP: request$,
        onion: xs.merge(
            defaultReducer$,
        ),
        alert: alert$
    }
}

export { Check }
