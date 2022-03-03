import xs from "xstream"
import { div, p, span, button, textarea } from "@cycle/dom"
import { merge, prop, equals } from "ramda"

import { initSettings } from "../configuration"
import debounce from "xstream/extra/debounce"
import dropRepeats from "xstream/extra/dropRepeats"
import sampleCombine from "xstream/extra/sampleCombine"

const defaultState = {
  green: {
    url: "http://localhost:8090",
  },
  blue: {
    url: "localhost:8081",
  },
}

/**
 * This component should become an API managemt page used to trigger initialization
 * and other operational aspects of managing LuciusAPI.
 */
function Admin(sources) {
  const state$ = sources.onion.state$.debug("state$")
    .compose(dropRepeats((x, y) => equals(x.core, y.core)))
    .startWith({ core: defaultState, settings: initSettings })
  // .map(state => merge(state, state.settings.admin, state.settings.api))

  const request$ = state$.map((state) => ({
    url: state.settings.api.url + "/jobs",
    method: "GET",
    send: {},
    category: "status",
  }))

  const response$$ = sources.HTTP.select("status")

  const invalidResponse$ = response$$
    .map(
      (response$) =>
        response$
          .filter((response) => false) // ignore regular events
          .replaceError((error) => xs.of(error)) // emit error
    )
    .flatten()

  /**
   * Parse the successful results only.
   *
   * We add a little wait time (`debounce`) in order for the jobserver
   * to be up-to-date with the actual jobs. Otherwize, we measure the
   * wrong job times.
   */
  const validResponse$ = response$$
    .map((response$) => response$.replaceError((error) => xs.empty()))
    .flatten()
    .compose(debounce(500))

  const trigger1$ = sources.DOM.select(".trigger1").events("click").remember()
  const trigger2$ = sources.DOM.select(".trigger2").events("click").remember()
  const trigger3$ = sources.DOM.select(".trigger3").events("click").remember()
  const trigger4$ = sources.DOM.select(".trigger4").events("click").remember()
  const trigger5$ = sources.DOM.select(".trigger5").events("click").remember()

  // Deleting previous context...
  // curl -X DELETE localhost:8090/contexts/luciusapi
  const requestTrigger1$ = trigger1$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: "http://localhost:8090/contexts/luciusapi",
      method: "DELETE",
      send: {},
      category: "init",
    })).debug("requestTrigger1$")

  // Uploading assembly jar...
  // curl -H Content-Type: application/java-archive --data-binary @target/scala-2.11/LuciusAPI-assembly-5.0.1.jar localhost:8090/binaries/luciusapi
  const requestTrigger2$ = trigger2$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: "http://localhost:8090/binaries/luciusapi",
      method: "POST",
      headers: { ContentType: "application/java-archive" },
      attach: [{ name: "jar", path: "file:/home/hendrik/DI/compass/LuciusAPI/target/scala-2.11/LuciusAPI-assembly-5.0.1.jar" }],
      send: {},
      category: "init",
    })).debug("requestTrigger2$")

  // Starting new context...
  // curl -d  localhost:8090/contexts/luciusapi?context-factory=spark.jobserver.context.SessionContextFactory&spark.scheduler.mode=FAIR&spark.jobserver.context-creation-timeout=60&spark.memory.fraction=0.7&spark.dynamicAllocation.enabled=false&spark.executor.instances=6&spark.executor.cores=4&spark.executor.memory=4g&spark.yarn.executor.memoryOverhead=2g&spark.yarn.am.memory=4G&spark.driver.memory=4G
  const requestTrigger3$ = trigger3$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: "http://localhost:8090/contexts/luciusapi?context-factory=spark.jobserver.context.SessionContextFactory&spark.scheduler.mode=FAIR&spark.jobserver.context-creation-timeout=60&spark.memory.fraction=0.7&spark.dynamicAllocation.enabled=false&spark.executor.instances=6&spark.executor.cores=4&spark.executor.memory=4g&spark.yarn.executor.memoryOverhead=2g&spark.yarn.am.memory=4G&spark.driver.memory=4G",
      method: "POST",
      send: {},
      category: "init",
    })).debug("requestTrigger3$")

  // Initializing API...
  // curl --data-binary @utils/../../config/spark_config.conf localhost:8090/jobs?context=luciusapi&appName=luciusapi&classPath=com.dataintuitive.luciusapi.initialize
  const config = `{
    db.uris = [
      #"/home/hendrik/DI/compass/S3_compass/sample-extended/target/2021-07-02/results.parquet",
      #"/home/hendrik/DI/compass/S3_compass/sample/target/2021-07-02/results.parquet",
      "/home/hendrik/DI/compass/S3_compass/2022-1/batch_012022/target/2022-01-24/results.parquet",
    "/home/hendrik/DI/compass/S3_compass/2022-1/batch_012422/target/2022-01-24/results.parquet",
    "/home/hendrik/DI/compass/S3_compass/2022-1/batch_012822/target/2022-01-24/results.parquet",
    ]
    geneAnnotations = "/home/hendrik/DI/compass/S3_compass/sample/source/GSE92742_Broad_LINCS_gene_info.txt"
    storageLevel = "MEMORY_ONLY_1"
    partitions = 4
    geneFeatures {
      "pr_gene_id" = "id"
      "pr_gene_symbol" = "symbol"
      "pr_is_lm" = dataType
      "pr_is_bing" = dataType2
      "pr_is_name" = "name"
    }
    geneDataType {
      "1-1" = "L1000"
      "0-1" = "BING"
      "0-0" = "AIG"
      "1-0" = "INVALID"
    }
  }`
  
  const requestTrigger4$ = trigger4$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: "http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&classPath=com.dataintuitive.luciusapi.initialize",
      method: "POST",
      send: config,
      category: "init",
    }))

  const requestTrigger5$ = trigger5$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: "http://localhost:8090/jobs?status=finished",
      method: "DELETE",
      send: {},
      category: "init",
    }))

  const initRequestText$ = xs
    .merge(
      requestTrigger1$,
      requestTrigger2$,
      requestTrigger3$,
      requestTrigger4$,
    )
    .map((obj) => (
      "--> " + obj.method + ": " + obj.url
    ))
  
  const initResponse$$ = sources.HTTP.select("init")

  const initResponse$ = initResponse$$
    .map(
      (response$) =>
        response$.debug("response$")
          .replaceError((error) => xs.of(error.response)) // emit error
    )
    .flatten()
    .debug("initResponse$")
    .map((t) => "<-- " + (t != undefined ? t.body.status + ": " + t.body.result : "response missing"))

  const initText$ = xs
    .merge(
      initRequestText$,
      initResponse$
    )
    .fold((acc, t) => acc + t + "\r\n", "")

  const vdom$ = xs.combine(state$, initText$)
    .map(([state, initText]) =>
      div(".container", [
        div([p("Server poll status: " + (state.core?.state == undefined ? "no reply received" : "reply successfully received"))]),
        div(".row .s12"),
        div(".row .s12", [
          span(".col .s2", "Step 1"),
          span(".col .s4 .offset-s1", "Delete previous context"),
          button(".trigger1 .col .s2 .offset-s3 .btn .grey", "Start"),
        ]),
        div(".row .s12", [
          span(".col .s2", "Step 2"),
          span(".col .s4 .offset-s1", "Upload assembly jar"),
          button(".trigger2 .col .s2 .offset-s3 .btn .grey", "Start"),
        ]),
        div(".row .s12", [
          span(".col .s2", "Step 3"),
          span(".col .s4 .offset-s1", "Start new context"),
          button(".trigger3 .col .s2 .offset-s3 .btn .grey", "Start"),
        ]),
        div(".row .s12", [
          span(".col .s2", "Step 4"),
          span(".col .s4 .offset-s1", "Initialize API"),
          button(".trigger4 .col .s2 .offset-s3 .btn .grey", "Start"),
        ]),
        div(".row .s12", textarea({ props: { value: initText, readOnly: true}, style: { height: "400px" } })),
        div(".row .s12", [
          button(".trigger5 .col .s2 .btn .grey", "Test button"),
        ]),
        div(".row .s12", [""]),
      ])
    )


  // This is needed in order to get the onion stream active!
  const defaultReducer$ = xs.of((prevState) => {
    if (typeof prevState === "undefined") {
      return defaultState
    } else {
      return prevState
    }
  })

  const responseReducer$ = validResponse$.map((response) => (prevState) => ({
    ...prevState,
    core: { ...prevState.core, state: 1 },
  }))

  return {
    DOM: vdom$,
    HTTP: xs.merge(request$, requestTrigger1$, requestTrigger2$, requestTrigger3$, requestTrigger4$, requestTrigger5$),
    onion: xs.merge(defaultReducer$, responseReducer$),
  }
}

export default Admin
