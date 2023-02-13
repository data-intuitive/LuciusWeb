import sampleCombine from "xstream/extra/sampleCombine"
import { i, div, input } from "@cycle/dom"
import { prop, equals, mergeAll } from "ramda"
import xs from "xstream"
import dropRepeats from "xstream/extra/dropRepeats"
import debounce from "xstream/extra/debounce"
import { loggerFactory } from "../utils/logger"
import { dirtyUiReducer } from "../utils/ui"
import { typer } from "../utils/searchUtils"
import { treatmentsQuery } from "../utils/asyncQuery"

const checkLens = {
  get: (state) => ({
    core: typeof state.form !== "undefined" ? state.form.check : {},
    settings: state.settings,
    search: state.params?.treatment,
    searchAutoRun: state.params?.autorun,
    searchTyper: state.params?.typer,
  }),
  set: (state, childState) => ({
    ...state,
    form: { ...state.form, check: childState.core },
    pageState: {
      ...state.pageState,
      treatment: childState.core.input,
    }
  }),
}

const treatmentLikeFilter = {
  COMPOUND : "compound",
  LIGAND   : "ligand",
  GENETIC  : "genetic",
  ALL : "compound ligand genetic"
}

/**
 * Form for entering treatments with autocomplete.
 *
 * Input: Form input
 * Output: treatment (string)
 */
function TreatmentCheck(sources) {
  // States of autosuggestion field:
  // - Less than N characters -> no query, no suggestions
  // - N or more -> with every character a query is done (after 500ms). suggestions are shown
  // - Clicking on a suggestion activates it in the search field and sets validated to true
  // - At that point, the dropdown should dissapear!!!
  // - The suggestions appear again whenever something changes in the input...

  const logger = loggerFactory(
    "treatmentCheck",
    sources.onion.state$,
    "settings.form.debug"
  )

  const state$ = sources.onion.state$

  const acInput$ = sources.ac

  // Get input from search query, either slowly typed or in one go
  const typer$ = typer(state$, "search", "searchTyper")

  const input$ = xs.merge(
    sources.DOM.select(".treatmentQuery")
      .events("input")
      .map((ev) => ev.target.value)
      .startWith(""),
    // This for ghost mode, inject changes via external state updates...
    state$
      .filter((state) => typeof state.core.ghostinput !== "undefined")
      .map((state) => state.core.input)
      .compose(dropRepeats()),
    typer$,
  )

  // When the component should not be shown, including empty signature
  const isEmptyState = (state) => {
    if (typeof state.core === "undefined") {
      return true
    } else {
      if (typeof state.core.input === "undefined") {
        return true
      } else {
        return false
      }
    }
  }

  const emptyState$ = state$
    .filter((state) => isEmptyState(state))
    .compose(dropRepeats(equals))

  // When the state is cycled because of an internal update
  const modifiedState$ = state$
    .filter((state) => !isEmptyState(state))
    .compose(dropRepeats((x, y) => equals(x, y)))
    .remember()

  // An update to the input$, join it with state$
  const newInput$ = xs
    .combine(input$, modifiedState$)
    .map(([newinput, state]) => ({
      ...state,
      core: { ...state.core, input: newinput },
    }))
    .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

  const triggerRequest$ = newInput$
    .filter((state) => state.core.input.length >= 1)
    .filter((state) => state.core.showSuggestions)
    .compose(debounce(200))

  const triggerObject$ = triggerRequest$.map((state) =>({
    version: "v2",
    query: state.core.input,
    like: state.settings.treatmentLike
  }))

  const queryData = treatmentsQuery(triggerObject$)(sources)

  const data$ = queryData.data$
    .map((res) => res.data)
    .map((data) => data ?? [])
    
  const initVdom$ = emptyState$.mapTo(div())

  const loadedVdom$ = modifiedState$.map((state) => {
    const query = state.core.input
    const validated = state.core.validated
    return div([
      div(
        ".row .WF-header .white-text",
        { style: { padding: "20px 10px 10px 10px" } },
        [
          div(".Default .waves-effect .col .s1 .center-align", [
            i(
              ".large  .center-align .material-icons",
              { style: { fontSize: "45px", fontColor: "gray" } },
              "search"
            ),
          ]),
          div(
            ".col .s10 .input-field",
            { style: { margin: "0px 0px 0px 0px" } },
            [
              input(
                ".treatmentQuery.col .s12 .autocomplete-input .white-text",
                {
                  style: { fontSize: "20px" },
                  props: { type: "text", value: query },
                  value: query,
                }
              ),
            ]
          ),
          validated
            ? div(".treatmentCheck .waves-effect .col .s1 .center-align", [
                i(
                  ".large .material-icons .validated",
                  { style: { fontSize: "45px", fontColor: "grey" } },
                  ["play_arrow"]
                ),
              ])
            : div(".treatmentCheck .col .s1 .center-align", [
                i(
                  ".large .material-icons",
                  { style: { fontSize: "45px", fontColor: "grey" } },
                  "play_arrow"
                ),
              ]),
        ]
      ),
    ])
  })

  const vdom$ = xs.merge(initVdom$, loadedVdom$).startWith(div())

  // Set a initial reducer, showing suggestions
  const defaultReducer$ = xs.of((prevState) => {
    // treatmentCheck -- defaultReducer$')
    let newState = {
      ...prevState,
      core: {
        ...prevState.core,
        showSuggestions: true,
        validated: false,
        input: "",
        data: [],
      },
    }
    return newState
  })

  // Reducer for showing suggestions again after an input event
  const inputReducer$ = input$.map((value) => (prevState) => ({
    ...prevState,
    core: {
      ...prevState.core,
      showSuggestions: true,
      validated: false,
      input: value,
    },
  }))

  // Set a default signature for demo purposes
  const setDefault$ = sources.DOM.select(".Default").events("click")
  const setDefaultReducer$ = setDefault$
    .compose(sampleCombine(state$))
    .map(([_, state]) => (prevState) => ({
      ...prevState,
      core: {
        ...prevState.core,
        showSuggestions: false,
        validated: true,
        input: prop(state.settings.treatmentLike, state.settings.common.example)
      },
    }))

  // Add data from API to state, update output key when relevant
  const dataReducer$ = data$.map((newData) => (prevState) => ({
    ...prevState,
    core: { ...prevState.core, data: newData },
  }))

  // Feed the autocomplete driver
  const ac$ = data$.compose(sampleCombine(input$))
    .map(([data, input]) => ({
      el: ".treatmentQuery",
      data: (data.length == 1 && data[0].trtId == input) ? [] : data,
      render: function (data) {
        return mergeAll(
          data.map((d) => ({ [d.trtId + " - " + d.trtName + " (" + d.count + ")"]: null }))
        )
      },
      strip: function (str) {
        return str.split(" - ")[0];
      },
    }))


  // When a suggestion is clicked, update the state so the query becomes this
  const autocompleteReducer$ = xs
    .merge(
      // input from autocomplete (clicking an option)
      acInput$,
      // input from having one solution left in the autocomplete, extract the remaning target
      ac$
        // Trigger an update when only one result is left so we can handle that in the AutoComplete driver
        .filter((data) => data.length == 1)
        .map((info) => info.data[0].trtId)
    )
    .map((input) => (prevState) => {
      const newInput = input
      return {
        ...prevState,
        core: {
          ...prevState.core,
          input: newInput,
          showSuggestions: false,
          validated: true,
          output: newInput,
        },
      }
    })

  /**
   * When there is new input and is validated by the API, validate the output
   * auto complete only works when there are more than 1 option
   * @const TreatmentCheck/fullInputValidationReducer$
   * @type {Reducer}
   */
  const fullInputValidationReducer$ = data$.compose(sampleCombine(input$))
    .filter(([data, input]) => data.length == 1 &&
      data[0].trtId == input
    )
    .map(([data, input]) => (prevState) => ({
      ...prevState,
      core: {
        ...prevState.core,
        input: input,
        showSuggestions: false,
        validated: true,
        output: input,
      },
    }))

  // GO!!!
  const run$ = sources.DOM.select(".treatmentCheck").events("click")

  // Auto start query
  // Only run once, even if query is changed and then reverted to original value
  const searchAutoRun$ = state$
    .filter(
      (state) => state.searchAutoRun == "" || state.searchAutoRun == "yes"
    )
    .filter((state) => state.search == state.core.input)
    .filter((state) => state.core.validated == true)
    .mapTo(true)
    .compose(dropRepeats(equals))

  const query$ = xs
    .merge(
      run$,
      searchAutoRun$,
      // Ghost mode
      sources.onion.state$
        .map((state) => state.core.ghostoutput)
        .filter((ghost) => ghost)
        .compose(dropRepeats())
    )
    .compose(sampleCombine(state$))
    .map(([_, state]) => state.core.input)
    .remember()

  // Logic and reducer stream that monitors if this component became dirty
  const dirtyReducer$ = dirtyUiReducer(query$, state$.map(state => state.core.input))

  return {
    log: xs.merge(
      logger(state$, "state$")
      // logger(history$, 'history$'),
    ),
    HTTP: queryData.HTTP,
    asyncQueryStatus: queryData.asyncQueryStatus,
    DOM: vdom$,
    onion: xs.merge(
      defaultReducer$,
      inputReducer$,
      dataReducer$,
      setDefaultReducer$,
      autocompleteReducer$,
      fullInputValidationReducer$,
      dirtyReducer$,
    ),
    output: query$,
    ac: ac$
  }
}

export { TreatmentCheck, checkLens, treatmentLikeFilter }
