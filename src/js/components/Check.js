import { a, div, br, label, input, p, button, code, pre, i, span } from '@cycle/dom'
import xs from 'xstream'
import { equals } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import sampleCombine from 'xstream/extra/sampleCombine';
import { filtersQuery } from '../utils/asyncQuery';

function Check(sources) {

    const state$ = sources.onion.state$

    const triggerObject$ = sources.deployments.mapTo({ })

    const kill$ = state$
      .map(s => s.kill)
      .compose(dropRepeats())
      .filter(b => b)

    const queryData = filtersQuery(triggerObject$, kill$)(sources)

    /** 
     * An indicator of the data loading...
     */
    const initVdom$ = xs.periodic(200)
      .map(i => i % 4)
      .map(i => [
        span(".grey-text .testing", ".".repeat(i)), 
        span(".grey-text .text-lighten-4 .testing2", ".".repeat(3-i))
      ])
      .endWhen(xs.merge(queryData.data$, queryData.invalidData$))

    const requestTime$ = triggerObject$.mapTo(new Date().getTime())
    const responseTime$ = queryData.data$.mapTo(new Date().getTime())

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

    const errorVdom$ = queryData.invalidData$.mapTo(i('.material-icons .red-text .medium .result-down', 'trending_down'))
    const killedVdom$ = queryData.jobDeleted$.mapTo(i('.material-icons .orange-text .medium .result-down', 'cancel'))

    const vdom$ = xs.merge(
      initVdom$,
      // loadingVdom$,
      loadedVdom$,
      errorVdom$,
      killedVdom$,
    ).remember()

    const alert$ = queryData.invalidData$
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
        HTTP: queryData.HTTP,
        onion: xs.merge(
            defaultReducer$,
            queryData.onion,
        ),
        alert: alert$,
        popup: delay$
    }
}

export { Check }
