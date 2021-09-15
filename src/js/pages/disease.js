import { div } from "@cycle/dom"
import xs from "xstream"
import isolate from "@cycle/isolate"

// Components
import { SignatureForm, formLens } from "../components/SignatureForm"
import { BinnedPlots, plotsLens } from "../components/BinnedPlots/BinnedPlots"
import { makeTable, headTableLens, tailTableLens } from "../components/Table"
import { initSettings } from "../configuration.js"
import { Filter, filterLens } from "../components/Filter"
import { loggerFactory } from "../utils/logger"
import {
  SampleTable,
  sampleTableLens,
} from "../components/SampleTable/SampleTable"

// Support for ghost mode
import { scenario } from "../scenarios/diseaseScenario"
import { runScenario } from "../utils/scenario"

function DiseaseWorkflow(sources) {
  const logger = loggerFactory(
    "signature",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

  console.log(sources)

  // Scenario for ghost mode
  const scenarioReducer$ = sources.onion.state$
    .take(1)
    .filter((state) => state.settings.common.ghostMode)
    .mapTo(runScenario(scenario).scenarioReducer$)
    .flatten()
    .startWith((prevState) => prevState)
  const scenarioPopup$ = sources.onion.state$
    .take(1)
    .filter((state) => state.settings.common.ghostMode)
    .mapTo(runScenario(scenario).scenarioPopup$)
    .flatten()
    .startWith({ text: "Welcome to Disease Workflow", duration: 4000 })

  /**
   * Parse feedback from vega components. Not used yet...
   *
   * const feedback$ = sources.vega.map(item => item).startWith(null).debug();
   * const feedback$ = domSource$.select('.SignatureCheck').events('click').mapTo('click !').startWith(null);
   */

  const signatureForm = isolate(SignatureForm, { onion: formLens })(sources)
  const signature$ = signatureForm.output

  // default Reducer, initialization
  const defaultReducer$ = xs.of((prevState) => {
    // disease -- defaultReducer
    if (typeof prevState === "undefined") {
      return {
        settings: initSettings,
      }
    } else {
      return {
        ...prevState,
        settings: prevState.settings,
      }
    }
  })

  // Filter Form
  const filterForm = isolate(Filter, { onion: filterLens })({
    ...sources,
    input: signature$,
  })
  const filter$ = filterForm.output.remember()

  // Binned Plots Component
  const binnedPlots = isolate(BinnedPlots, { onion: plotsLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$)
      .map(([s, f]) => ({ signature: s, filter: f }))
      .remember(),
  })

  // tables
  const headTableContainer = makeTable(SampleTable, sampleTableLens)
  const tailTableContainer = makeTable(SampleTable, sampleTableLens)

  // Join settings from api and sourire into props
  const headTable = isolate(headTableContainer, { onion: headTableLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$)
      .map(([s, f]) => ({ query: s, filter: f }))
      .remember(),
  })
  const tailTable = isolate(tailTableContainer, { onion: tailTableLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$)
      .map(([s, f]) => ({ query: s, filter: f }))
      .remember(),
  })

  const pageStyle = {
    style: {
      fontSize: "14px",
      opacity: "0",
      transition: "opacity 1s",
      delayed: { opacity: "1" },
      destroy: { opacity: "0" },
    },
  }

  const vdom$ = xs
    .combine(
      signatureForm.DOM,
      filterForm.DOM,
      binnedPlots.DOM,
      headTable.DOM,
      tailTable.DOM
      // feedback$
    )
    .map(
      ([
        form,
        filter,
        plots,
        headTable,
        tailTable,
        // feedback
      ]) =>
        div(".row .disease", { style: { margin: "0px 0px 0px 0px" } }, [
          form,
          div(".col .s10 .offset-s1", pageStyle, [
            div(".row", [filter]),
            div(".row", [plots]),
            div(".row", []),
            div(".col .s12", [headTable]),
            div(".row", []),
            div(".col .s12", [tailTable]),
            div(".row", []),
          ]),
        ])
    )

  return {
    log: xs.merge(
      logger(state$, "state$"),
      binnedPlots.log,
      filterForm.log,
      signatureForm.log
    ),
    DOM: vdom$,
    onion: xs.merge(
      defaultReducer$,
      signatureForm.onion,
      filterForm.onion,
      binnedPlots.onion,
      headTable.onion,
      tailTable.onion,
      scenarioReducer$
    ),
    vega: xs.merge(binnedPlots.vega),
    HTTP: xs.merge(
      signatureForm.HTTP,
      filterForm.HTTP,
      binnedPlots.HTTP,
      headTable.HTTP,
      tailTable.HTTP
    ),
    popup: scenarioPopup$,
  }
}

export default DiseaseWorkflow
