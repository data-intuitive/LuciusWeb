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
  lensProp,
  view as viewR,
  ascend,
  sortWith,
  none,
  any,
  values,
  identity,
  replace,
} from "ramda"
import { FetchFilters } from "./FetchFilters"
import debounce from 'xstream/extra/debounce'
import flattenConcurrently from 'xstream/extra/flattenConcurrently'
import { safeModelToUi } from '../modelTranslations'

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
  get: (state) => {

    // Get keys starting with 'filter_' but that is not only 'filter_'
    const keys_ = keys(state.routerInformation?.params)
      .filter((key) => key.startsWith("filter_") && key != "filter_")
    const searchArr = keys_.map((key) => {
      const newKey = replace(/^filter_/, "", key)
      return {
        [newKey]: state.routerInformation.params[key]
      }
    })
    const searchObj = mergeAll(searchArr)

    return {
      core: state.filter,
      settings: { filter: state.settings.filter, api: state.settings.api, modelTranslations: state.settings.common.modelTranslations},
      search: searchObj,
    }
  },
  set: (state, childState) => {

    const filter_outputs = childState.core.filter_output
    const filterStates = keys(filter_outputs)
      .map((key) => ({ ["filter_" + key] : filter_outputs[key]?.join() }))
    const mergedFilterState = mergeAll(filterStates)
    // mergedFilterState is an object with e.g.
    // {
    //   filter_dose: "123",
    //   filter_cell: "abc,def",
    // }

    return {
      ...state,
      filter: childState.core,
      settings: {
        ...state.settings,
        filter: childState.settings.filter,
      },
      routerInformation: {
        ...state.routerInformation,
        pageState: {
          ...state.routerInformation.pageState,
          ...mergedFilterState,
        }
      }
    }
  },
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
 * @param {Stream} filterNames$ array of top-level filter names
 * @returns {Stream} object with:
 *                    - filterValuesAction$ stream of object where key is filter group (top level) and value is which option is being clicked/modified
 *                    - modifier$: stream of boolean of modifier key being pressed or not
 *                    - filterAction$: stream of object where key is filter group (top level) and value is boolean of the group being clicked open or not
 */
function intent(domSource$, filterNames$) {
  // const expandAnyGhost$ = ghostChanges$.map(state => state.core.ghost.expand).startWith(false)

  const filterAction$ = filterNames$
    .map((names) => xs.fromArray(names.map(
      (name) => domSource$
          .select("." + name)
          .events("click")
          .fold((x, _) => ({ [name]: !x[name] }), { [name]: false })
          .startWith({ [name]: false })
      ))
    )
    .compose(flattenConcurrently)
    .compose(flattenConcurrently)
    .fold((acc, new_) => ({...acc, ...new_}), ({}))

  // Toggles for filter options
  // const toggledGhost$ =
  //   ghostChanges$
  //     .filter(state => typeof state.core.ghost.deselect !== 'undefined')
  //     .map(state => state.core.ghost.deselect)
  //     .compose(dropRepeats(equals))

  const filterValueAction$ = filterNames$
    .map((names) => xs.fromArray(names.map(
      (name) => domSource$
          .select("." + name + "-options")
          .events("click")
          .map(function (ev) {
            ev.preventDefault()
            return ev
          })
          .map((ev) => ev.ownerTarget.id)
          .map((value) => ({ [name]: value }))
      ))
    )
    .compose(flattenConcurrently)
    .compose(flattenConcurrently)

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

  return {
    filterValuesAction$: filterValueAction$,
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
 * @param {Stream} search$ search query values for filter settings
 * @returns {Stream} reducers
 */
export function model(
  possibleValues$,
  input$,
  filterValuesAction$,
  modifier$,
  filterAction$,
  search$,
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
      state: {},
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
    .filter((state) => none(identity, values(state))) // check all values are false 
    .map(_ => (prevState) => ({
      ...prevState,
      core: { ...prevState.core, filter_output: minimizeFilterOutput(prevState) },
    }))

  /**
   * Set filter values during page load when search query contains filter values
   * @const model/searchReducer$
   * @type {Reducer}
   */
  const searchReducer$ = xs.combine(input$, possibleValues$).compose(sampleCombine(search$))
    .map(([[_, possibleValues], search]) => {

      const matchedFilters = (searchValue, possibleValues) => {
        const values = searchValue.split(',')
        return values.filter(v => possibleValues.includes(v))
      }

      return mergeAll(
        keys(possibleValues)
          .map((key) => (
            { [key] : search[key] == undefined ? undefined : matchedFilters(search[key], possibleValues[key]) }
          ))
        )
    })
    .filter((output) => any((value) => (value != undefined), values(output))) // any value not undefined?
    .compose(dropRepeats(equals)) // only do this once. Changes in the WF should not be overwritten
    .map((output) => (prevState) => {
      const filter_output = minimizeFilterOutput({
        ...prevState,
        core: {
          ...prevState.core,
          output: output,
        }
      })
      return {
        ...prevState,
        core: {
          ...prevState.core,
          output: output,
          filter_output: filter_output,
        }
      }
    })

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
    searchReducer$,
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
   * @param {String} filter Filter name as specified by the API
   * @param {Boolean} toggle Visible or not?
   * @param {Array} possibleOptions Array of possible options
   * @param {Array} selectedOptions Array of selections (multiple)
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
      : div(".col .s10 .offset-s1", [""])

  /**
   * Top level of a filter group.
   * First part contains the filter name and summary of the selected filters
   * Second part, if toggled open, lists all filter values with selection boxes
   * @param {Array} selectedValues All filter values that are currently selected
   * @param {Array} possibleValues All possible filter values in this group
   * @param {String} propName Filter name as specified by the API
   * @param {String} domText Filter name as it should be displayed on the DOM
   * @param {Boolean} toggle Filter is currently open or not
   * @returns vdom div containing sub vdom elements
   */
  const collapsableFilter = (selectedValues, possibleValues, propName, domText, toggle) =>
    div(".col .s12", [
      div(".chip " + "." + propName + ".col .s12", [
        span("." + propName + " .blue-grey-text", [
          noFilter(selectedValues, possibleValues)
            ? "No " + domText + " Filter"
            : domText + ": " + selectedValues.join(", "),
        ]),
      ]),
      togglableFilter(
        propName,
        toggle,
        possibleValues,
        selectedValues
      ),
    ])

  const loadedVdom$ = modifiedState$.map((state) => {

    const propToFilterSection = (propName) => {
      const lens = lensProp(propName)
      const possibleValues = viewR(lens, state.settings.filter.values) || [ "Populating filter dialog...", ]
      const selectedValues = viewR(lens, state.core.output) ?? possibleValues
      const toggle = viewR(lens, state.core.state)
      const domText = safeModelToUi(propName, state.settings.modelTranslations)

      return collapsableFilter(selectedValues, possibleValues, propName, domText, toggle)
    }

    const filterGroups = keys(state.settings.filter.values)
    // sort by name that will be shown on the UI
    const sortedFilterGroups = sortWith([
        ascend(a => safeModelToUi(a, state.settings.modelTranslations))
      ])(filterGroups)
    const domArray = sortedFilterGroups
      .map(f => propToFilterSection(f))

    return div(domArray)
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
    sources.state.stream,
    "settings.filter.debug"
  )

  // The debounce is required, else it simply does not work
  const state$ = sources.state.stream.compose(debounce(100))

  const filterNames$ = state$
    .map(state => keys(state.settings.filter.values))
    .compose(dropRepeats(equals))

  const input$ = sources.input

  const filterQuery = FetchFilters(sources)

  const actions = intent(sources.DOM, filterNames$)

  const vdom$ = view(state$)

  const reducers$ = model(
      filterQuery.filters,
      input$,
      actions.filterValuesAction$,
      actions.modifier$,
      actions.filterAction$,
      state$.map((state) => (state.search)),
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
