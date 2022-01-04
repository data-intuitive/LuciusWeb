import sampleCombine from "xstream/extra/sampleCombine"
import {
  div,
  label,
  input,
  table,
  tr,
  td,
  button,
  span,
  th,
  thead,
  tbody,
  p,
  i,
} from "@cycle/dom"
import { clone, equals, merge, sortWith, prop, ascend, descend } from "ramda"
import xs from "xstream"
import dropRepeats from "xstream/extra/dropRepeats"
import debounce from 'xstream/extra/debounce'
import { loggerFactory } from "../utils/logger"
import { TreatmentAnnotation } from "./TreatmentAnnotation"
import { safeModelToUi } from "../modelTranslations"
import { dirtyUiReducer, dirtyWrapperStream } from "../utils/ui"

const emptyData = {
  body: {
    result: {
      data: [],
    },
  },
}

const sampleSelectionLens = {
  get: (state) => ({
    core: typeof state.form !== "undefined" ? state.form.sampleSelection : {},
    settings: state.settings,
    ui: (state.ui??{}).sampleSelection ?? {dirty: false}, // Get state.ui.sampleSelection in a safe way or else get a default
  }),
  // get: state => ({core: state.form.sampleSelection, settings: state.settings}),
  set: (state, childState) => ({
    ...state,
    form: { ...state.form, sampleSelection: childState.core},
  }),
}

/**
 * Based on a (list of) treatment(s), get the samples that correspond to it and allow users to select them.
 *
 * input: treatment(s) (string)
 * output: list of samples (array)
 */
function SampleSelection(sources) {
  const treatmentAnnotations = TreatmentAnnotation(sources)

  const logger = loggerFactory(
    "sampleSelection",
    sources.onion.state$,
    "settings.form.debug"
  )

  const state$ = sources.onion.state$

  const input$ = sources.input
  // .startWith("BRD-K28907958") // REMOVE ME !!!

  // When the treatment should not be shown, including empty signature
  const isEmptyState = (state) => {
    if (typeof state.core === "undefined") {
      return true
    } else {
      if (typeof state.core.input === "undefined") {
        return true
      } else {
        if (state.core.input == "") {
          return true
        } else {
          return false
        }
      }
    }
  }

  const emptyState$ = state$
    // .filter(state => state.core.input == null || state.core.input == '')
    .filter((state) => isEmptyState(state))
    .compose(dropRepeats((x, y) => equals(x, y)))

  // When the state is cycled because of an internal update
  const modifiedState$ = state$
    // .filter(state => state.core.input != '')
    .filter((state) => !isEmptyState(state))
    .compose(dropRepeats((x, y) => equals(x, y)))

  const newInput$ = xs
    .combine(input$, state$)
    .map(([newinput, state]) => ({
      ...state,
      core: { ...state.core, input: newinput },
    }))
    .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

  // When a new query is required
  const updatedState$ = state$.compose(
    dropRepeats((x, y) => equals(x.core, y.core))
  )

  const request$ = newInput$.map((state) => {
    return {
      url:
        state.settings.api.url +
        "&classPath=com.dataintuitive.luciusapi.treatmentToPerturbations",
      method: "POST",
      send: {
        version: "v2",
        query: state.core.input,
        pvalue: state.settings.common.pvalue,
      },
      category: "samples",
    }
  })

  const response$ = sources.HTTP.select("samples")
    .map((response$) => response$.replaceError(() => xs.of(emptyData)))
    .flatten()

  const data$ = response$
    .map((res) => res.body)
    .map((json) => json.result.data)
    .remember()

  // Helper function for rendering the table, based on the state
  const makeTable = (state, annotation, initialization) => {
    const data = state.core.data
    const blurStyle = state.settings.common.blur
      ? {
          style: { filter: "blur(" + state.settings.common.amountBlur + "px)" },
        }
      : {}
    const selectedClass = (selected) =>
      selected ? ".black-text" : ".grey-text .text-lighten-2"

    const dataSortAscend = sortWith([
      ascend(prop(state.core.sort)),
    ]);
    const dataSortDescend = sortWith([
      descend(prop(state.core.sort)),
    ]);
    const sortedData = state.core.sort !== "" ?
      state.core.direction ? dataSortDescend(data) : dataSortAscend(data) :
      data

    let rows = sortedData.map((entry) => [
      td(".selection", { props: { id: entry.id } }, [
        label("", { props: { id: entry.id } }, [
          input(
            ".grey",
            { props: { type: "checkbox", checked: entry.use, id: entry.id } },
            "tt"
          ),
          span([""]),
        ]),
      ]),
      td(".treatmentPopup" + selectedClass(entry.use), blurStyle, entry.trt_id),
      td(
        selectedClass(entry.use),
        blurStyle,
        entry.trt_name.length > 20
          ? entry.trt_name.substring(0, 20) + "..."
          : entry.trt_name
      ),
      td(
        ".left-align" + selectedClass(entry.use),
        entry.id.length > 40 ? entry.id.substring(0, 40) + "..." : entry.id
      ),
      td(selectedClass(entry.use), entry.cell),
      td(selectedClass(entry.use),
          ((_) => {
            const dose = entry.dose !== "N/A" ? entry.dose + " " + entry.dose_unit : entry.dose
            return dose.length > 6 ? dose.substring(0, 6) + "..." : dose
          })()
      ),
      // td(selectedClass(entry.use), entry.batch),
      // td(selectedClass(entry.use), entry.year),
      td(selectedClass(entry.use), entry.time !== "N/A" ? entry.time + " " + entry.time_unit : entry.time),
      td(selectedClass(entry.use), entry.significantGenes),
    ])

    const sortableHeaderEntry = (id, text, state) =>
    {
      const currentSortId = state.core.sort
      const sortDirection = state.core.direction
      const hover = state.core.sortHover === id
      const loaded = state.core.data.length > 0

      const sortIcon = 
        id === currentSortId ?
          sortDirection ? "arrow_upward" : "arrow_downward" :
          hover ? "sort" : ""
      
      return th(
          button(
          ".btn-flat" + (loaded ? " .sortable" : ""),
          {
            style: {
              whiteSpace: "nowrap",
              "margin-bottom": "0px",
              "margin-top": "0px",
              "vertical-align": "middle",
            },
            props: {
              id: id,
            }
          },
          [
            span(
              {
                style: {
                  "vertical-align": "top",
                  fontSize: "1em",
                  fontWeight: "bold",
                  textTransform: "none",
                  paddingLeft: "1.5em",
                },
              },
              text
            ),
            i(".material-icons", {style: {width: "1.5em"}}, sortIcon)
          ]
        )
      )
    }

    const header = tr([
      sortableHeaderEntry("use", "Use?", state),
      sortableHeaderEntry("trt_id", safeModelToUi("id", state.settings.common.modelTranslations), state),
      sortableHeaderEntry("trt_name", "Name", state),
      sortableHeaderEntry("id", "Sample", state),
      sortableHeaderEntry("cell", "Cell", state),
      sortableHeaderEntry("dose", "Dose", state),
      sortableHeaderEntry("time", "Time", state),
      sortableHeaderEntry("significantGenes", "Sign. Genes", state),
    ])

    let body = []
    rows.map((row) => body.push(tr(row)))
    const tableContent = [thead([header]), tbody(body)]

    return div([
      div(".row", [
        div(".col .s10 .offset-s1 .l10 .offset-l1", [
          table(".striped .centered", tableContent),
        ]),
        annotation,
        div(".row .s6 .offset-s3", [
          initialization
            ? span([])
            : button(
                ".doSelect .btn .col .offset-s4 .s4 .orange .darken-2",
                "Select"
              ),
        ]),
      ]),
    ])
  }

  const initVdom$ = emptyState$.mapTo(div())

  const loadingVdom$ = request$
    .compose(sampleCombine(state$))
    .map(([_, state]) =>
      // Use the same makeTable function, pass a initialization=true parameter and a body DOM with preloading
      makeTable(
        state,
        div(".col.s10.offset-s1.l10.offset-l1", [
          div(
            ".progress.orange.lighten-3",
            { style: { margin: "2px 0px 2px 0px" } },
            [div(".indeterminate", { style: { "background-color": "white" } })]
          ),
        ]),
        true
      )
    )
    .remember()

  const loadedVdom$ = xs
    .combine(modifiedState$, treatmentAnnotations.DOM)
    .map(([state, annotation]) => makeTable(state, annotation, false))

  // Wrap component vdom with an extra div that handles being dirty
  const vdom$ = dirtyWrapperStream( state$, xs.merge(initVdom$, loadingVdom$, loadedVdom$))

  const dataReducer$ = data$.map((data) => (prevState) => {
    const newData = data.map((el) => merge(el, { use: true }))
    return {
      ...prevState,
      core: {
        ...prevState.core,
        data: newData,
        output: newData.filter((x) => x.use).map((x) => x.id),
      },
    }
  })

  const useClick$ = sources.DOM.select(".selection")
    .events("click", { preventDefault: true })
    .map((ev) => ev.ownerTarget.id)

  const aDown$ = sources.DOM.select("document")
    .events("keydown")
    .map((ev) => ev.code)
    .filter((code) => code == "AltLeft")
    .mapTo(true)
    .startWith(false)

  // A modifier stream
  const aUp$ = sources.DOM.select("document")
    .events("keyup")
    .map((ev) => ev.code)
    .filter((code) => code == "AltLeft")
    .mapTo(false)

  const a$ = xs.merge(aDown$, aUp$).compose(dropRepeats(equals)).startWith(false)

  const sortClick$ = sources.DOM.select(".sortable")
  .events("click")
  .map((ev) => ev.ownerTarget.id)
  .startWith("")

  const sortHover$ = sources.DOM.select(".sortable")
  .events("mouseenter")
  .map((ev) => ev.ownerTarget.id)
  .startWith("")

  const sortLeave$ = sources.DOM.select(".sortable")
  .events("mouseleave")
  .mapTo("")

  const selectReducer$ = useClick$
    .compose(sampleCombine(a$))
    .map(([id, a]) => (prevState) => {
      // a = false is the usual behavior
      if (!a) {
        const newData = prevState.core.data.map((el) => {
          // One sample object
          var newEl = clone(el)
          const switchUse = id === el.id
          newEl.use = switchUse ? !el.use : el.use
          // console.log(el)
          // console.log(newEl)
          return newEl
        })
        return {
          ...prevState,
          core: {
            ...prevState.core,
            data: newData,
            output: newData.filter((x) => x.use).map((x) => x.id),
          },
        }
      } else {
        const newData = prevState.core.data.map((el) => {
          // One sample object
          var newEl = clone(el)
          newEl.use = !el.use
          return newEl
        })
        return {
          ...prevState,
          core: {
            ...prevState.core,
            data: newData,
            output: newData.filter((x) => x.use).map((x) => x.id),
          },
        }
      }
    })

  const defaultReducer$ = xs.of((prevState) => ({
    ...prevState,
    core: { input: "", data: [] },
  }))
  const inputReducer$ = input$.map((i) => (prevState) => ({
    ...prevState,
    core: { ...prevState.core, input: i },
  }))
  const requestReducer$ = request$.map((req) => (prevState) => ({
    ...prevState,
    core: { ...prevState.core, request: req },
  }))

  const sortReducer$ = sortClick$.map((sort) => (prevState) => ({
    ...prevState,
    core: {
      ...prevState.core,
      sort: sort,
      direction: (sort != prevState.core.sort ? false : !prevState.core.direction)
    }
  }))

  const hoverReducer$ = xs.merge(sortHover$, sortLeave$)
    .map((hover) => (prevState) => ({
      ...prevState,
      core: {
        ...prevState.core,
        sortHover: hover,
      }
    }))


  const sampleSelection$ = xs
    .merge(
      sources.DOM.select(".doSelect").events("click"),
      // Ghost mode
      sources.onion.state$
        .map((state) => state.core.ghostoutput)
        .filter((ghost) => ghost)
        .compose(dropRepeats())
    )
    .compose(sampleCombine(state$))
    .map(([ev, state]) => state.core.output)

  // Logic and reducer stream that monitors if this component became dirty
  const dirtyReducer$ = dirtyUiReducer(sampleSelection$, state$.map(state => state.core.output))

  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    HTTP: xs.merge(request$, treatmentAnnotations.HTTP),
    onion: xs.merge(
      defaultReducer$,
      inputReducer$,
      requestReducer$,
      dataReducer$,
      selectReducer$,
      sortReducer$,
      hoverReducer$,
      dirtyReducer$,
    ),
    output: sampleSelection$,
    modal: treatmentAnnotations.modal,
  }
}

export { SampleSelection, sampleSelectionLens }
