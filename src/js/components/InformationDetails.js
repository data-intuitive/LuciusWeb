import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

export function InformationDetails(sources) {

  const state$ = sources.onion.state$
  const props$ = sources.props
  const trigger$ = sources.trigger

  // Combine with deployments to the up-to-date endpoint config
  const triggerQuery$ = trigger$.filter(t => t).compose(sampleCombine(state$)).map(([t, s]) => s)

  const request$ = xs.combine(triggerQuery$, props$)
    .map(([state, props]) => ({
      url: props.api.url + '&classPath=com.dataintuitive.luciusapi.perturbationInformationDetails',
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
      response$.replaceError(_ => xs.of({}))
    )
    .flatten()

  return {
    // We don't initialize the stream here so we know exactly when the
    // information is available.
    informationDetails: validResponse$,
    HTTP: request$
  }
}