import xs from "xstream"
import dropRepeats from "xstream/extra/dropRepeats"
import fromDiagram from "xstream/extra/fromDiagram"
import sampleCombine from "xstream/extra/sampleCombine"

export function filtersQuery(trigger$, kill$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.filters', 'filters', errorResult, sources, trigger$, kill$)
  }
}

export function treatmentsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.treatments', 'treatments', errorResult, sources, trigger$, kill$)
  }
}

export function treatmentToPerturbationsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.treatmentToPerturbations', 'treatmentToPerturbations', errorResult, sources, trigger$, kill$)
  }
}

export function SignatureGeneratorQuery(trigger$, kill$) {
  const errorResult = []
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.generateSignature', 'generateSignature', errorResult, sources, trigger$, kill$)
  }
}

export function BinnedZhangQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.binnedZhang', 'binnedZhang', errorResult, sources, trigger$, kill$)
  }
}

export function TopTableQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.topTable', 'topTable', errorResult, sources, trigger$, kill$)
  }
}

export function TargetToCompoundsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.targetToCompounds', 'targetToCompounds', errorResult, sources, trigger$, kill$)
  }
}

export function PerturbationInformationDetailsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQueryProps('&classPath=com.dataintuitive.luciusapi.perturbationInformationDetails', 'perturbationInformationDetails', errorResult, sources, trigger$, kill$)
  }
}

export function StatisticsQuery(trigger$, kill$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.statistics', 'statistics', errorResult, sources, trigger$, kill$)
  }
}

export function CheckSignatureQuery(trigger$, kill$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.checkSignature', 'checkSignature', errorResult, sources, trigger$, kill$)
  }
}

export function CorrelationQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('&classPath=com.dataintuitive.luciusapi.correlation', 'correlation', errorResult, sources, trigger$, kill$)
  }
}

function asyncQuerySettings(classPath, category, errorResult, sources, trigger$, kill$) {
  const apiInfo$ = sources.onion.state$.map((state) => state.settings.api)
  return asyncQuery(classPath, category, errorResult, apiInfo$, sources.HTTP, trigger$, kill$)
}

function asyncQueryProps(classPath, category, errorResult, sources, trigger$, kill$) {
  const apiInfo$ = sources.props.map((props) => props.api)
  return asyncQuery(classPath, category, errorResult, apiInfo$, sources.HTTP, trigger$, kill$)
}

function asyncQuery(classPath, category, errorResult, apiInfo$, sourcesHTTP, trigger$, kill$) {

  const emptyData = {
    body: {
        result: errorResult,
        status: "error"
    }
  }

  const generateError = (message, time, query) => {
    return {
      level: "error",
      message: message,
      time: time,
      query: query
    }
  }

  const requestPost$ = trigger$.compose(sampleCombine(apiInfo$))
    .map(([data, api]) => {
      return {
        url: api.asyncUrlStart + classPath,
        method: 'POST',
        send: data,
        'category': category + 'POST'
      }
    })
    .remember()

  const responsePost$ = sourcesHTTP
    .select(category + 'POST')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()

  const jobId$ = responsePost$
    .map(r => r.body.jobId)
    .startWith("")

  const jobStatus$ = xs.create()
  const pollTimer$ = xs.create()

  const requestGet$ = pollTimer$.compose(sampleCombine(apiInfo$, jobId$, jobStatus$))
    .filter(([_, api, jobId, jobStatus]) => jobStatus == "STARTED" || jobStatus == "RUNNING")
    .map(([_, api, jobId, jobStatus]) => {
        return {
            url: api.asyncUrlStatus + jobId,
            method: 'GET',
            'category': category + 'GET'
        }
    })

  const responseGet$ = sourcesHTTP
    .select(category + 'GET')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()
  
  // Poll after initial POST reply was received or after a GET reply indicated that the code is still running
  const pollTimer2$ = xs
    .merge(responsePost$, responseGet$)
    .filter(r => r.body.status == "STARTED" || r.body.status == "RUNNING")
    .map(_ => fromDiagram("---------1"))
    .flatten()
  
  pollTimer$.imitate(pollTimer2$)

  const responseGetDone$ = responseGet$
    .filter(r => r.body.status != "STARTED" && r.body.status != "RUNNING")

  const requestDelete$ = kill$
    .compose(sampleCombine(apiInfo$, jobId$, jobStatus$))
    .filter(([_, api, jobId, jobStatus]) => jobId != undefined && ( jobStatus == "STARTED" || jobStatus == "RUNNING" ))
    .map(([_, api, jobId, jobStatus]) => {
        return {
            url: api.asyncUrlStatus + jobId,
            method: 'DELETE',
            'category': category + 'DELETE'
        }
    })

  const responseDelete$ = sourcesHTTP
    .select(category + 'DELETE')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()

  const jobStatus_late$ = xs.merge(responsePost$, responseGetDone$, responseDelete$)
    .map(r => r.body.status)
    // .startWith("idle")

  jobStatus$.imitate(jobStatus_late$)

  const data$ = responseGetDone$
    .filter(r => r.body.status != "error")
    .map(r => r.body.result)

  const invalidData$ = xs.merge(responsePost$, responseGetDone$, responseDelete$)
    .filter((r) => r.body.status == "error")

  const jobDeleted$ = responseDelete$
    .filter((r) => r.body.status == "KILLED")

  const error$ = invalidData$
    .mapTo(generateError("Generic HTTP error", 0, 0))

  // Add request body to state
  const requestReducer$ = requestPost$.map(req => prevState => ({ ...prevState, core: { ...prevState.core, request: req } }))
  // Add jobId from request response
  const jobIdReducer$ = jobId$.map(id => prevState => ({ ...prevState, core: { ...prevState.core, jobId: id } }))
  // Add jobStatus from job response
  const jobStatusReducer$ = jobStatus$.map(status => prevState => ({ ...prevState, core: { ...prevState.core, jobStatus: status } }))

  return {
    HTTP: xs.merge(requestPost$, requestGet$, requestDelete$),
    onion: xs.of(_ => _),//xs.merge(requestReducer$, jobIdReducer$, jobStatusReducer$),
    data$: data$,
    invalidData$: invalidData$,
    jobDeleted$: jobDeleted$,
    error$: error$
  }
}