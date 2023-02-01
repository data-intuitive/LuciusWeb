import xs from "xstream"
import fromDiagram from "xstream/extra/fromDiagram"
import sampleCombine from "xstream/extra/sampleCombine"

export function filtersQuery(trigger$, kill$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.filters', 'filters', errorResult, sources, trigger$, kill$)
  }
}

export function treatmentsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.treatments', 'treatments', errorResult, sources, trigger$, kill$)
  }
}

export function treatmentToPerturbationsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.treatmentToPerturbations', 'treatmentToPerturbations', errorResult, sources, trigger$, kill$)
  }
}

export function SignatureGeneratorQuery(trigger$, kill$) {
  const errorResult = []
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.generateSignature', 'generateSignature', errorResult, sources, trigger$, kill$)
  }
}

export function BinnedZhangQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.binnedZhang', 'binnedZhang', errorResult, sources, trigger$, kill$)
  }
}

export function TopTableQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.topTable', 'topTable', errorResult, sources, trigger$, kill$)
  }
}

export function TargetToCompoundsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.targetToCompounds', 'targetToCompounds', errorResult, sources, trigger$, kill$)
  }
}

export function PerturbationInformationDetailsQuery(trigger$, kill$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.perturbationInformationDetails', 'perturbationInformationDetails', errorResult, sources, trigger$, kill$)
  }
}

export function StatisticsQuery(trigger$, kill$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuery('&classPath=com.dataintuitive.luciusapi.statistics', 'statistics', errorResult, sources, trigger$, kill$)
  }
}

// Which API to use is stuck in the state stream, to we must get it there and somehow convert
// the stream to an object of streams, so we need to add an additional abstraction layer here.
// However, I don't like how this code is set up, but unless we want to rewrite the Table component,
// this is more or less needed to be compatible with the designed interface.
// Perhaps there is a cleaner way to do this though; I don't like this piece of code. At. All.
export function AutoSelectTable(nameStream$) {

  var tableObject = (a, b) => (c) => {}
    
  var tableWrapper = {
    HTTP: xs.create(),
    onion: xs.create(),
    data$: xs.create(),
    invalidData$: xs.create(),
    error$: xs.create()
  }

  return function (trigger$, kill$) {
    return function (sources) {

      const tableNameListener = {
        next: (value) => {
          console.log("tableNameListener next value: " + value)
          if (value == "topTable") {
            tableObject = TopTableQuery(trigger$, kill$)(sources)
          }
          else if (value == "targetToCompounds") {
            tableObject = TargetToCompoundsQuery(trigger$, kill$)(sources)
          }
          tableWrapper.HTTP.imitate(tableObject.HTTP)
          tableWrapper.onion.imitate(tableObject.onion)
          tableWrapper.data$.imitate(tableObject.data$)
          tableWrapper.invalidData$.imitate(tableObject.invalidData$)
          tableWrapper.error$.imitate(tableObject.error$)
        },
        error: (err) => {},
        complete: () => {}
      }
      nameStream$.addListener(tableNameListener)

      return tableWrapper
    }
  }
}

function asyncQuery(classPath, category, errorResult, sources, trigger$, kill$) {

  const state$ = sources.onion.state$

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

  const pollTimer$ = xs.create()

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
    .debug('delete$-' + category)

  const responseDelete$ = sources.HTTP
    .select(category + 'DELETE')
    .map((response$) =>
        response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()

  const jobStatus$ = xs.merge(responsePost$, responseGetDone$, responseDelete$)
    .map(r => r.body.status)
    .startWith("idle")

  const data$ = responseGetDone$
    .filter(r => r.body.status != "error")
    .map(r => r.body.result)

  const invalidData$ = xs.merge(responsePost$, responseGetDone$, responseDelete$)
    .filter((r) => r.body.status == "error")

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
    onion: xs.merge(requestReducer$, jobIdReducer$, jobStatusReducer$),
    data$: data$,
    invalidData$: invalidData$,
    error$: error$
  }
}