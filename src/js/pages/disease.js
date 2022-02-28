import { div } from "@cycle/dom"
import xs from "xstream"
import isolate from "@cycle/isolate"
import dropRepeats from "xstream/extra/dropRepeats"
import { equals } from "ramda"

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

  /**
   * UI dirty logic, checks SignatureForm and Filter components if they are dirty or busy
   * If components are dirty/busy, enable UI dirty overlay in subsequent components.
   * 
   * Use dropRepeats else the stream gets in an infinite loop
   * @const uiReducer$
   * @type {Reducer}
   */
   const uiReducer$ = state$.compose(dropRepeats(equals))
   .map(state => 
     prevState => {
       const dirtyForm = state.form.dirty
       const dirtyFilter = state.filter.dirty
       return ({...prevState,
         ui: {
           headTable: {dirty: dirtyForm || dirtyFilter },
           tailTable: {dirty: dirtyForm || dirtyFilter },
           plots:     {dirty: dirtyForm || dirtyFilter },
         },
       })
     }
   )

  // Filter Form
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
      signatureForm.DOM,
      filterForm.DOM,
      binnedPlots.DOM,
      headTable.DOM,
      tailTable.DOM,
      displayPlots$,
      // feedback$
    )
    .map(
      ([
        form,
        filter,
        plots,
        headTable,
        tailTable,
	displayPlots,
        // feedback
      ]) =>
        div(".row .disease", { style: { margin: "0px 0px 0px 0px" } }, [
          form,
          div(".col .s10 .offset-s1", pageStyle, [
            div(".row", [filter]),
            div(".row", [displayPlots === "before tables" ? plots : div()]),
            div(".row", []),
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
      scenarioReducer$,
      uiReducer$,
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
