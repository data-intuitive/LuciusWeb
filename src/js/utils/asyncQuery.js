import xs from "xstream"
import sampleCombine from "xstream/extra/sampleCombine"



export function asyncQuery(classPath, category, sources, state$, trigger$, kill$) {

  const emptyData = {
    body: {
        result: {
            data: []
        },
        status: "error"
    }
  }

  const requestPost$ = trigger$.compose(sampleCombine(state$))
    .map(([data, state]) => {
      return {
        url: state.settings.api.asyncUrlStart + classPath,
        method: 'POST',
        send: data,
        'category': category + 'POST'
      }
    })
    .remember()

  const responsePost$ = sources.HTTP
    .select(category + 'POST')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()

  const jobId$ = responsePost$
    .map(r => r.body.jobId)

  const pollTimer$ = xs.periodic(200)

  const pollTimerStatus$ = pollTimer$.compose(sampleCombine(state$))
    .map(([_, status]) => status)
    .filter(s => s.core.jobStatus == "STARTED" || s.core.jobStatus == "RUNNING")

  const requestGet$ = pollTimerStatus$
    .map(state => {
        return {
            url: state.settings.api.asyncUrlStatus + state.core?.jobId,
            method: 'GET',
            'category': category + 'GET'
        }
    })

  const responseGet$ = sources.HTTP
    .select(category + 'GET')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()
    .filter(r => r.body.status != "STARTED" && r.body.status != "RUNNING")

  const data$ = responseGet$
    .map(r => r.body.result)

  const requestDelete$ = kill$
    .compose(sampleCombine(state$))
    .map(([_, state]) => state)
    .filter(state => state.core?.jobId != undefined && ( state.core?.jobStatus == "STARTED" || state.core?.jobStatus == "RUNNING" ))
    .map(state => {
        return {
            url: state.settings.api.asyncUrlStatus + state.core?.jobId,
            method: 'DELETE',
            'category': category + 'DELETE'
        }
    })

  const responseDelete$ = sources.HTTP
    .select(category + 'DELETE')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()

  const jobStatus$ = xs.merge(responsePost$, responseGet$, responseDelete$)
    .map(r => r.body.status)
    .startWith("idle")

  // Add request body to state
  const requestReducer$ = requestPost$.map(req => prevState => ({ ...prevState, core: { ...prevState.core, request: req } }))
  // Add jobId from request response
  const jobIdReducer$ = jobId$.map(id => prevState => ({ ...prevState, core: { ...prevState.core, jobId: id } }))
  // Add jobStatus from job response
  const jobStatusReducer$ = jobStatus$.map(status => prevState => ({ ...prevState, core: { ...prevState.core, jobStatus: status } }))

  return {
    HTTP: xs.merge(requestPost$, requestGet$, requestDelete$),
    reducers$: xs.merge(requestReducer$, jobIdReducer$, jobStatusReducer$),
    data$: data$,
  }
}