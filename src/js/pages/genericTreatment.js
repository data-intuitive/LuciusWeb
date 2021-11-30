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
import { scenario } from "../scenarios/treatmentScenario"
import { runScenario } from "../utils/scenario"

import dropRepeats from "xstream/extra/dropRepeats"
import { equals } from "ramda"

export default function GenericTreatmentWorkflow(sources) {

  // configuration of the generic treatment workflow, should be set by the calling page but provide defaults
  const workflow = (sources??{}).workflow ?? {}
  const workflowWelcomeText = workflow.welcomeText ?? "This is the generic treatment workflow template"
  const workflowMainDivClass = workflow.mainDivClass ?? ".row .generic"
  const workflowTreatmentType = workflow.treatmentType ?? treatmentLikeFilter.COMPOUND_AND_GENETIC
  const workflowLoggerName = workflow.loggerName ?? "generic"
  const workflowGhostModeScenarioSelector = workflow.ghostModeScenarioSelector ?? ((state) => state.settings.common.ghost.genetic)

  const logger = loggerFactory(
    workflowLoggerName,
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

  // Scenario for ghost mode
  const scenarios$ = sources.onion.state$
    .take(1)
    .filter((state) => state.settings.common.ghostMode)
    .map(state => runScenario(scenario( workflowGhostModeScenarioSelector(state) )))
  const scenarioReducer$ = scenarios$.map(s => s.scenarioReducer$)
    .flatten()
  const scenarioPopup$ = scenarios$.map(s => s.scenarioPopup$)
    .flatten()
    .startWith({ text: workflowWelcomeText, duration: 4000 })

  const formLens = {
    get: (state) => ({
      form: state.form,
      settings: {
        form: state.settings.form,
        api: state.settings.api,
        common: state.settings.common,
        geneAnnotations: state.settings.geneAnnotations,
        compoundAnnotations: state.settings.compoundAnnotations,
        treatmentLike: workflowTreatmentType,
      },
      ui: (state.ui ?? {} ).form ?? {},
    }),
    set: (state, childState) => ({ ...state, form: childState.form }),
  }

  // Initialize if not yet done in parent (i.e. router) component (useful for testing)
  const defaultReducer$ = xs.of((prevState) => {
    // defaultReducer
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
      const busySignature = state.form.signature.busy
      const dirtyFilter = state.filter.dirty
      return ({...prevState,
        ui: {
          form: {
            sampleSelection: {dirty: dirtyCheck },
            signature: {dirty: dirtyCheck || dirtySampleSelection },
          },
          headTable: {dirty: dirtyCheck || dirtySampleSelection || busySignature || dirtyFilter },
          tailTable: {dirty: dirtyCheck || dirtySampleSelection || busySignature || dirtyFilter },
          plots:     {dirty: dirtyCheck || dirtySampleSelection || busySignature || dirtyFilter },
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

  // setting of how to display the binned plots. Can be "before tables", "after tables", "no"
  // pull setting into a separate stream to aid function in vdom combining
  const displayPlots$ = state$
    .map((state) => state.settings.plots.displayPlots)
    .startWith("")
    .compose(dropRepeats(equals))
    .remember()

  // Binned Plots Component
  const binnedPlots = isolate(BinnedPlots, { onion: plotsLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$, displayPlots$)
      .filter(([s, f, d]) => d !== "no")
      .map(([s, f, _]) => ({ signature: s, filter: f }))
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
      tailTable.DOM,
      displayPlots$,
    )
    .map(([formDOM, filter, plots, headTable, tailTable, displayPlots]) =>
      div(workflowMainDivClass, { style: { margin: "0px 0px 0px 0px" } }, [
        formDOM,
        div(".col .s10 .offset-s1", pageStyle, [
          div(".row", [filter]),
          div(".row", [displayPlots === "before tables" ? plots : div()]),
          div(".col .s12", [headTable]),
          div(".row", []),
          div(".col .s12", [tailTable]),
          div(".row", []),
          div(".row", [displayPlots === "after tables" ? plots : div()]),
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
