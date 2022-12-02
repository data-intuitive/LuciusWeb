import { a, div, br, label, input, p, button, code, pre, i, span } from '@cycle/dom'
import xs from 'xstream'
import { clone, equal, equals, mergeAll, omit } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

// Alert the user when last response time is 1.5 times higher than the minimum
// over the history of the jobserver.
const LATENCY_FACTOR = 1.5

function Check(sources) {

    const state$ = sources.state.stream

    const props$ = sources.props
        .compose(dropRepeats((x, y) => equals(x, y)))
        .remember()

    // Combine with deployments to the up-to-date endpoint config
    const modifiedState$ = xs.combine(state$, sources.deployments)
        .map(([state, _]) => state)

    const request$ = xs.combine(modifiedState$, props$)
        .map(([_, props]) => {
            return {
                url: props.url + '&classPath=com.dataintuitive.luciusapi.statistics',
                method: 'POST',
                send: {},
                'category': 'statistics'
            }
        })
        .remember()

    const response$$ = sources.HTTP
        .select('statistics')

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

    // A valid response means we should see if the response times are reasonable.
    // Trigger a request for every validResponse from statistics.
    const requestJobs$ = xs.combine(validResponse$, props$)
        .map(([trigger, props]) => ({
            url: props.url + '/jobs',
            method: 'GET',
            send: {},
            'category': 'jobs'
        }))
        .remember()

    const responseJobs$$ = sources.HTTP
        .select('jobs')

    const validResponseJobs$ = responseJobs$$
        .map(response$ =>
            response$
            .replaceError(error => xs.empty())
        )
        .flatten()
        .remember()

    const dataStatistics$ = validResponse$
        .map(result => result.body.result.data)

    const jobs$ = validResponseJobs$
        .map(result => result.body)

    /** 
     * An indicator of the data loading...
     */
    const initVdom$ = xs.periodic(200)
        .map(i => i % 4)
        .map(i => [
            span(".grey-text .testing", ".".repeat(i)), 
            span(".grey-text .text-lighten-4 .testing2", ".".repeat(3-i))
        ])
        .endWhen(validResponseJobs$)

    /**
     * Calculate a measure for the performance of the API.
     * We currently look at the difference between the last
     * reponse time and the minumum one with a factor
     */
    function differenceWithStatisticsResponses(table, factor) {
        const statsTable = table
            .filter(el => el.classPath === "com.dataintuitive.luciusapi.statistics")
            .filter(el => el.status !== "RUNNING")
            .map(el => el.duration)
            .map(durationString => durationString.replace(' secs', ''))
        const lastEntry = statsTable[0]
        const minEntry = statsTable.min()
        return lastEntry / (minEntry * factor) //statsTable.average()
    }

    // Apply the metric to the jobs listing
    const responseMetric$ = jobs$
        .map(jobs => differenceWithStatisticsResponses(jobs, LATENCY_FACTOR))

    const maxNormalTime$ = state$.map((state) => state.settings.config.normalStatisticsResponseTime)

    // When the performance metric is higher than 1, we show the user a message.
    const delay$ = xs.combine(responseMetric$, maxNormalTime$)
        .filter(([metric, max]) => metric > max)
        .mapTo({ text: 'The cluster seems to be slower than expected.\n Please have patience or try again in 5"...', duration: 15000 })

    const loadedVdom$ = xs.combine(responseMetric$, maxNormalTime$)
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

    // This is needed in order to get the state stream active!
    const defaultReducer$ = xs.of(prevState => {
        if (typeof prevState === 'undefined') {
            return {}
        } else {
            return prevState
        }
    });

    return {
        DOM: vdom$,
        HTTP: xs.merge(request$, requestJobs$),
        state: xs.merge(
            defaultReducer$,
        ),
        alert: alert$,
        popup: delay$
    }
}

export { Check }
