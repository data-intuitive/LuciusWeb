import sampleCombine from "xstream/extra/sampleCombine"
import { div, label, input, span } from "@cycle/dom"
import xs from "xstream"
import dropRepeats from "xstream/extra/dropRepeats"
import { loggerFactory } from "../utils/logger"
import {
  difference,
  keys,
  head,
  prop,
  assocPath,
  equals,
  mergeAll,
} from "ramda"
import { FetchFilters } from "./FetchFilters"
import debounce from 'xstream/extra/debounce'

/**
 * @module components/Filter
 */

/**
 * A typical Lens with one exception:
 * We allow the child state settings for filter to propagate to
 * the global state because the filter values are fetched in the child.
 * @const filterLens
 * @type {Lens}
 */
export const filterLens = {
  get: (state) => ({
    core: state.filter,
    settings: { filter: state.settings.filter, api: state.settings.api },
  }),
  set: (state, childState) => ({
    ...state,
    filter: childState.core,
    settings: {
      ...state.settings,
      filter: childState.settings.filter,
    },
  }),
}

/**
 * When the component should not be shown, including empty signature
 * @function isEmptyState
 * @param {String} state.core.input input value from previous component to signal if this filter should be displayed empty or not
 * @returns {boolean} 
 */
const isEmptyState = (state) => {
  if (typeof state.core === "undefined") {
    return true
  } else {
    if (typeof state.core.input === "undefined") {
      return true
    } else {
      if (state.core.input === "") {
        return true
      } else {
        return false
      }
    }
  }
}

/**
 * Filter intent, convert events on the dom to actions
 * @function intent
 * @param {Stream} domSource$ events from the dom
 * @returns {Stream} object with:
 *                    - filterValuesAction$ stream of object where key is filter group (top level) and value is which option is being clicked/modified
 *                    - modifier$: stream of boolean of modifier key being pressed or not
 *                    - filterAction$: stream of object where key is filter group (top level) and value is boolean of the group being clicked open or not
 */
function intent(domSource$) {
  // const expandAnyGhost$ = ghostChanges$.map(state => state.core.ghost.expand).startWith(false)

  const showDoseUI$ = domSource$
    .select(".dose")
    .events("click")
    .fold((x, _) => ({ dose: !x.dose }), { dose: false })
    .startWith({ dose: false })

  const showDose$ = xs
    .merge(
      showDoseUI$
      // showAnyGhost$
    )
    .remember()

  const showCellUI$ = domSource$
    .select(".cell")
    .events("click")
    .fold((x, _) => ({ cell: !x.cell }), { cell: false })
    .startWith({ cell: false })

  const showCell$ = xs
    .merge(
      showCellUI$
      // showAnyGhost$
    )
    .remember()

  const showTypeUI$ = domSource$
    .select(".type")
    .events("click")
    .fold((x, _) => ({ trtType: !x.trtType }), { trtType: false })
    .startWith({ trtType: false })

  const showType$ = xs
    .merge(
      showTypeUI$
      // showAnyGhost$
    )
    .remember()

  const filterAction$ = xs
    .combine(showDose$, showCell$, showType$)
    .map(mergeAll)

  // Toggles for filter options
  // const toggledGhost$ =
  //   ghostChanges$
  //     .filter(state => typeof state.core.ghost.deselect !== 'undefined')
  //     .map(state => state.core.ghost.deselect)
  //     .compose(dropRepeats(equals))

  const doseToggled$ = domSource$
    .select(".dose-options")
    .events("click")
    .map(function (ev) {
      ev.preventDefault()
      return ev
    })
    .map((ev) => ev.ownerTarget.id)
    .map((value) => ({ dose: value }))

  const cellToggled$ = domSource$
    .select(".cell-options")
    .events("click")
    .map(function (ev) {
      ev.preventDefault()
      return ev
    })
    .map((ev) => ev.ownerTarget.id)
    .map((value) => ({ cell: value }))

  const typeToggled$ = domSource$
    .select(".type-options")
    .events("click")
    .map(function (ev) {
      ev.preventDefault()
      return ev
    })
    .map((ev) => ev.ownerTarget.id)
    .map((value) => ({ trtType: value }))

  const modDown$ = domSource$
    .select("document")
    .events("keydown")
    .map((ev) => ev.code)
    .filter((code) => code == "AltLeft")
    .mapTo(true)
    .startWith(false)

  // A modifier stream
  const modUp$ = domSource$
    .select("document")
    .events("keyup")
    .map((ev) => ev.code)
    .filter((code) => code == "AltLeft")
    .mapTo(false)

  const modifier$ = xs
    .merge(modDown$, modUp$)
    .compose(dropRepeats(equals))
    .remember()

  const action$ = xs.merge(
    doseToggled$,
    cellToggled$,
    typeToggled$,
    // toggledGhost$
  )

  return {
    filterValuesAction$: action$,
    modifier$: modifier$,
    filterAction$: filterAction$,
  }
}

/**
 * Filters model, control state changes according to actions
 * set export for unit tests
 * @function model
 * @param {Stream} possibleValues$ object with 'key': 'array of strings'
 * @param {Stream} input$ signature string, used to pass to view for it to check if there is any input at all
 * @param {Stream} filterValuesAction$ object where key is filter group (top level; dose, cell, type) and value is which option is being clicked/modified
 * @param {Stream} modifier$ boolean of modifier key being pressed or not
 * @param {Stream} filterAction$ object where key is filter group (top level; dose, cell, type) and value is boolean of the group being clicked open or not
 * @param {Stream} state$ readback of full state object used for comparing committed state vs current state, if not identical means ui is dirty
 * @returns {Stream} reducers
 */
export function model(
  possibleValues$,
  input$,
  filterValuesAction$,
  modifier$,
  filterAction$,
) {

  /**
   * Add the filter values from the settings (and originally from deployments.json) to the current values
   * @const model/defaultReducer$
   * @type {Reducer}
   */
  const defaultReducer$ = xs.of((prevState) => ({
    ...prevState,
    core: {
      output: {},
      filter_output: {},
      state: {dose: false, cell: false, trtType: false},
      dirty: false,
    },
  }))

  /**
   * When the query for the current filter values returns we want to update the settings
   * @const model/possibleValuesReducer$
   * @type {Reducer}
   */
  const possibleValuesReducer$ = possibleValues$.map((fvs) => (prevState) => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        filter: {
          ...prevState.settings.filter,
          values: fvs,
        },
      }
    })
  )

  /**
   * Store input so view can access it to see if the content is empty or not
   * @const model/inputReducer$
   * @type {Reducer}
   */
  const inputReducer$ = input$.map((i) => (prevState) => ({
    ...prevState,
    core: { ...prevState.core, input: i },
  }))

  /**
   * Handle toggling of filters to a state of which filter is currently selected or not
   * @const model/toggleReducer$
   * @type {Reducer}
   */ 
  const toggleReducer$ = filterValuesAction$
    .compose(sampleCombine(modifier$))
    .map(([clickedFilter, a]) => (prevState) => {
      // a is a modifier key. If it's not pressed it's the usual behaviour
      if (a == false) {
        // We want this function to work for 3 the different filters,
        // so first get the appropriate one
        const filterKey = head(keys(clickedFilter))
        const filterValue = prop(filterKey, clickedFilter)
        // if already included, remove it from the list
        // take into account that no filter means ALL values included
        const currentArrayForFilterKey =
          prop(filterKey, prevState.core.output) == undefined
            ? prop(filterKey, prevState.settings.filter.values)
            : prop(filterKey, prevState.core.output)
        const alreadyIncluded = currentArrayForFilterKey.includes(filterValue)
        // does the value have to be removed from the list or added?
        const newArrayForFilterKey =
          alreadyIncluded
            ? currentArrayForFilterKey.filter((el) => el != filterValue)
            : currentArrayForFilterKey.concat(filterValue) // the value has to be added to the list
        // add the updated array to the appropriate key but sort first
        const updatedState = assocPath(
          ["core", "output", filterKey],
          newArrayForFilterKey.sort(),
          prevState
        )
        return updatedState
      } else {
        // If a is pressed during the click, toggle ALL values
        const filterKey = head(keys(clickedFilter))
        // values currently selected
        const currentValues =
          prop(filterKey, prevState.core.output) != undefined
            ? prop(filterKey, prevState.core.output)
            : prop(filterKey, prevState.settings.filter.values)
        // possible values
        const allValues = prop(filterKey, prevState.settings.filter.values)
        // possible - current values
        const newValues = allValues.filter((v) => !currentValues.includes(v))
        // add the updated array to the appropriate key but sort first
        const updatedState = assocPath(
          ["core", "output", filterKey],
          newValues.sort(),
          prevState
        )
        return updatedState
      }
    })

  // const outputReducer$ = filter$.map((i) => (prevState) => ({
  //   ...prevState,
  //   core: { ...prevState.core, output: i },
  // }))

  const filterReducer$ = filterAction$.map((f) => (prevState) => ({
    ...prevState,
    core: { ...prevState.core, state: f },
  }))

  // Push filter through as output field ONLY when filter fields are collapsed
  // This is to avoid too frequent updates
  // merge with the first state update in order to have at a value during initialization
  // When the filter is not set, ALL values are present and we transform that into NO values
  // We use the filter_output key for this, to keep it separate from the normal output key
  function minimizeFilterOutput(state) {
    const filterKeys = keys(state.settings.filter.values)
    var o = {}
    // Mutable approach to transforming the values
    filterKeys.forEach((key) => {
      // If no values are present, ALL values are selected
      const actual =
        prop(key, state.core.output) == undefined
        ? prop(key, state.settings.filter.values)
        : prop(key, state.core.output)
      if (
        difference(prop(key, state.settings.filter.values), actual).length != 0
      ) {
        o[key] = prop(key, state.core.output)
      }
    
    })
    return o
  }

  /**
   * Output reducer that only outputs the minimized state to 'filter_output' when all top level menus are closed
   * @const model/outputReducer$
   * @type {Reducer}
   */
  const outputReducer$ = filterAction$
    .filter((state) => !state.dose && !state.cell && !state.trtType)
    .map(_ => (prevState) => ({
      ...prevState,
      core: { ...prevState.core, filter_output: minimizeFilterOutput(prevState) },
    }))

  /**
   * Dirty state reducer, custom version than in ui.js as more logic is required and otherwise need to loop state$ back into model
   * Uses value change or opening/closing of the filters and compares current state with committed state
   * 
   * @const model/dirtyReducer$
   * @type {Reducer}
   */
  const dirtyReducer$ = xs.merge(filterValuesAction$, filterAction$).map(_ => (prevState) => {
      const minimizedCurrentOutput = minimizeFilterOutput(prevState)
      const dirty = !equals(minimizedCurrentOutput, prevState.core.filter_output)

      return {
          ...prevState,
          core: {...prevState.core, dirty: dirty}
        }
    })

  return xs.merge(
    defaultReducer$,
    inputReducer$,
    possibleValuesReducer$,
    filterReducer$,
    toggleReducer$,
    outputReducer$,
    dirtyReducer$,
  )
}

/**
 * Filters view, display the component on the vdom
 * @function view 
 * @param {Stream} state$ full state onion
 * @returns {VNodes} VNodes object of either emptyVdom$ or loadedVdom$
 */
function view(state$) {

  const emptyState$ = state$
    .filter((input) => isEmptyState(input))
  const emptyVdom$ = emptyState$.mapTo(div()).startWith(div()).remember()

  const modifiedState$ = state$
    .filter(state => !isEmptyState(state))

  // Helper functions for options: all unset or all set
  const noFilter = (selectedOptions, possibleOptions) =>
    selectedOptions.length == possibleOptions.length
  // const allFilter = (selectedOptions, possibleOptions) => (selectedOptions.length == 0)

  /**
   * Given an option from a list of options (x) and a selection, return the properties for a checkbox
   * @param {*} option The current option in the list
   * @param {*} selection Array with selection
   */
  const isSelectedProps = (option, selectedOptions) => {
    if (selectedOptions.includes(option)) {
      return { props: { type: "checkbox", checked: true, id: option } }
    } else {
      return { props: { type: "checkbox", checked: false, id: option } }
    }
  }

  /**
   * A line in a table with checkboxes for use with togglableFilter
   * @param {*} filter String representing the filter, to be used for selection later
   * @param {*} option The current option in the list
   * @param {*} selection Array with selection
   */
  const filterSwitch = (filter, option, selectedOptions) =>
    div(
      ".collection-item " + "." + filter + "-options",
      { props: { id: option } },
      [
        label({ props: { id: option } }, [
          input(isSelectedProps(option, selectedOptions), ""),
          span({ props: { id: option }, style: { padding: 2 } }, [option]),
        ]),
      ]
    )

  /**
   * A table of check boxes that is only shown if needed
   * @param {*} toggle Visible or not?
   * @param {*} options Array of possible options
   * @param {*} selection Array of selections (multiple)
   */
  const togglableFilter = (filter, toggle, possibleOptions, selectedOptions) =>
    toggle
      ? div(".col .s12", [
          div(".col.l6.s12", [
            div(
              ".collection .selection",
              possibleOptions
                .filter((_, i) => i < possibleOptions.length / 2)
                .map((option) => filterSwitch(filter, option, selectedOptions))
            ),
          ]),
          div(".col.l6.s12", [
            div(
              ".collection .selection",
              possibleOptions
                .filter((_, i) => i >= possibleOptions.length / 2)
                .map((option) => filterSwitch(filter, option, selectedOptions))
            ),
          ]),
        ])
      : div(".cell .col .s10 .offset-s1", [""])


  const loadedVdom$ = modifiedState$.map((state) => {
    const possibleDoses = state.settings.filter.values.dose || [ "Populating filter dialog...", ]
    const possibleCells = state.settings.filter.values.cell || [ "Populating filter dialog...", ]
    const possibleTypes = state.settings.filter.values.trtType || [ "Populating filter dialog...", ]

    const selectedDoses =
      state.core.output.dose == undefined
        ? possibleDoses
        : state.core.output.dose
    const selectedCells =
      state.core.output.cell == undefined
        ? possibleCells
        : state.core.output.cell
    const selectedTypes =
      state.core.output.trtType == undefined
        ? possibleTypes
        : state.core.output.trtType

    return div([
      // DEBUG -- debugging purposes, remove when no longer necessary !!!
      // div('.col .s12', [ div('', [ code('', JSON.stringify(fvs)) ] ) ]),
      // div('.col .s12', [ div('', [ code('', JSON.stringify(state.settings.filter.values)) ] ) ]),
      // div('.col .s12', [ div('', [ code('', JSON.stringify(state.core.output)) ] ) ]),
      div(".col .s12", [
        div(".chip .dose .col .s12", [
          span(".dose .blue-grey-text", [
            noFilter(selectedDoses, possibleDoses)
              ? "No Dose Filter"
              : "Doses: " + selectedDoses.join(", "),
          ]),
        ]),
        togglableFilter(
          "dose",
          state.core.state.dose,
          possibleDoses,
          selectedDoses
        ),
      ]),
      div(".col .s12", [
        div(".chip .cell .col .s12", [
          span(".cell .blue-grey-text", [
            noFilter(selectedCells, possibleCells)
              ? "No Cell Filter"
              : "Cells: " + selectedCells.join(", "),
          ]),
        ]),
        togglableFilter(
          "cell",
          state.core.state.cell,
          possibleCells,
          selectedCells
        ),
      ]),
      div(".col .s12", [
        div(".chip .type .col .s12", [
          span(".type .blue-grey-text", [
            noFilter(selectedTypes, possibleTypes)
              ? "No Type Filter"
              : "Types: " + selectedTypes.join(", "),
          ]),
        ]),
        togglableFilter(
          "type",
          state.core.state.trtType,
          possibleTypes,
          selectedTypes
        ),
      ]),
    ])
  })

  return xs.merge(
    emptyVdom$,
    loadedVdom$
  )
}

/**
 * Provide a filter form. We inject (via input) a signature in order to hide the form when an empty signature is present.
 *
 * Please note that the filter state object contains the values for the filter that should be _included_.
 * If the filter is empty, it means all values should be included (no filter)
 *
 * - input$: stream of signature updates
 * - output$: to be consumed by components that require filter functionality, object with filter values.
 * 
 * @function Filter
 * @param {*} sources 
 *          - onion.state$: default onion atom
 *          - input$: signature used as trigger for empty or not empty
 * @returns - log: logger stream,
 *          - DOM: vdom stream,
 *          - HTTP: HTTP stream,
 *          - onion: reducers stream,
 *          - output: minimized filter selection
 */
function Filter(sources) {

  const logger = loggerFactory(
    "filter",
    sources.onion.state$,
    "settings.filter.debug"
  )

  // The debounce is required, else it simply does not work
  const state$ = sources.onion.state$.compose(debounce(100))

  const input$ = sources.input

  const filterQuery = FetchFilters(sources)

  const actions = intent(sources.DOM)

  const vdom$ = view(state$)

  const reducers$ = model(
      filterQuery.filters,
      input$,
      actions.filterValuesAction$,
      actions.modifier$,
      actions.filterAction$,
  )

  const outputTrigger$ = 
    state$
      .map(state => state.core.filter_output)
      .compose(dropRepeats(equals))

  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    HTTP: filterQuery.HTTP,
    onion: reducers$,
    output: outputTrigger$
  }
}

export { Filter }
