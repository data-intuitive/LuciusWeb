import { div } from "@cycle/dom"
import xs from "xstream"
import isolate from "@cycle/isolate"
import { TreatmentForm, treatmentLikeFilter } from "../components/TreatmentForm"
import { initSettings } from "../configuration.js"
import { makeTable, headTableLens, tailTableLens } from "../components/Table"
import { BinnedPlots, plotsLens } from "../components/BinnedPlots/BinnedPlots"
import { Filter, filterLens } from "../components/Filter"
import { loggerFactory } from "../utils/logger"
import {
  SampleTable,
  sampleTableLens,
} from "../components/SampleTable/SampleTable"

// Support for ghost mode
import { scenario } from "../scenarios/compoundScenario"
import { runScenario } from "../utils/scenario"

import dropRepeats from "xstream/extra/dropRepeats"
import { equals } from "ramda"

export default function GeneticWorkflow(sources) {
  const logger = loggerFactory(
    "genetic",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

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
    .startWith({ text: "Welcome to Genetic Perturbation Workflow", duration: 4000 })

  const formLens = {
    get: (state) => ({
      form: state.form,
      settings: {
        form: state.settings.form,
        api: state.settings.api,
        common: state.settings.common,
        geneAnnotations: state.settings.geneAnnotations,
        compoundAnnotations: state.settings.compoundAnnotations,
        treatmentLike: treatmentLikeFilter.GENETIC,
      },
      ui: (state.ui ?? {} ).form ?? {},
    }),
    set: (state, childState) => ({ ...state, form: childState.form }),
  }

  // Initialize if not yet done in parent (i.e. router) component (useful for testing)
  const defaultReducer$ = xs.of((prevState) => {
    // genetic -- defaultReducer
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

  // Use dropRepeats else the stream gets in an infinite loop
  const uiReducer$ = state$.compose(dropRepeats(equals))
  .map(state => 
    prevState => {
      const dirtyCheck = state.form.check.dirty
      const dirtySampleSelection = state.form.sampleSelection.dirty
      const dirtyFilter = state.filter.dirty
      return ({...prevState,
        ui: {
          form: {
            sampleSelection: {dirty: dirtyCheck },
            signature: {dirty: dirtyCheck || dirtySampleSelection },
          },
          plots: {dirty: dirtyCheck || dirtySampleSelection || dirtyFilter },
          headTable: {dirty: dirtyCheck || dirtySampleSelection || dirtyFilter },
          tailTable: {dirty: dirtyCheck || dirtySampleSelection || dirtyFilter },
        },
      })
    }
  )

  const TreatmentFormSink = isolate(TreatmentForm, { onion: formLens })(sources)
  const signature$ = TreatmentFormSink.output.remember()

  // Filter Form
  const filterForm = isolate(Filter, { onion: filterLens })({
    ...sources,
    input: signature$,
  })
  const filter$ = filterForm.output.remember()

  // const filter$ = xs.of({})
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
      TreatmentFormSink.DOM,
      filterForm.DOM,
      binnedPlots.DOM,
      headTable.DOM,
      tailTable.DOM
    )
    .map(([formDOM, filter, plots, headTable, tailTable]) =>
      div(".row .genetic", { style: { margin: "0px 0px 0px 0px" } }, [
        formDOM,
        div(".col .s10 .offset-s1", pageStyle, [
          div(".row", [filter]),
          div(".row", [plots]),
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
      TreatmentFormSink.log,
      filterForm.log,
      binnedPlots.log,
      headTable.log,
      tailTable.log
    ),
    DOM: vdom$.startWith(div()),
    onion: xs.merge(
      defaultReducer$,
      TreatmentFormSink.onion,
      binnedPlots.onion,
      filterForm.onion,
      headTable.onion,
      tailTable.onion,
      scenarioReducer$,
      uiReducer$,
    ),
    HTTP: xs.merge(
      TreatmentFormSink.HTTP,
      filterForm.HTTP,
      binnedPlots.HTTP,
      headTable.HTTP,
      tailTable.HTTP
    ),
    vega: binnedPlots.vega,
    popup: scenarioPopup$,
    modal: xs.merge(TreatmentFormSink.modal),
    ac: TreatmentFormSink.ac,
  }
}
