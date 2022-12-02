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
  filter,
  equals,
  map,
  prop,
  mergeRight,
  intersection,
  difference,
  max,
} from "ramda"
// import { tableContent, tableContentLens } from './tableContent/tableContent'
import isolate from "@cycle/isolate"
import dropRepeats from "xstream/extra/dropRepeats"
import { loggerFactory } from "../utils/logger"
import { convertToCSV } from "../utils/export"
import delay from "xstream/extra/delay"
import pairwise from "xstream/extra/pairwise"
import { dirtyWrapperStream } from "../utils/ui"

/**
 * @module components/Table
 */

/**
 * Lens for head/top table
 *
 * Granular access to the settings
 * We _copy_ the results array to the root of this element's scope.
 * This makes it easier to apply fixed scope later in the process
 *
 * @const headTableLens
 * @type {Lens}
 */
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
    ui: state.ui?.headTable ?? {dirty: false}, // Get state.ui.headTable in a safe way or else get a default
    numEntries: state.routerInformation?.params?.numTableHead,
  }),
  set: (state, childState) => {
    // don't add value of numEntres to the pageState if it is the default value
    const numEntries = childState.core.numEntries == parseInt(childState.settings.table.count) ? undefined : childState.core.numEntries
    return {
    ...state,
    headTable: childState.core,
    settings: { ...state.settings, headTable: childState.settings.table },
    routerInformation: {
      ...state.routerInformation,
      pageState: {
        ...state.routerInformation.pageState,
        numTableHead: numEntries,
      }
    }
  }},
}

/**
 * Lens for tail/bottom table
 *
 * Granular access to the settings
 * We _copy_ the results array to the root of this element's scope.
 * This makes it easier to apply fixed scope later in the process
 *
 * @const tailTableLens
 * @type {Lens}
 */
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
    ui: state.ui?.tailTable ?? {dirty: false}, // Get state.ui.tailTable in a safe way or else get a default
    numEntries: state.routerInformation?.params?.numTableTail,
  }),
  set: (state, childState) => {
    // don't add value of numEntres to the pageState if it is the default value
    const numEntries = childState.core.numEntries == parseInt(childState.settings.table.count) ? undefined : childState.core.numEntries
    return {
    ...state,
    tailTable: childState.core,
    settings: { ...state.settings, tailTable: childState.settings.table },
    routerInformation: {
      ...state.routerInformation,
      pageState: {
        ...state.routerInformation.pageState,
        numTableTail: numEntries,
      }
    }
  }},
}

/**
 * Lens for compound container table
 *
 * Granular access to the settings
 * We _copy_ the results array to the root of this element's scope.
 * This makes it easier to apply fixed scope later in the process
 *
 * @const compoundContainerTableLens
 * @type {Lens}
 */
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
    ui: state.ui?.compoundTable ?? {dirty: false}, // Get state.ui.compoundTable in a safe way or else get a default
  }),
  set: (state, childState) => ({
    ...state,
    compoundTable: childState.core,
    settings: { ...state.settings, compoundTable: childState.settings.table },
  }),
}

/**
 * Wrapper for the inner Table function. Needed as we need to pass a function into 'isolate' when isolating components
 *
 * Returns a function that wraps a title and options bar around a standard table and the lens passed as parameters
 *
 * @function makeTable
 * @param {Component} tableComponent Inner table component
 * @param {Lens} tableLens Lens used in the inner table component
 * @param {*} scope
 * @returns a component getter function
 */
function makeTable(tableComponent, tableLens, scope = "scope1") {
  /**
   * This is a general table container: a post query is sent to the endpoint (configured via settings).
   * The resulting array is stored in the state and a dedicated component with onion scope is used to render the effective table.
   *
   * In other words, for what we use it, query can be either a signature or a (list of) known/predicted target(s).
   *
   * The lens that defines the rendering of the data is injected using the makeTable function.
   * @function makeTable/Table
   * @param {*} sources
   *          - onion.state$: default onion atom containing the input data
   *          - input: trigger data from the previous component
   *          - HTTP: HTTP responses stream
   *          - DOM: user click events
   *          - props: settings for e.g. background and foreground colors
   * @returns a component containing a table with a title and option bar
   */
  return function Table(sources) {
    const logger = loggerFactory(
      "table",
      sources.state.stream,
      "settings.table.debug"
    )

    const state$ = sources.state.stream

    // Input handling
    const input$ = xs.merge(
      sources.input
      // Ghost mode
      // state$.map(state => state.core.input).compose(dropRepeats(equals))
    )

    // TODO: modifiedState$, newInput$ and inputReducer$ should be reworked together
    // modifiedState$ triggers on input changes from inputReducer$
    // newInput adds input to state and then also triggers on input changes, but sets the input value itself instead of using inputReducer
    // The code would be clearer if either the input stream is kept separate and just use state, or input is added to state and is then used together

    /**
     * Provides a stream that only updates when state.core.input is not empty and changes occurred
     * @const makeTable/Table/modifierState$
     * @type {Stream}
     */
    const modifiedState$ = state$
      .filter((state) => !isEmptyState(state))
      .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    /**
     * Provides a stream that updates when state.core.input is updated or there is a new input
     * Combines the default onion atom with the extra input stream
     * @const makeTable/Table/newInput$
     * @type {Stream}
     */
    const newInput$ = xs
      .combine(input$, modifiedState$)
      .map(([newInput, state]) => ({
        ...state,
        core: { ...state.core, input: newInput },
      }))
      .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    /**
     * When the component should not be shown, including empty query
     * @function makeTable/Table/isEmptyState
     * @param {*} state default onion atom containing the input data
     * @returns {boolean} state.core.input is empty or undefined
     */
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

    /**
     * Split off settings in separate stream to make life easier in simple subcomponents
     * This is required to be a memory stream!
     * @const makeTable/Table/props$
     * @type {MemoryStream}
     */
    const props$ = state$
      .filter((state) => !isEmptyState(state))
      .map((state) => state.settings)
      .compose(dropRepeats(equals))
      .remember()

    /**
     * Split of settings in a separate stream to drop irrelevant state updates
     * Drops repeats to avoid updates to vdom$ when there is no real change
     * @const makeTable/Table/settings$
     * @type {Stream}
     */
    const settings$ = state$
      .map((state) => state.settings)
      .compose(dropRepeats(equals))

    /**
     * Stream of boolean whether the options bar is currently expanded or not
     * Drops repeats to avoid updates to vdom$ when there is no real change
     * @const makeTable/Table/expandOptions$
     * @type {Stream}
     */
    const expandOptions$ = state$
      .map((state) => state.core?.expandOptions)
      .compose(dropRepeats(equals))

    /**
     * State stream that only updates when state.core.input.query is empty or undefined
     * @const makeTable/Table/emptyState$
     * @type {Stream}
     */
    const emptyState$ = state$.filter((state) => isEmptyState(state))

    /**
     * Stream of user events when the +5 button is pressed
     * @const makeTable/Table/plus5$
     * @type {Stream}
     */
    const plus5$ = sources.DOM.select(".plus5")
      .events("click")
      .mapTo(5)
      .startWith(0)

    /**
     * Stream of user events when the -5 button is pressed
     * @const makeTable/Table/min5$
     * @type {Stream}
     */
    const min5$ = sources.DOM.select(".min5")
      .events("click")
      .mapTo(-5)
      .startWith(0)

    /**
     * Stream of user events when the +10 button is pressed
     * @const makeTable/Table/plus10$
     * @type {Stream}
     */
    const plus10$ = sources.DOM.select(".plus10")
      .events("click")
      .mapTo(10)
      .startWith(0)

    /**
     * Stream of user events when the -10 button is pressed
     * @const makeTable/Table/min10$
     * @type {Stream}
     */
    const min10$ = sources.DOM.select(".min10")
      .events("click")
      .mapTo(-10)
      .startWith(0)

    /**
     * Only take the difference of the default value compared to old value
     *
     * Prevent state changes adding the default value in the accumulator.
     * Needs to have previous and new value and take difference. Simple accumulator with fold would cycle between zero and new value.
     *
     * Desired behaviour
     *                acc   newInput    output
     * initial        0     5           5
     * first update   5     5           0
     * second update  5     5           0
     *
     * Highlight why .fold((acc, newValue) => newValue - acc, 0) doesn't work:
     *                acc   newInput    output
     * initial        0     5           5
     * first update   5     5           0
     * second update  0     5           5
     *
     * pairwise gives us previous and new value but need to make sure that if we only receive 1 value we do get an output, so use .startWith(0)
     * 
     * If a value for the amount of entries was passed through the search query, use that as default, otherwise use the standard default setting
     *
     * @const makeTable/Table/defaultAmountToDisplay$
     * @type {Stream}
     */
    const defaultAmountToDisplay$ = xs.combine(
      state$.map(state => parseInt(state.settings.table.count)),
      state$.map(state => state.numEntries),
    )
    .map(([default_, searchQuery]) => (isNaN(searchQuery) ? default_ : searchQuery))
      .compose(dropRepeats(equals))
      .startWith(0)
      .compose(pairwise)
      .map((v) => (v[1] - v[0]))

    /**
     * Merge all + and - buttons with default value
     * Default value needs to be in the accumulator otherwise we can't reduce the amount of lines less than the default setting
     * By folding & limiting the value here we prevent (hidden) negative numbers that the user would have to increase before seeing changes again
     *
     * @const makeTable/Table/amountToDisplay
     * @type {Stream}
     */
    const amountToDisplay$ = xs
      .merge(defaultAmountToDisplay$, plus5$, min5$, plus10$, min10$)
      .fold((x, y) => max(0, x + y), 0)

    // ========================================================================

    const triggerRequest$ = xs
      .combine(newInput$, amountToDisplay$)
      .map(([state, amountToDisplay]) => {
        const tableType = state.settings.table.type
        const cnt = max(1, amountToDisplay)
        // Set a limit on the results depending on the type of table:
        return tableType == "compoundTable"
          ? { ...state, core: { ...state.core, count: { limit: cnt } } }
          : tableType == "topTable"
          ? { ...state, core: { ...state.core, count: { head: cnt } } }
          : { ...state, core: { ...state.core, count: { tail: cnt } } }
      })
      .compose(dropRepeats((x, y) => equals(x.core, y.core)))
      .filter((state) => state.core.input.query)

    
    /**
     * Makes a HTTP request to the API
     * @const makeTable/Table/request$
     * @type {Stream}
     */
    const request$ = triggerRequest$.map((state) => ({
      send: mergeRight(state.core.count, {
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

    /**
     * Get HTTP answer of the HTTP request made to the API
     * Is stream of streams
     * @const makeTable/Table/response$$
     * @type {Stream}
     */
    const response$$ = sources.HTTP.select("table")

    /**
     * Split off invalid responses from the HTTP answers and create a stream of errors
     * @const makeTable/Table/invalidResponse$
     * @type {Stream}
     */
    const invalidResponse$ = response$$
      .map(
        (response$) =>
          response$
            .filter((response) => false) // ignore regular event
            .replaceError((error) => xs.of(error)) // emit error
      )
      .flatten()

    /**
     * Split off valid responses from the HTTP answers and create a stream of valid responses
     * @const makeTable/Table/validResponse$
     * @type {Stream}
     */
    const validResponse$ = response$$
      .map((response$) => response$.replaceError((error) => xs.empty()))
      .flatten()

    // ========================================================================

    /**
     * Create stream of valid data received from the API
     * @const makeTable/Table/data$
     * @type {Stream}
     */
    const data$ = validResponse$
      .map((result) => result.body.result.data)
      .map((data) => data ?? [])

    /**
     * Stream of table data converted into TSV format
     * @const makeTable/Table/csvData$
     * @type {Stream}
     */
    const csvData$ = data$
      .map((data) => convertToCSV(data))
      .map((csv) => "text/tsv;charset=utf-8," + encodeURIComponent(csv))
    /**
     * Stream of table data converted into JSON
     * @const makeTable/Table/jsonData$
     * @type {Stream}
     */
    const jsonData$ = data$.map(
      (json) =>
        "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json))
    )

    //const datas$ = xs.combine(data$, csvData$, jsonData$)

    // ========================================================================

    /**
     * Table with samples/compounds -- depending on the tableComponent
     *
     * Additionally pass settings into a separate props stream into the component
     * @const makeTable/Table/tableContent
     * @type {Isolated(Component)}
     */
    const tableContent = isolate(tableComponent, {
      onion: tableLens,
      "*": scope,
    })({ ...sources, props: props$ })

    /**
     * Style used to display in the title which filters are applied
     * @const makeTable/Table/chipStyle
     * @type {Object}
     */
    const chipStyle = {
      style: {
        fontWeight: "lighter",
        color: "rgba(255, 255, 255, 0.5)",
        "background-color": "rgba(0, 0, 0, 0.2)",
      },
    }

    /**
     * Stream of vdom displaying the applied filter filters
     * @const makeTable/Table/filterDom$
     * @type {Stream}
     */
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

    /**
     * Style to make buttons for tsv & json export and plus & min buttons in expanding option bar
     * @const makeTable/Table/smallBtnStyle
     * @param {string} bgcolor background color of the button
     * @type {Object}
     */
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

    /**
     * Display an empty div on vdom when state.core.input.query is empty or undefined
     * @const makeTable/Table/initVdom$
     * @type {Stream}
     */
    const initVdom$ = emptyState$.mapTo(div())

    /**
     * Placeholder while a request is under way
     * @const makeTable/Table/loadingVdom$
     * @type {Stream}
     */
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
      .compose(delay(100))

    /**
     * Full vdom content once request is received
     * @const makeTable/Table/loadedVdom$
     * @type {Stream}
     */
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
                      fontSize: "20px",
                      "background-color": settings.table.color,
                      opacity: 0.5,
                    },
                  },
                  expandOptions ? "arrow_drop_up" : "arrow_drop_down"
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

    /**
     * Display error message when an invalid response is received
     * @const makeTable/Table/errorVdom$
     * @type {Stream}
     */
    const errorVdom$ = invalidResponse$.mapTo(
      div(".red .white-text", [p("An error occured !!!")])
    )

    /**
     * Wrap component vdom with an extra div that handles being dirty
     * @const makeTable/Table/vdom$
     * @type {Stream}
     */
    const vdom$ = dirtyWrapperStream(state$, xs.merge(initVdom$, errorVdom$, loadingVdom$.remember(), loadedVdom$) )

    // ========================================================================

    /**
     * Default Reducer
     * @const makeTable/Table/defaultReducer$
     * @type {Reducer}
     */
    const defaultReducer$ = xs
      .of(function defaultReducer(prevState) {
        if (typeof prevState === "undefined") {
          return ({ })
        } else {
          return prevState
        }
      })

    /**
     * Add input to state
     * @const makeTable/Table/inputReducer$
     * @type {Reducer}
     */
    const inputReducer$ = input$
      .map((i) => (prevState) =>
        // inputReducer
        ({ ...prevState, core: { ...prevState.core, input: i } })
      )

    /**
     * Add request body to state
     * @const makeTable/Table/requestReducer$
     * @type {Reducer}
     */
    const requestReducer$ = request$.map((req) => (prevState) => ({
      ...prevState,
      core: { ...prevState.core, request: req },
    }))

    /**
     * Add reply data to state
     * @const makeTable/Table/dataReducer$
     * @type {Reducer}
     */
    const dataReducer$ = data$
      .map((newData) => (prevState) => ({
        ...prevState,
        core: { ...prevState.core, data: newData },
      }))

    /**
     * Reducer for opening and closing option drawer
     * @const makeTable/Table/switchReducer$
     * @type {Reducer}
     */
    const switchReducer$ = sources.DOM.select(".switch")
      .events("click")
      .fold((x, y) => !x, false)
      .map((yesorno) => (prevState) => ({
        ...prevState,
        core: { ...prevState.core, expandOptions: yesorno },
      }))

    /**
     * Reducer for passing the amount of entries shown in the table to the search query params object
     * @const makeTable/Table/amountOfDisplayedLinesReducer$
     * @type {Reducer}
     */
    const amountOfDisplayedLinesReducer$ = amountToDisplay$
    .map((new_) => (prevState) => {
      const val = max(1, new_)
      return {
        ...prevState,
        core: { ...prevState.core, numEntries: val}
      }
    })

    return {
      DOM: vdom$,
      HTTP: xs.merge(
        request$,
        tableContent.HTTP
      ),
      onion: xs.merge(
        defaultReducer$,
        inputReducer$,
        requestReducer$,
        dataReducer$,
        switchReducer$,
        amountOfDisplayedLinesReducer$,
      ),
      log: xs.merge(
        logger(modifiedState$, "state$")
      ),
    }
  }
}

export { makeTable, headTableLens, tailTableLens, compoundContainerTableLens }
