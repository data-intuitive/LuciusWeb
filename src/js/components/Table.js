import xs from "xstream"
import sampleCombine from "xstream/extra/sampleCombine"
import {
  a,
  h,
  p,
  div,
  br,
  label,
  input,
  code,
  table,
  tr,
  td,
  b,
  h2,
  button,
  svg,
  h5,
  th,
  thead,
  tbody,
  i,
  span,
  ul,
  li,
} from "@cycle/dom"
import { log } from "../utils/logger"
import { ENTER_KEYCODE } from "../utils/keycodes.js"
import {
  keys,
  values,
  filter,
  head,
  equals,
  map,
  prop,
  clone,
  omit,
  merge,
  intersection,
  difference,
} from "ramda"
// import { tableContent, tableContentLens } from './tableContent/tableContent'
import isolate from "@cycle/isolate"
import dropRepeats from "xstream/extra/dropRepeats"
import { loggerFactory } from "../utils/logger"
import { convertToCSV } from "../utils/export"
import delay from "xstream/extra/delay"
import debounce from "xstream/extra/debounce"

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const headTableLens = {
  get: (state) => ({
    core: state.headTable,
    settings: {
      table: state.settings.headTable,
      api: state.settings.api,
      common: state.settings.common,
      sourire: state.settings.sourire,
      filter: state.settings.filter,
    },
  }),
  set: (state, childState) => ({
    ...state,
    headTable: childState.core,
    settings: { ...state.settings, headTable: childState.settings.table },
  }),
}

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const tailTableLens = {
  get: (state) => ({
    core: state.tailTable,
    settings: {
      table: state.settings.tailTable,
      api: state.settings.api,
      common: state.settings.common,
      sourire: state.settings.sourire,
      filter: state.settings.filter,
    },
  }),
  set: (state, childState) => ({
    ...state,
    tailTable: childState.core,
    settings: { ...state.settings, tailTable: childState.settings.table },
  }),
}

// Granular access to the settings
// We _copy_ the results array to the root of this element's scope.
// This makes it easier to apply fixed scope later in the process
const compoundContainerTableLens = {
  get: (state) => ({
    core: state.compoundTable,
    settings: {
      table: state.settings.compoundTable,
      api: state.settings.api,
      common: state.settings.common,
      sourire: state.settings.sourire,
      filter: state.settings.filter,
    },
  }),
  set: (state, childState) => ({
    ...state,
    compoundTable: childState.core,
    settings: { ...state.settings, compoundTable: childState.settings.table },
  }),
}

function makeTable(tableComponent, tableLens, scope = "scope1") {
  /**
   * This is a general table container: a post query is sent to the endpoint (configured via settings).
   * The resulting array is stored in the state and a dedicated component with onion scope is used to render the effective table.
   *
   * In other words, for what we use it, query can be either a signature or a (list of) known/predicted target(s).
   *
   * The lens that defines the rendering of the data is injected using the makeTable function.
   */
  return function Table(sources) {
    const logger = loggerFactory(
      "table",
      sources.onion.state$,
      "settings.table.debug"
    )

    const state$ = sources.onion.state$

    // Input handling
    const input$ = xs.merge(
      sources.input
      // Ghost mode
      // state$.map(state => state.core.input).compose(dropRepeats(equals))
    )

    const modifiedState$ = state$
      .filter((state) => !isEmptyState(state))
      .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    const newInput$ = xs
      .combine(input$, modifiedState$)
      .map(([newInput, state]) => ({
        ...state,
        core: { ...state.core, input: newInput },
      }))
      .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    // When the component should not be shown, including empty query
    const isEmptyState = (state) => {
      if (typeof state.core === "undefined") {
        return true
      } else {
        if (typeof state.core.input === "undefined") {
          return true
        } else {
          // XXX
          if (state.core.input.query === "") {
            return true
          } else {
            return false
          }
        }
      }
    }

    // Split off properties in separate stream to make life easier in simple subcomponents
    // Be aware: this is required to be a memory stream!!!
    const props$ = state$
      .filter((state) => !isEmptyState(state))
      .map((state) => state.settings)
      .compose(dropRepeats(equals))
      .remember()

    const settings$ = state$
      .map((state) => state.settings)
      .compose(dropRepeats(equals)) // Avoid updates to vdom$ when no real change

    const expandOptions$ = state$
      .map((state) => state.core.expandOptions)
      .compose(dropRepeats(equals)) // Avoid updates to vdom$ when no real change

    const emptyState$ = state$.filter((state) => isEmptyState(state))

    const plus5$ = sources.DOM.select(".plus5")
      .events("click")
      .mapTo(5)
      .startWith(0)
      .fold((x, y) => x + y, 0)
    const min5$ = sources.DOM.select(".min5")
      .events("click")
      .mapTo(5)
      .startWith(0)
      .fold((x, y) => x + y, 0)
    const plus10$ = sources.DOM.select(".plus10")
      .events("click")
      .mapTo(10)
      .startWith(0)
      .fold((x, y) => x + y, 0)
    const min10$ = sources.DOM.select(".min10")
      .events("click")
      .mapTo(10)
      .startWith(0)
      .fold((x, y) => x + y, 0)

    // ========================================================================

    const triggerRequest$ = xs
      .combine(newInput$, plus5$, min5$, plus10$, min10$)
      .map(([state, plus5, min5, plus10, min10]) => {
        const tableType = state.settings.table.type
        const cnt =
          parseInt(state.settings.table.count) + plus5 - min5 + plus10 - min10
        // Set a limit on the results depending on the type of table:
        return tableType == "compoundTable"
          ? { ...state, core: { ...state.core, count: { limit: cnt } } }
          : tableType == "topTable"
          ? { ...state, core: { ...state.core, count: { head: cnt } } }
          : { ...state, core: { ...state.core, count: { tail: cnt } } }
      })
      .compose(dropRepeats((x, y) => equals(x.core, y.core)))
      .filter((state) => state.core.input.query)

    const request$ = triggerRequest$.map((state) => ({
      send: merge(state.core.count, {
        query: state.core.input.query,
        version: "v2",
        // filter: (typeof state.core.input.filter !== 'undefined') ? state.core.input.filter : '',
        filter: state.core.input.filter,
      }),
      method: "POST",
      url:
        state.settings.api.url +
        "&classPath=com.dataintuitive.luciusapi." +
        state.settings.table.apiClass,
      category: "table",
    }))

    const response$$ = sources.HTTP.select("table")

    const invalidResponse$ = response$$
      .map(
        (response$) =>
          response$
            .filter((response) => false) // ignore regular event
            .replaceError((error) => xs.of(error)) // emit error
      )
      .flatten()

    const validResponse$ = response$$
      .map((response$) => response$.replaceError((error) => xs.empty()))
      .flatten()

    // ========================================================================

    const data$ = validResponse$.map((result) => result.body.result.data)

    // Convert to TSV and JSON
    const csvData$ = data$
      .map((data) => convertToCSV(data))
      .map((csv) => "text/tsv;charset=utf-8," + encodeURIComponent(csv))
    const jsonData$ = data$.map(
      (json) =>
        "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json))
    )

    const datas$ = xs.combine(data$, csvData$, jsonData$)

    // ========================================================================

    // Table with samples/compounds -- depending on the tableComponent
    const tableContent = isolate(tableComponent, {
      onion: tableLens,
      "*": scope,
    })({ ...sources, props: props$ })

    const chipStyle = {
      style: {
        fontWeight: "lighter",
        color: "rgba(255, 255, 255, 0.5)",
        "background-color": "rgba(0, 0, 0, 0.2)",
      },
    }

    const filterDom$ = modifiedState$
      .compose(
        dropRepeats((x, y) => equals(x.core.input.filter, y.core.input.filter))
      )
      .map((state) => {
        let filterKeys = keys(state.core.input.filter)
        // Derive some relevant information and store it in an object
        let filterDiffs = map(
          (key) => ({
            key: key,
            selectedValues: prop(key, state.core.input.filter),
            possibleValues: prop(key, state.settings.filter.values),
            intersection: intersection(
              prop(key, state.core.input.filter),
              prop(key, state.settings.filter.values)
            ),
            difference: difference(
              prop(key, state.settings.filter.values),
              prop(key, state.core.input.filter)
            ),
            half:
              prop(key, state.settings.filter.values).length / 2 -
                prop(key, state.core.input.filter).length <
              0,
          }),
          filterKeys
        )
        // Only show filters if something is filtered, so no filter if all or none of the options are selected !
        const nonEmptyFilters = filter(
          (filter) =>
            !(filter.intersection.length == filter.possibleValues.length) &&
            !(filter.selectedValues.length == 0),
          filterDiffs
        ).map((filter) => ({ ...filter, values: filter.selectedValues }))
        let divs = map(
          (filter) =>
            div(
              ".chip",
              chipStyle,
              filter.half
                ? [
                    filter.key + "s excluded",
                    ": ",
                    filter.difference.join(", "),
                  ]
                : [filter.key + "s included", ": ", filter.values.join(", ")]
            ),
          nonEmptyFilters
        )
        return divs
      })
      .startWith([])

    const smallBtnStyle = (bgcolor) => ({
      style: {
        "margin-bottom": "0px",
        "margin-top": "0px",
        "background-color": bgcolor,
        color: "white",
        opacity: 0.8,
        fontWeight: "lighter",
        fontSize: "16px",
        "vertical-align": "middle",
      },
    })

    // ========================================================================

    const initVdom$ = emptyState$.mapTo(div())

    const loadingVdom$ = request$
      .compose(sampleCombine(filterDom$, modifiedState$))
      .map(([r, filterText, state]) =>
        div([
          div(
            ".row .valign-wrapper",
            {
              style: {
                "margin-bottom": "0px",
                "padding-top": "5px",
                "background-color": state.settings.table.color,
                opacity: 0.5,
              },
            },
            [
              h5(".white-text .col .s5 .valign", state.settings.table.title),
              div(".white-text .col .s7 .valign .right-align", filterText),
            ]
          ),
          div(".progress ", { style: { margin: "2px 0px 2px 0px" } }, [
            div(".indeterminate"),
          ]),
        ])
      )
      .remember()

    const loadedVdom$ = xs
      .combine(
        tableContent.DOM,
        expandOptions$,
        settings$,
        csvData$,
        jsonData$,
        filterDom$
      )
      .map(([dom, expandOptions, settings, csvData, jsonData, filterText]) =>
        div([
          div(".pagebreak", []),
          div(
            ".row .valign-wrapper .switch",
            {
              style: {
                "margin-bottom": "0px",
                "padding-top": "5px",
                "background-color": settings.table.color,
              },
            },
            [
              h5(".white-text .col", [
                settings.table.title,
                span([" "]),
                i(
                  ".material-icons .grey-text",
                  {
                    style: {
                      fontSize: "16px",
                      "background-color": settings.table.color,
                      opacity: 0.5,
                    },
                  },
                  "add"
                ),
              ]),
              div(".white-text .col .s7 .valign .right-align", filterText),
            ]
          ),
          div(
            ".row .valign-wrapper",
            {
              style: {
                "margin-bottom": "0px",
                "padding-top": "0px",
                "background-color": settings.table.color,
                opacity: 0.8,
              },
            },
            [
              expandOptions
                ? div([
                    button(
                      ".btn-flat .waves-effect .waves-light",
                      smallBtnStyle(settings.table.color),
                      [
                        a(
                          "",
                          {
                            style: { color: "white" },
                            props: {
                              href: "data:" + csvData,
                              download: "table.tsv",
                            },
                          },
                          [
                            span(
                              {
                                style: {
                                  "vertical-align": "top",
                                  fontSize: "8px",
                                },
                              },
                              "tsv"
                            ),
                            i(".material-icons", "file_download"),
                          ]
                        ),
                      ]
                    ),
                    button(
                      ".btn-flat .waves-effect .waves-light",
                      smallBtnStyle(settings.table.color),
                      [
                        a(
                          "",
                          {
                            style: { color: "white" },
                            props: {
                              href: "data:" + jsonData,
                              download: "table.json",
                            },
                          },
                          [
                            span(
                              {
                                style: {
                                  "vertical-align": "top",
                                  fontSize: "8px",
                                },
                              },
                              "json"
                            ),
                            i(".material-icons", "file_download"),
                          ]
                        ),
                      ]
                    ),
                    button(
                      ".min10 .btn-flat .waves-effect .waves-light",
                      smallBtnStyle(settings.table.color),
                      [
                        span(
                          {
                            style: {
                              "vertical-align": "top",
                              fontSize: "10px",
                            },
                          },
                          "-10"
                        ),
                        i(".material-icons", "fast_rewind"),
                      ]
                    ),
                    button(
                      ".min5 .btn-flat .waves-effect .waves-light",
                      smallBtnStyle(settings.table.color),
                      [
                        span(
                          {
                            style: {
                              "vertical-align": "top",
                              fontSize: "10px",
                            },
                          },
                          "-5"
                        ),
                        i(".material-icons", "fast_rewind"),
                      ]
                    ),
                    button(
                      ".plus5 .btn-flat .waves-effect .waves-light",
                      smallBtnStyle(settings.table.color),
                      [
                        span(
                          {
                            style: {
                              "vertical-align": "top",
                              fontSize: "10px",
                            },
                          },
                          "+5"
                        ),
                        i(".material-icons", "fast_forward"),
                      ]
                    ),
                    button(
                      ".plus10 .btn-flat .waves-effect .waves-light",
                      smallBtnStyle(settings.table.color),
                      [
                        span(
                          {
                            style: {
                              "vertical-align": "top",
                              fontSize: "10px",
                            },
                          },
                          "+10"
                        ),
                        i(".material-icons", "fast_forward"),
                      ]
                    ),
                  ])
                : div(),
            ]
          ),
          div(
            ".row",
            { style: { "margin-bottom": "0px", "margin-top": "0px" } },
            [dom]
          ),
        ])
      )

    const errorVdom$ = invalidResponse$.mapTo(
      div(".red .white-text", [p("An error occured !!!")])
    )

    const vdom$ = xs.merge(initVdom$, errorVdom$, loadingVdom$.remember(), loadedVdom$)

    // ========================================================================

    // Default Reducer
    const defaultReducer$ = xs
      .of(function defaultReducer(prevState) {
        if (typeof prevState === "undefined") {
          return ({ })
        } else {
          return prevState
        }
      })

    // Add input to state
    const inputReducer$ = input$
      .map((i) => (prevState) =>
        // inputReducer
        ({ ...prevState, core: { ...prevState.core, input: i } })
      )

    // Add request body to state
    const requestReducer$ = request$.map((req) => (prevState) => ({
      ...prevState,
      core: { ...prevState.core, request: req },
    }))

    // Data reducer
    const dataReducer$ = data$
      .map((newData) => (prevState) => ({
        ...prevState,
        core: { ...prevState.core, data: newData },
      }))

    // Reducer for opening and closing option drawer
    const switchReducer$ = sources.DOM.select(".switch")
      .events("click")
      .fold((x, y) => !x, false)
      .map((yesorno) => (prevState) => ({
        ...prevState,
        core: { ...prevState.core, expandOptions: yesorno },
      }))

    return {
      DOM: vdom$,
      HTTP: request$,
      onion: xs.merge(
        defaultReducer$,
        inputReducer$,
        requestReducer$,
        dataReducer$,
        switchReducer$
      ),
      log: xs.merge(
        logger(modifiedState$, "state$")
      ),
    }
  }
}

export { makeTable, headTableLens, tailTableLens, compoundContainerTableLens }
