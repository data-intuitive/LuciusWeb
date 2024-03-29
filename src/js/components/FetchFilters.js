import xs from 'xstream'
import delay from 'xstream/extra/delay'
import dropRepeats from 'xstream/extra/dropRepeats'
import { filtersQuery } from '../utils/asyncQuery'

function FetchFilters(sources) {

  const state$ = sources.onion.state$

  // Combine with deployments to the up-to-date endpoint config
  const triggerQuery$ = state$.take(1)

  const triggerObject$ = triggerQuery$.mapTo({})

  const queryData = filtersQuery(triggerObject$)(sources)

  const validResponse$ = queryData.data$
    .map((result) => result.data)

  return {
    // We don't initialize the stream here so we know exactly when the
    // information is available.
    filters: validResponse$.compose(delay(2000)),
    HTTP: queryData.HTTP,
    asyncQueryStatus: queryData.asyncQueryStatus,
    onion: xs.empty(),
  }
}

export { FetchFilters }
