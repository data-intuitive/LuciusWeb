import { equals } from "ramda"
import xs from "xstream"
import delay from "xstream/extra/delay"
import dropRepeats from "xstream/extra/dropRepeats"
import sampleCombine from "xstream/extra/sampleCombine"

export function filtersQuery(trigger$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuerySettings('filters', errorResult, sources, trigger$)
  }
}

export function treatmentsQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('treatments', errorResult, sources, trigger$)
  }
}

export function treatmentToPerturbationsQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('treatmentToPerturbations', errorResult, sources, trigger$)
  }
}

export function SignatureGeneratorQuery(trigger$) {
  const errorResult = []
  return function (sources) {
    return asyncQuerySettings('generateSignature', errorResult, sources, trigger$)
  }
}

export function BinnedZhangQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('binnedZhang', errorResult, sources, trigger$)
  }
}

export function TargetToCompoundsQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('targetToCompounds', errorResult, sources, trigger$)
  }
}

export function StatisticsQuery(trigger$) {
  const errorResult = { data: {} }
  return function (sources) {
    return asyncQuerySettings('statistics', errorResult, sources, trigger$)
  }
}

export function CorrelationQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    return asyncQuerySettings('correlation', errorResult, sources, trigger$)
  }
}

// Wrapper for topTable to use actual table (ie. topTable, bottomTable, compoundTable) as status name and category
export function TopTableQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    const config$ = sources.onion.state$
      .map((state) => ({
        classPath: '&classPath=com.dataintuitive.luciusapi.topTable',
        category: state.settings.table.type,
        statusName: state.settings.table.type,
      }))
      .compose(dropRepeats(equals))
      .remember()
    const apiInfo$ = sources.onion.state$.map((state) => state.settings.api)
    return asyncQuery(config$, errorResult, apiInfo$, sources.HTTP, trigger$, sources.kill)
  }
}

// Wrapper for perturbationInformationDetails to add the table name and index behind the status name
// Also uses props instead of state.settings to get the api information
export function PerturbationInformationDetailsQuery(trigger$) {
  const errorResult = { data: [] }
  return function (sources) {
    const config$ = sources.props
      .map((props) => ({
        classPath: '&classPath=com.dataintuitive.luciusapi.perturbationInformationDetails',
        category: 'perturbationInformationDetails',
        statusName: 'perturbationInformationDetails-' + props.table.type + '-' + sources.index,
      }))
      .compose(dropRepeats(equals))
      .remember()
    const apiInfo$ = sources.props.map((props) => props.api)
    return asyncQuery(config$, errorResult, apiInfo$, sources.HTTP, trigger$, sources.kill)
  }
}

// Wrapper for checkSignature to add an index behind the status name
export function CheckSignatureQuery(trigger$) {
  const errorResult = { data: {} }
  return function (sources) {
    const config$ = xs.of({
        classPath: '&classPath=com.dataintuitive.luciusapi.checkSignature',
        category: 'checkSignature',
        statusName: 'checkSignature' + (sources.index ?? ''),
      })
      .remember()
    const apiInfo$ = sources.onion.state$.map((state) => state.settings.api)
    return asyncQuery(config$, errorResult, apiInfo$, sources.HTTP, trigger$, sources.kill)
  }
}

// light weight help-wrapper for most constructors which use default settings derived from a static 'category' string
function asyncQuerySettings(category, errorResult, sources, trigger$) {
  const apiInfo$ = sources.onion.state$.map((state) => state.settings.api)
  const config$ = xs.of({
    classPath: '&classPath=com.dataintuitive.luciusapi.' + category,
    category: category,
    statusName: category,
  })
  .remember()
  return asyncQuery(config$, errorResult, apiInfo$, sources.HTTP, trigger$, sources.kill)
}

// main function, requires quite a bit of inputs so using construction wrappers is more user friendly
function asyncQuery(config$, errorResult, apiInfo$, sourcesHTTP, trigger$, kill$) {

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

  const requestPost$ = trigger$.compose(sampleCombine(apiInfo$, config$))
    .map(([data, api, config]) => {
      return {
        url: api.asyncUrlStart + config.classPath,
        method: 'POST',
        send: data,
        'category': config.category + 'POST'
      }
    })
    .remember()

  const responsePost$ = config$
    .map(c => sourcesHTTP
      .select(c.category + 'POST')
      .map((response$) =>
          response$.replaceError(() => xs.of(emptyData))
      )
      .flatten()
    )
    .flatten()

  const jobId$ = responsePost$
    .map(r => r.body.jobId)
    .startWith("")

  const jobStatus$ = xs.create()
  const pollTimer$ = xs.create()

  const requestGet$ = pollTimer$.compose(sampleCombine(apiInfo$, config$, jobId$, jobStatus$))
    .filter(([_, api, config, jobId, jobStatus]) => jobStatus == "STARTED" || jobStatus == "RUNNING")
    .map(([_, api,config, jobId, jobStatus]) => {
        return {
            url: api.asyncUrlStatus + jobId,
            method: 'GET',
            'category': config.category + 'GET'
        }
    })

  const responseGet$ = config$
    .map(c => sourcesHTTP
      .select(c.category + 'GET')
      .map((response$) =>
          response$.replaceError(() => xs.of(emptyData))
      )
      .flatten()
    )
    .flatten()
  
  // Poll after initial POST reply was received or after a GET reply indicated that the code is still running
  const pollTimer2$ = xs
    .merge(responsePost$, responseGet$)
    .compose(sampleCombine(apiInfo$))
    .filter(([r, _]) => r.body.status == "STARTED" || r.body.status == "RUNNING")
    .map(([_, api]) => xs.of(1).compose(delay(api.asyncStatusInterval * 1000)))
    .flatten()
  
  pollTimer$.imitate(pollTimer2$)

  const responseGetDone$ = responseGet$
    .filter(r => r.body.status != "STARTED" && r.body.status != "RUNNING")

  const requestDelete$ = kill$
    .compose(sampleCombine(apiInfo$, config$, jobId$, jobStatus$))
    .filter(([_, api, config, jobId, jobStatus]) => jobId != undefined && ( jobStatus == "STARTED" || jobStatus == "RUNNING" ))
    .map(([_, api, config, jobId, jobStatus]) => {
        return {
            url: api.asyncUrlStatus + jobId,
            method: 'DELETE',
            'category': config.category + 'DELETE'
        }
    })

  const responseDelete$ = config$
    .map(c => sourcesHTTP
      .select(c.category + 'DELETE')
      .map((response$) =>
          response$.replaceError(() => xs.of(emptyData))
      )
      .flatten()
    )
    .flatten()

  const jobStatus_late$ = xs.merge(responsePost$, responseGet$, responseDelete$)
    .map(r => r.body.status)
    // .startWith("idle")

  jobStatus$.imitate(jobStatus_late$)

  ///////////////////////////////
  const requestTime$ = trigger$.map(_ => new Date().getTime())
  const responseTime$ = jobStatus$.map(_ => new Date().getTime())
  const timeDifference$ = responseTime$.compose(sampleCombine(requestTime$))
    .map(([response, request]) => (response - request) )
  //////////////////////////////

  const data$ = responseGetDone$
    .filter(r => r.body.status != "error" && r.body.status != "KILLED")
    .map(r => r.body.result)

  const invalidData$ = xs.merge(responsePost$, responseGetDone$, responseDelete$)
    .filter((r) => r.body.status == "error")

  const jobDeleted$ = responseDelete$
    .filter((r) => r.body.status == "KILLED")

  const error$ = invalidData$
    .mapTo(generateError("Generic HTTP error", 0, 0))

  const status$ = jobStatus$.compose(sampleCombine(jobId$, requestPost$, timeDifference$, config$))
    .map(([jobStatus, jobId, request, time, config]) => ({
      [config.statusName]: {
        jobId: jobId,
        jobStatus: jobStatus,
        request: request,
        elapsedTime: time,
      }
    }))

  return {
    HTTP: xs.merge(requestPost$, requestGet$, requestDelete$),
    asyncQueryStatus: status$,
    data$: data$,
    invalidData$: invalidData$,
    jobDeleted$: jobDeleted$,
    error$: error$,
  }
}