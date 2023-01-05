import { a, div, br, label, input, p, button, code, pre, i, span } from '@cycle/dom'
import xs from 'xstream'
import { equals } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import sampleCombine from 'xstream/extra/sampleCombine';

function Check(sources) {

    const state$ = sources.onion.state$

    const props$ = sources.props
      .compose(dropRepeats((x, y) => equals(x, y)))
      .remember()

    // Combine with deployments to the up-to-date endpoint config
    const modifiedState$ = xs.combine(state$, sources.deployments)
      .map(([state, _]) => state)

    const request$ = xs.combine(modifiedState$, props$)
      .map(([_, props]) => {
        return {
            url: props.url + '&classPath=com.dataintuitive.luciusapi.filters',
            method: 'POST',
            send: {},
            'category': 'server-status-check'
        }
      })
      .remember()

    const response$$ = sources.HTTP
      .select('server-status-check')

    const invalidResponse$ = response$$
      .map(response$ =>
        response$
        .filter(response => false) // ignore regular event
        .replaceError(error => xs.of(error)) // emit error
      )
      .flatten()
      .remember()

    /**
     * Parse the successful results only.
     *
     * We add a little wait time (`debounce`) in order for the jobserver
     * to be up-to-date with the actual jobs. Otherwize, we measure the
     * wrong job times.
     */
    const validResponse$ = response$$
      .map(response$ =>
        response$
        .replaceError(error => xs.empty())
      )
      .flatten()
      .compose(debounce(500))

    /** 
     * An indicator of the data loading...
     */
    const initVdom$ = xs.periodic(200)
      .map(i => i % 4)
      .map(i => [
        span(".grey-text .testing", ".".repeat(i)), 
        span(".grey-text .text-lighten-4 .testing2", ".".repeat(3-i))
      ])
      .endWhen(response$$)


    const requestTime$ = request$.mapTo(new Date().getTime())
    const responseTime$ = validResponse$.mapTo(new Date().getTime())

    const timeDifference$ = responseTime$.compose(sampleCombine(requestTime$))
      .map(([request, response]) => (response - request) / 1000 )

    const maxNormalTime$ = state$.map((state) => state.settings.config.normalStatisticsResponseTime)

    // When the performance metric is higher than 1, we show the user a message.
    const delay$ = xs.combine(timeDifference$, maxNormalTime$)
        .filter(([metric, max]) => metric > max)
        .mapTo({ text: 'The cluster seems to be slower than expected.\n Please have patience or try again in 5\'...', duration: 15000 })

    const loadedVdom$ = xs.combine(timeDifference$, maxNormalTime$)
      .map(([metric, max]) =>
        (metric < max) ?
        i('.material-icons .green-text .medium .result-good', 'done') :
        i('.material-icons .red-text .medium .result-busy', 'done')
      )

    const errorVdom$ = invalidResponse$.mapTo(i('.material-icons .red-text .medium .result-down', 'trending_down'))

    const vdom$ = xs.merge(
      initVdom$,
      // loadingVdom$,
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
        HTTP: xs.merge(request$),
        onion: xs.merge(
            defaultReducer$,
        ),
        alert: alert$,
        popup: delay$
    }
}

export { Check }
