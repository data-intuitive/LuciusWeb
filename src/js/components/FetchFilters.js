import xs from 'xstream'
import delay from 'xstream/extra/delay'

function FetchFilters(sources) {

  const state$ = sources.state.stream

  // Combine with deployments to the up-to-date endpoint config
  const triggerQuery$ = state$.take(1)

  const request$ = triggerQuery$
    .map(state => ({
      url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.filters',
      method: 'POST',
      send: {},
      'category': 'filters'
    })
  )

  const response$$ = sources.HTTP
    .select('filters')

  // TODO: fall back to default filters set in config file
  const validResponse$ = response$$
    .map(response$ =>
      response$.replaceError(_ => xs.empty())
    )
    .flatten()
    .map(result => result.body.result.data)

  return {
    // We don't initialize the stream here so we know exactly when the
    // information is available.
    filters: validResponse$.compose(delay(2000)),
    HTTP: request$
  }
}

export { FetchFilters }
