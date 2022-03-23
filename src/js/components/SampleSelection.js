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
import { clone, equals, merge, sortWith, prop, ascend, descend, keys, length, includes, anyPass, allPass, filter, uniq, reduce, countBy, identity, none, min, max } from "ramda"
import xs from "xstream"
import dropRepeats from "xstream/extra/dropRepeats"
import debounce from 'xstream/extra/debounce'
import { loggerFactory } from "../utils/logger"
import { TreatmentAnnotation } from "./TreatmentAnnotation"
import { safeModelToUi } from "../modelTranslations"
import { dirtyUiReducer, dirtyWrapperStream, busyUiReducer } from "../utils/ui"

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
    search: state.params?.samples,
    searchAutoRun: state.params?.autorun,
  }),
  // get: state => ({core: state.form.sampleSelection, settings: state.settings}),
  set: (state, childState) => ({
    ...state,
    form: { ...state.form, sampleSelection: childState.core},
    pageState: {
      ...state.pageState,
      samples: childState.core.output?.join(),
    }
  }),
}

/**
 * Create function to check value against a single criterion
 * 
 * { type: 'range', min: 1, max: 2, unit: 'um' },
 * { type: 'value', value: 1, unit: 'um' },
 * 
 * @param {Object} criterion 
 * @returns function (sampleEntry) => boolean
 */
const createFilterCheck = (filterKey) => (criterion) => {
  if (criterion.type == 'range') {
    const minCheck = criterion.min == undefined 
      ? () => true
      : (value) => value[filterKey] >= criterion.min
    const maxCheck = criterion.max == undefined 
      ? () => true
      : (value) => value[filterKey] <= criterion.max
    const unitCheck = criterion.unit == undefined 
      ? () => true
      : (value) => value[filterKey + "_unit"] == criterion.unit

    return allPass([minCheck, maxCheck, unitCheck])
  }
  else if (criterion.type == 'value') {
    const valueCheck = criterion.value == undefined
      ? () => true
      : (value) => value[filterKey] == criterion.value
    const unitCheck = criterion.unit == undefined 
      ? () => true
      : (value) => value[filterKey + "_unit"] == criterion.unit
    
    return allPass([valueCheck, unitCheck])
  }

  console.warn("Criterion type " + criterion.type + " unknown.")
  return (value) => false
}

/**
 * Filter an array of sample data by the specified criteria
 * 
 * Criteria object has entries for each property to filter by.
 * Each entry has an array of object with, each should have a type field
 * type, string:
 *  - 'range'
 *  - 'value'
 * Depending on the type, the following fields can be added
 *  - range:
 *    - min
 *    - max
 *    - unit
 *  - value:
 *    - value
 *    - unit
 * 
 * In case of multiple properties to be filtered, use AND logic
 * In case of multiple limits/values for a property, use OR logic
 * 
 * {
 *   dose: [
 *     { type: 'range', min: 1, max: 2, unit: 'um' },
 *     { type: 'value', value: 1, unit: 'um' },
 *     ...
 *   ]
 * }
 * 
 * @param {Array} data Data to filter
 * @param {Object} criteria 
 * @returns Array of filtered data
 */
export const filterData = (data, criteria) => {
  // we need at least 1 data entry to be able to filter
  // not just as concept but also for our code to work
  if (length(data) == 0)
    return data

  const filterKeys = keys(criteria)
  const dataKeys = keys(data[0])
  const criteriaArray = []

  for (const filterKey of filterKeys) {
    if (!includes(filterKey, dataKeys)) {
      console.warn("Not using '" + filterKey + "' to filter data as it is not found in the data set.")
      continue
    }

    if (!Array.isArray(criteria[filterKey])) {
      console.warn("Not using '" + filterKey+ "' to filter data as it is the wrong data type: " + (typeof criteria[filterKey]) + ".")
      continue
    }

    const check = anyPass(criteria[filterKey].map(createFilterCheck(filterKey)))
    criteriaArray.push(check)
  }

  const filteredData = filter(allPass(criteriaArray), data)
  return filteredData
}

const composedFilterInfo = {
  'field1': {
    hasUnits: false,
    hasRange: false,
    min: 0,
    max: 0,
    values: [
      { unit: '', values: {'a': 3, 'b': 2, 'c': 2, 'd': 3}, hasRange: false, minValue: 0, maxValue: 0, amount: 10 },
    ]
  },
  'field2': {
    hasUnits: true,
    hasRange: true, // only true if all units have 'hasRange' == true
    min: 0.001, // minimum of all values
    max: 100,
    values: [
      { unit: 'unit1', values: {0.001: 2, 0.01: 2, 0.1: 3, 1: 3}, hasRange: true, minValue: 0.001, maxValue: 1, amount: 10 },
      { unit: 'unit2', values: {10: 5, 100: 5}, hasRange: true, minValue: 10, maxValue: 100, amount: 10 },
    ]
  }
}

const composeFilterInfo = (data) => {
  // we need at least 1 data entry to be able to compose the data types that will be present in the data
  if (length(data) == 0)
    return {}

  const getValueStruct = (unit, arr) => {
    const counts = countBy(identity, arr)
    const isAllNumbers = none(isNaN, arr)
    const minValue = isAllNumbers ? reduce(min, Number(arr[0]), arr.map(Number)) : 0
    const maxValue = isAllNumbers ? reduce(max, Number(arr[0]), arr.map(Number)) : 0
    return { unit: unit, values: counts, hasRange: isAllNumbers, minValue: minValue, maxValue: maxValue, amount: length(arr)}
  }

  const dataKeys = keys(data[0])

  for (const dataKey of dataKeys) {

    if (includes(dataKey + "_unit", dataKeys)) {
      console.log(dataKey + " has units")

      const units = uniq(data.map(prop(dataKey + "_unit")))

      const unitValuesArr = units.map((unit) => {
        const unitFilter = (entry) => prop(dataKey + "_unit", entry) == unit
        const filteredData = filter(unitFilter, data)
        const arr = filteredData.map(prop(dataKey))
        
        return getValueStruct(unit, arr)
      })

      console.log("unitValuesArr: " + JSON.stringify(unitValuesArr))
    }
    else {
      const arr = data.map(prop(dataKey))
      const valuesArr = [getValueStruct('', arr)]

      console.log("valuesArr: " + JSON.stringify(valuesArr))
    }

  }
}

/**
 * Sorts an array of sample data by the specified property and direction
 * Dose and time are sorted numerically instead of alphabetically, otherwise 3 > 10
 * @param {Array} data Data to be sorted
 * @param {String} sortBy Property name to sort by
 * @param {Boolean} direction True = descending, False = ascending
 * @returns Array of sorted data
 */
export const sortData = (data, sortBy, direction) => {

  function propSort(prop, descend) {
    return (a, b) => {
      const aValue = a[prop]
      const bValue = b[prop]
      const multi = descend ? -1 : 1

      if (isNaN(aValue) || isNaN(bValue))
        // works properly for integers but not for decimal numbers, so only use it as fallback
        return aValue.localeCompare(bValue, undefined, {numeric: true})
      else
        return (Number(aValue) - Number(bValue) > 0 ? 1 : -1) * multi
    }
  }

  const dataSortAscend = sortWith([
    ascend(prop(sortBy)),
  ]);
  const dataSortDescend = sortWith([
    descend(prop(sortBy)),
  ]);

  return sortBy !== ""
    ? sortBy == "dose" || sortBy == "time"
      ? sortWith([propSort(sortBy, direction)])(data)
      : direction ? dataSortDescend(data) : dataSortAscend(data)
    : data
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

  // State without data erased, to be used for the loading vdom as we don't want to display old data
  const loadingState$ = state$
    .map((state) => ({
      ...state,
      core: { ...state.core, data: []}
    }))

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
      selected ? ".sampleSelected" : ".sampleDeselected"
    
    const filterInfo = composeFilterInfo(data) // TODO use filterInfo to display filter options on GUI
    const filteredData = filterData(data, undefined)
    const sortedData = sortData(filteredData, state.core.sort, state.core.direction)

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
            const maxLength = 7
            if (dose.length <= maxLength)
              return dose
            else if (isNaN(entry.dose) || entry.dose_unit.length >= 3)
              return dose.substring(0, maxLength-1) + "..."
              // adding '...' is quite small on screen (in non-monospaced fonts), so we're ignoring that
            else
              return Number(entry.dose).toFixed(maxLength - 3 - entry.dose_unit?.length) + " " + entry.dose_unit
              // -3 = '0.' and ' '
          })()
      ),
      // td(selectedClass(entry.use), entry.batch),
      // td(selectedClass(entry.use), entry.year),
      td(selectedClass(entry.use), entry.time !== "N/A" ? entry.time + " " + entry.time_unit : entry.time),
      td(selectedClass(entry.use), entry.significantGenes),
    ])

    const sortableHeaderEntry = (id, text, state, sortable=true) =>
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
          ".btn-flat" + (loaded && sortable ? " .sortable" : ""),
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
      sortableHeaderEntry("use", "Use?", state, false),
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

    return div(".sampleSelection",[
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
    .compose(sampleCombine(loadingState$))
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
    .filter(([state, _]) => state.core.busy == false)
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

    const autoSelect$ = data$.compose(sampleCombine(state$))
      .filter(([_, state]) => (state.search != undefined))
      .mapTo(true)
      .compose(dropRepeats(equals))

    const autoSelectReducer$ = autoSelect$
      .map((_) => (prevState) => {
        const samplesToUse = prevState.search.split(",")

        const newData = prevState.core.data.map((el) => {
          // One sample object
          var newEl = clone(el)
          const use = samplesToUse.includes(el.id)//id === el.id
          newEl.use = use
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
      })

  const autoRun$ = autoSelectReducer$.compose(sampleCombine(state$))
    .filter(([_, state]) => state.searchAutoRun == "" || state.searchAutoRun == "yes")
    .mapTo(true)
    .compose(dropRepeats(equals))

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
        .compose(dropRepeats()),
      autoRun$,
    )
    .compose(sampleCombine(state$))
    .map(([ev, state]) => state.core.output)

  // Logic and reducer stream that monitors if this component is busy
  const busyReducer$ = busyUiReducer(newInput$, data$)

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
      autoSelectReducer$,
      busyReducer$,
      sortReducer$,
      hoverReducer$,
      dirtyReducer$,
    ),
    output: sampleSelection$,
    modal: treatmentAnnotations.modal,
  }
}

export { SampleSelection, sampleSelectionLens }
