import xs from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'

export function InformationDetails(sources) {

  const state$ = sources.onion.state$

  // Combine with deployments to the up-to-date endpoint config
  const triggerQuery$ = state$.compose(dropRepeats())

  const request$ = triggerQuery$
    .map(state => ({
      // url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.perturbationInformationDetails',
      url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&sync=true&timeout=30' + '&classPath=com.dataintuitive.luciusapi.perturbationInformationDetails',
      method: 'POST',
      send: {
        'query': state.id
      },
      'category': 'perturbationInformationDetails'
    })
  )

  const response$$ = sources.HTTP
    .select('perturbationInformationDetails')

  // TODO: fall back to default filters set in config file
  const validResponse$ = response$$
    .map(response$ =>
      response$.replaceError(_ => xs.of({processing_level: "error"}))
    )
    .flatten()

  return {
    // We don't initialize the stream here so we know exactly when the
    // information is available.
    informationDetails: validResponse$,
    HTTP: request$
  }
}
