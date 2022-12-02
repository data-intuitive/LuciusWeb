import xs from "xstream"
import { div, p, span, button, textarea, input, a } from "@cycle/dom"
import isolate from "@cycle/isolate"
import { prop, equals } from "ramda"

import { initSettings } from "../configuration"
import { SettingsEditor } from "../components/SettingsEditor"
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

const settingsConfig = [
  {
    group: "init",
    title: "API Settings",
    settings: [
      {
        field: "url",
        class: ".input-field",
        type: "text",
        title: "Spark JobServer URL",
        props: {},
      },
      {
        field: "contextOptions",
        class: ".input-field",
        type: "text",
        title: "Context options",
        props: {},
      },
    ],
  },
]

function intent(domSource$) {
  const trigger1$ = domSource$.select(".trigger1").events("click").remember()
  const trigger2$ = domSource$.select(".trigger2").events("click").remember()
  const trigger3$ = domSource$.select(".trigger3").events("click").remember()
  const trigger4$ = domSource$.select(".trigger4").events("click").remember()
  // const trigger5$ = domSource$.select(".trigger5").events("click").remember()

  const loadJar$ = domSource$.select(".jarFile").events("change").remember().debug("loadJar$")
  const loadConfig$ = domSource$.select(".configFile").events("change").remember().debug("loadConfig$")

  return {
    trigger1$: trigger1$,
    trigger2$: trigger2$,
    trigger3$: trigger3$,
    trigger4$: trigger4$,
    // trigger5$: trigger5$,

    loadJar$: loadJar$,
    loadConfig$: loadConfig$,
  }
}

function model(actions, state$) {
  const jarFile$ = actions.loadJar$
    .map((_) => {
      const input = document.getElementById("jarFile")      
      const file = input.files[0]
      return file
    })
    .startWith(undefined)

  const configFile$ = actions.loadConfig$
    .map((_) => {
      const input = document.getElementById("configFile")      
      const file = input.files[0]
      return file
    })
    .startWith(undefined)

  // Deleting previous context...
  // curl -X DELETE localhost:8090/contexts/luciusapi
  const requestTrigger1$ = actions.trigger1$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: state.settings.init.url + "contexts/luciusapi",
      method: "DELETE",
      send: {},
      category: "init",
    })).debug("requestTrigger1$")

  // Uploading assembly jar...
  // curl -H Content-Type: application/java-archive --data-binary @target/scala-2.11/LuciusAPI-assembly-5.0.1.jar localhost:8090/binaries/luciusapi
  const requestTrigger2$ = actions.trigger2$.compose(sampleCombine(xs.combine(state$, jarFile$)))
    .map(([_, [state, jar]]) => ({
      url: state.settings.init.url + "binaries/luciusapi",
      method: "POST",
      type: "application/java-archive",
      send: jar,
      category: "init",
    }))

  // Starting new context...
  // curl -d  localhost:8090/contexts/luciusapi?context-factory=spark.jobserver.context.SessionContextFactory&spark.scheduler.mode=FAIR&spark.jobserver.context-creation-timeout=60&spark.memory.fraction=0.7&spark.dynamicAllocation.enabled=false&spark.executor.instances=6&spark.executor.cores=4&spark.executor.memory=4g&spark.yarn.executor.memoryOverhead=2g&spark.yarn.am.memory=4G&spark.driver.memory=4G
  const requestTrigger3$ = actions.trigger3$.compose(sampleCombine(state$))
    .map(([_, state]) => ({
      url: state.settings.init.url + "contexts/luciusapi?" + state.settings.init.contextOptions,
      method: "POST",
      send: {},
      category: "init",
    }))

  // Initializing API...
  // curl --data-binary @utils/../../config/spark_config.conf localhost:8090/jobs?context=luciusapi&appName=luciusapi&classPath=com.dataintuitive.luciusapi.initialize
  const requestTrigger4$ = actions.trigger4$.compose(sampleCombine(xs.combine(state$, configFile$)))
    .map(([_, [state, config]]) => ({
      url: state.settings.init.url + "jobs?context=luciusapi&appName=luciusapi&classPath=com.dataintuitive.luciusapi.initialize",
      method: "POST",
      send: config,
      category: "init",
    }))

  // const requestTrigger5$ = actions.trigger5$.compose(sampleCombine(state$))
  //   .map(([_, state]) => ({
  //     url: state.settings.init.url + "jobs/9ab0a4bb-0e62-49f4-8654-db47e701c59c",
  //     method: "DELETE",
  //     send: {},
  //     category: "init",
  //   }))

  return {
    jarFile$: jarFile$,
    configFile$: configFile$,
    requests$: xs.merge(
      requestTrigger1$,
      requestTrigger2$,
      requestTrigger3$,
      requestTrigger4$,
      // requestTrigger5$,
    )
  }
}

function view(requests$, responses$, statusDisplay$, settingsDOM$, jarFile$, configFile$, apiUrl$) {

  const requestsText$ = requests$
    .map((obj) => (
      "--> " + obj.method + ": " + obj.url
    ))

  const responsesText$ = responses$
    .map((t) => "<-- " + (t != undefined ? t.body.status + ": " + (t.body.result ?? t.body.duration ?? "") : "response missing"))

  const initText$ = xs
    .merge(
      requestsText$,
      responsesText$
    )
    .fold((acc, t) => acc + t + "\r\n", "")

  const vdom$ = xs.combine(apiUrl$, statusDisplay$, settingsDOM$, initText$, jarFile$, configFile$)
    .map(([sjsLink, statusDisplay, settings, initText, jarFile, configFile]) =>
      div(".container .init", [
        div(".row .s12", a(".do-not-route", {props: {href: sjsLink, target: "_blank"}}, "Spark overview page")),
        div([p("Server poll status: ", [
          span("SJS status query: "),
          span(".status-" + statusDisplay, 
            statusDisplay == "loading" 
            ? "no reply received yet" 
            : statusDisplay == "valid" 
              ? "reply successfully received" 
              : "status query failed" 
          )
        ])]),
        settings,
        div(".row .s12"),
        div(".row .s12", [
          span(".col .s1", "Step 1"),
          span(".col .s3 .offset-s1", "Delete previous context"),
          button(".trigger1 .col .s2 .offset-s5 .btn .grey", "Start"),
        ]),
        div(".row .s12", [
          span(".col .s1", "Step 2"),
          span(".col .s3 .offset-s1", "Upload assembly jar"),
          input(".col .s3 .offset-s1 .jarFile", { props: {type: "file", name: "jarFile", id: "jarFile", accept: "application/java-archive"} }),
          button(".trigger2 .col .s2 .offset-s1 .btn .grey" + (jarFile == undefined ? " .disabled" : ""), "Start"),
        ]),
        div(".row .s12", [
          span(".col .s1", "Step 3"),
          span(".col .s3 .offset-s1", "Start new context"),
          button(".trigger3 .col .s2 .offset-s5 .btn .grey", "Start"),
        ]),
        div(".row .s12", [
          span(".col .s1", "Step 4"),
          span(".col .s3 .offset-s1", "Initialize API"),
          input(".col .s3 .offset-s1 .configFile", { props: {type: "file", name: "configFile", id: "configFile", accept: "application/json, .conf"} }),
          button(".trigger4 .col .s2 .offset-s1 .btn .grey" + (configFile == undefined ? " .disabled" : ""), "Start"),
        ]),
        div(".row .s12", textarea({ props: { value: initText, readOnly: true}, style: { height: "400px" } })),
        // div(".row .s12", [
        //   button(".trigger5 .col .s2 .btn .grey", "Test button"),
        // ]),
        div(".row .s12", [""]),
      ])
    )
  return vdom$
}


/**
 * This component should become an API managemt page used to trigger initialization
 * and other operational aspects of managing LuciusAPI.
 */
function Init(sources) {
  const state$ = sources.state.stream
    .compose(dropRepeats(equals))
    .startWith({ core: defaultState, settings: initSettings })
  // .map(state => merge(state, state.settings.admin, state.settings.api))

  const apiUrl$ = state$.map((state) => state.settings.init?.url).compose(debounce(1000))

  const statusRequest$ = apiUrl$.map((url) => ({
    url: url + "jobs",
    method: "GET",
    send: {},
    category: "status",
  }))

  const statusResponse$$ = sources.HTTP.select("status")

  const invalidStatusResponse$ = statusResponse$$
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
  const validStatusResponse$ = statusResponse$$
    .map((response$) => response$.replaceError((error) => xs.empty()))
    .flatten()
    .compose(debounce(500))

  const statusDisplay$ = xs
    .merge(
      validStatusResponse$.mapTo("valid"),
      invalidStatusResponse$.mapTo("invalid")
    ) 
    .startWith("loading")

  const Settings = isolate(SettingsEditor, "settings")({
    ...sources,
    settings$: xs.of(settingsConfig)
  })

  const response$$ = sources.HTTP.select("init")

  const responses$ = response$$
    .map(
      (response$) =>
        response$.debug("response$")
          .replaceError((error) => xs.of(error.response)) // emit error
    )
    .flatten()
    .debug("responses$")

    const actions = intent(sources.DOM)

    const model_ = model(actions, state$)
  
    const vdom$ = view(model_.requests$, responses$, statusDisplay$, Settings.DOM, model_.jarFile$, model_.configFile$, apiUrl$)


  // This is needed in order to get the state stream active!
  const defaultReducer$ = xs.of((prevState) => {
    if (typeof prevState === "undefined") {
      return defaultState
    } else {
      return prevState
    }
  })

  // const responseReducer$ = validResponse$.map((response) => (prevState) => ({
  //   ...prevState,
  //   core: { ...prevState.core, state: 1 },
  // }))

  const settingsReducer$ = Settings.state.compose(debounce(200))

  return {
    DOM: vdom$,
    HTTP: xs.merge(statusRequest$, model_.requests$),
    state: xs.merge(defaultReducer$, /*responseReducer$,*/ settingsReducer$),
  }
}

export default Init
