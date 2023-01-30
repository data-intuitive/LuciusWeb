import { div, p, h2, code } from "@cycle/dom"
import xs from "xstream"
import debounce from "xstream/extra/debounce"

function AsyncWorkflow(sources) {

  const state$ = sources.onion.state$

  // const request$ = xs.of(1).mapTo({
  //   send: {
  //     query: "HSPA1A DNAJB1 DDIT4 -TSEN2"
  //   },
  //   method: "POST",
  //   url:
  //     "http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&sync=true&timeout=240&classPath=com.dataintuitive.luciusapi.binnedZhang",
  //   category: "sync"
  // })

  function syncRequestProcess(sources) {

    const response$$ = sources.HTTP.select("sync")

    const invalidResponse$ = response$$
      .map(
        (response$) =>
          response$
            .filter(_ => false) // ignore regular event
            .replaceError((error) => xs.of(error)) // emit error
      )
      .flatten()
      .map(j => j.body)

    const validResponse$ = response$$
      .map((response$) => response$.replaceError(_ => xs.empty()))
      .flatten()
      .map(j => j.body)

    return { invalid: invalidResponse$, valid: validResponse$ }

  }

  // const response = asyncRequestProcess(sources)

  const request$ = xs.of(1).mapTo({
    send: {
      query: "HSPA1A DNAJB1 DDIT4 -TSEN2"
    },
    method: "POST",
    url:
      "http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&classPath=com.dataintuitive.luciusapi.binnedZhang",
    category: "async"
  })

  const response$$ = sources.HTTP.select("async")

  const invalidAsyncResponse$ = response$$
    .map(
      (response$) =>
        response$
          .filter(_ => false) // ignore regular event
          .replaceError((error) => xs.of(error)) // emit error
    )
    .flatten()
    .map(j => j.body)

  const validAsyncResponse$ = response$$
    .map((response$) => response$.replaceError(_ => xs.empty()))
    .flatten()
    .map(j => j.body)

  const jobId$ = validAsyncResponse$.map(j => j.jobId).debug()

  const responsePoll$$ = sources.HTTP.select("async-poll")

  const invalidPollResponse$ = responsePoll$$
    .map(
      (response$) =>
        response$
          .filter(_ => false) // ignore regular event
          .replaceError((error) => xs.of(error)) // emit error
    )
    .flatten()
    .map(j => j.body)

  const validPollResponse$ = responsePoll$$
    .map((response$) => response$.replaceError(_ => xs.empty()))
    .flatten()
    .map(j => j.body)

  const busyResponse$ = validPollResponse$
    .filter(j => j.status == "RUNNING")

  const readyResponse$ = validPollResponse$
    .filter(j => j.status == "FINISHED")

  const response = { valid: readyResponse$, invalid: invalidPollResponse$ }

  /**
   * Logic for counter and timeout timer
   *
   * The timer itself is based on a configurable delta parameter and stops when any response is received from job
   * The secTimer translates that to seconds.
   * 
   * In real life, multiple such timers will be counting. We probably want to aggregate the warnings
   * to a higher (page) level and handle them there.
   */
  const delta = 500
  // When to show a warning, this will be shown each time timeoutWarning has passed - should be taken up in settings
  const timeoutWarning = 15
  // When to show an error - should be taken up in settings
  const timeoutError = 60
  const timer$ =
    xs.periodic(delta)
      .map(i => (i * delta) / 1000)
      .endWhen(xs.merge(response.valid, response.invalid))
  const secTimer$ = timer$.filter(i => i % 1 == 0)
  // Trigger warning every 15 seconds
  const warningTrigger$ =
    secTimer$
      .filter(i => i >= timeoutWarning)
      .drop(1).map(i => ({ level: "warning", q: "query1", t: i }))
  const errorTrigger$ =
    secTimer$
      .filter(i => i % timeoutError == 0)
      .drop(1)
      .map(i => ({ level: "error", q: "query1", t: i }))
  // A combined stream with warnings and errors, to be merged with other such streams.
  const watchdog$ = xs.merge(warningTrigger$, errorTrigger$)

  const poll$ = xs.combine(timer$, jobId$).map(([_, id]) => ({
    method: "GET",
    url:
      "http://localhost:8090/jobs/" + id,
    category: "async-poll"
  })).endWhen(readyResponse$)

  // This warning currently gets added to the vdom but should probably be a modal
  const warningVdom$ = watchdog$.map(j => "Waiting for " + j.t + " seconds already - " + j.level).startWith("")

  const vdom$ = xs.combine(secTimer$, warningVdom$, request$, validPollResponse$.startWith({}))
    .map(
      ([
        i, warning, request, response
      ]) =>
        div(".row .disease", { style: { margin: "0px 0px 0px 0px" } }, [
          p('', "count: " + i),
          h2("Request:"),
          code(JSON.stringify(request)),
          h2("Response:"),
          code(JSON.stringify(response)),
          h2("Warning"),
          warning
        ])
    ).startWith(div())

  /**
 * Vdom sync
 */
  // const vdom$ = xs.combine(secTimer$, warningVdom$, request$, response.valid.startWith({}))
  //   .map(
  //     ([
  //       i, warning, request, response
  //     ]) =>
  //       div(".row .disease", { style: { margin: "0px 0px 0px 0px" } }, [
  //         p('', "count: " + i),
  //         h2("Request:"),
  //         code(JSON.stringify(request)),
  //         h2("Response:"),
  //         code(JSON.stringify(response)),
  //         h2("Warning"),
  //         warning
  //       ])
  //   ).startWith(div())

  const defaultReducer$ = xs
    .of(function defaultReducer(prevState) {
      if (typeof prevState === "undefined") {
        return ({})
      } else {
        return prevState
      }
    })

  return {
    DOM: vdom$,//.debug("vdom"),
    onion: defaultReducer$.debug("reducer"),
    HTTP: xs.merge(request$, poll$).debug("http"),
  }
}

export default AsyncWorkflow

