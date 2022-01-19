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
import debounce from "xstream/extra/debounce"
import { equals } from "ramda"


/**
 * @module pages/GenericTreatmentWorkflow
 */

export default function GenericTreatmentWorkflow(sources) {

  // configuration of the generic treatment workflow, should be set by the calling page but provide defaults
  const workflow = (sources??{}).workflow ?? {}
  const workflowWelcomeText = workflow.welcomeText ?? "This is the generic treatment workflow template"
  const workflowMainDivClass = workflow.mainDivClass ?? ".row .generic"
  const workflowTreatmentType = workflow.treatmentType ?? treatmentLikeFilter.ALL
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

  /**
   * Lens to pass data from top level to TreatmentForm
   * @const formLens
   * @type {Lens}
   */
  const formLens = {
    get: (state) => ({
      form: state.form,
      settings: {
        form: state.settings.form,
        api: state.settings.api,
        common: state.settings.common,
        geneAnnotations: state.settings.geneAnnotations,
        treatmentAnnotations: state.settings.treatmentAnnotations,
        treatmentLike: workflowTreatmentType,
      },
      ui: (state.ui ?? {} ).form ?? {},
    }),
    set: (state, childState) => ({ ...state, form: childState.form }),
  }

  /**
   * Default reducer; initialize if not yet done in parent (i.e. router) component (useful for testing)
   * @const defaultReducer$
   * @type {Reducer}
   */
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

  const dirtyBusyStates$ = state$.map((state) => ({
    dirtyCheck: state.form.check.dirty,
    busySampleSelection: state.form.sampleSelection.busy,
    dirtySampleSelection: state.form.sampleSelection.dirty,
    busySignature: state.form.signature.busy,
    dirtyFilter: state.filter.dirty,
  }))
  .compose(dropRepeats(equals))
  .compose(debounce(10))

  /**
   * UI dirty logic, checks TreatmentCheck, SampleSelection, SignatureGenerator and Filter components if they are dirty or busy
   * If components are dirty/busy, enable UI dirty overlay in subsequent components.
   * 
   * Use dropRepeats else the stream gets in an infinite loop
   * @const uiReducer$
   * @type {Reducer}
   */
  const uiReducer$ = dirtyBusyStates$
  .map(state => 
    prevState => {
      return ({...prevState,
        ui: {
          form: {
            sampleSelection: {dirty: state.dirtyCheck },
            signature: {dirty: state.dirtyCheck || state.busySampleSelection || state.dirtySampleSelection },
          },
          headTable: {dirty: state.dirtyCheck || state.busySampleSelection || state.dirtySampleSelection || state.busySignature || state.dirtyFilter },
          tailTable: {dirty: state.dirtyCheck || state.busySampleSelection || state.dirtySampleSelection || state.busySignature || state.dirtyFilter },
          plots:     {dirty: state.dirtyCheck || state.busySampleSelection || state.dirtySampleSelection || state.busySignature || state.dirtyFilter },
        },
      })
    }
  )

  /**
   * Isolated TreatmentForm component/form, which contains TreatmentCheck, SampleSelection and SignatureGenerator
   * 
   * Outputs data to 'output'
   * @const TreatmentFormSink
   * @type {Isolated(Component)}
   */
  const TreatmentFormSink = isolate(TreatmentForm, { onion: formLens })(sources)

  /**
   * Memory stream from TreatmentFormSink output
   * @const signature$
   * @type {MemoryStream}
   */
  const signature$ = TreatmentFormSink.output.remember()

  /**
   * Isolated Filter component
   * 
   * Takes input data from 'input'
   * Outputs data to 'output'
   * @const filterForm
   * @type {Isolated(Component)}
   */
  const filterForm = isolate(Filter, { onion: filterLens })({
    ...sources,
    input: signature$,
  })

  /**
   * Memory stream from filter output
   * @const filter$
   * @type {MemoryStream}
   */
  const filter$ = filterForm.output.remember()

  /**
   * Setting of how to display the binned plots. Can be "before tables", "after tables", "no".
   * Pull setting into a separate stream to aid function in vdom combining
   * @const displayPlots$
   * @type {MemoryStream}
   */
  const displayPlots$ = state$
    .map((state) => state.settings.plots.displayPlots)
    .startWith("")
    .compose(dropRepeats(equals))
    .remember()

  /**
   * Isolated BinnedPlots component, containing 2 plots (similarity and histogram)
   * 
   * Takes input data from 'input'
   * 
   * Filter outputs if displayPlots$ is 'no' to prevent e.g. API calls when the graphs won't be displayed
   * Combine signature$ and filter$ into an object for the input stream
   * @const binnedPlots
   * @type {Isolated(Component)}
   */
  const binnedPlots = isolate(BinnedPlots, { onion: plotsLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$, displayPlots$)
      .filter(([s, f, d]) => d !== "no")
      .map(([s, f, _]) => ({ signature: s, filter: f }))
      .remember(),
  })

  /**
   * Wrap a table with a table name and an option bar with tsv, json, and amount of lines modifier buttons
   * Generic table for now, later will be refined to head table during isolation
   * 
   * Takes input data from 'input'
   * @const headTableContainer
   * @type {Component}
   */
  const headTableContainer = makeTable(SampleTable, sampleTableLens)

  /**
   * Wrap a table with a table name and an option bar with tsv, json, and amount of lines modifier buttons
   * Generic table for now, later will be refined to tail table during isolation
   * 
   * Takes input data from 'input'
   * @const tailTableContainer
   * @type {Component}
   */
  const tailTableContainer = makeTable(SampleTable, sampleTableLens)

  /**
   * Isolated table for top entries
   * Add signature$ and filter$ into input stream
   * 
   * Takes input data from 'input'
   * Combine signature$ and filter$ into an object for the input stream
   * @const headTable
   * @type {Isolated(Component)}
   */
  const headTable = isolate(headTableContainer, { onion: headTableLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$)
      .map(([s, f]) => ({ query: s, filter: f }))
      .remember(),
  })

  /**
   * Isolated table for bottom entries
   * Add signature$ and filter$ into input stream
   * 
   * Takes input data from 'input'
   * Combine signature$ and filter$ into an object for the input stream
   * @const headTable
   * @type {Isolated(Component)}
   */
  const tailTable = isolate(tailTableContainer, { onion: tailTableLens })({
    ...sources,
    input: xs
      .combine(signature$, filter$)
      .map(([s, f]) => ({ query: s, filter: f }))
      .remember(),
  })

  /**
   * Style object used in div capsulating filter, displayPlots and tables
   * @const pageStyle
   * @type {object}
   */
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
      div(workflowMainDivClass /* something like ".row .genetic" */ , { style: { margin: "0px 0px 0px 0px" } }, [
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
