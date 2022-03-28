import xs from "xstream"
import { div, label, input, button, span, p, i } from "@cycle/dom"
import {
  prop,
  keys,
  length,
  includes,
  filter,
  uniq,
  reduce,
  apply,
  countBy,
  identity,
  none,
  all,
} from "ramda"

const SampleSelectionFiltersLens = {
  get: (state) => ({ ...state }),
  set: (state, childState) => ({ ...state }),
}

// const composedFilterInfo = {
//   'field1': {
//     hasUnits: false,
//     hasRange: false,
//     minValue: 0,
//     maxValue: 0,
//     values: [
//       { unit: '', values: {'a': 3, 'b': 2, 'c': 2, 'd': 3}, hasRange: false, minValue: 0, maxValue: 0, amount: 10 },
//     ]
//   },
//   'field2': {
//     hasUnits: true,
//     hasRange: true, // only true if all units have 'hasRange' == true
//     minValue: 0.001, // minimum of all values
//     maxValue: 100,
//     values: [
//       { unit: 'unit1', values: {0.001: 2, 0.01: 2, 0.1: 3, 1: 3}, hasRange: true, minValue: 0.001, maxValue: 1, amount: 10 },
//       { unit: 'unit2', values: {10: 5, 100: 5}, hasRange: true, minValue: 10, maxValue: 100, amount: 10 },
//     ]
//   }
// }

const composeFilterInfo = (data) => {
  // we need at least 1 data entry to be able to compose the data types that will be present in the data
  if (length(data) == 0) return {}

  console.log(data)

  const getValueStruct = (unit, arr) => {
    const counts = countBy(identity, arr)
    const isAllNumbers = none(isNaN, arr)
    const minValue = isAllNumbers ? apply(Math.min, arr) : 0
    const maxValue = isAllNumbers ? apply(Math.max, arr) : 0
    return {
      unit: unit,
      values: counts,
      hasRange: isAllNumbers,
      minValue: minValue,
      maxValue: maxValue,
      amount: length(arr),
    }
  }

  const dataKeys = keys(data[0])

  const mappedDataArr = dataKeys.map((dataKey) => {
    if (includes(dataKey + "_unit", dataKeys)) {
      const units = uniq(data.map(prop(dataKey + "_unit")))

      const unitValuesArr = units.map((unit) => {
        const unitFilter = (entry) => prop(dataKey + "_unit", entry) == unit
        const filteredData = filter(unitFilter, data)
        const arr = filteredData.map(prop(dataKey))

        return getValueStruct(unit, arr)
      })

      const allHasRange = all(prop("hasRange"), unitValuesArr)
      const allMinValue = allHasRange
        ? apply(Math.min, unitValuesArr.map(prop("minValue")))
        : 0
      const allMaxValue = allHasRange
        ? apply(Math.max, unitValuesArr.map(prop("maxValue")))
        : 0

      return {
        [dataKey]: {
          hasUnits: true,
          hasRange: allHasRange,
          minValue: allMinValue,
          maxValue: allMaxValue,
          values: unitValuesArr,
        },
      }
    } else {
      const arr = data.map(prop(dataKey))
      const values = getValueStruct("", arr)

      return {
        [dataKey]: {
          hasUnits: false,
          hasRange: values.hasRange,
          minValue: values.minValue,
          maxValue: values.maxValue,
          values: [values],
        },
      }
    }
  })

  const reducer = (acc, value) => ({ ...acc, ...value })
  const result = reduce(reducer, {}, mappedDataArr)
  // console.log("result: " + JSON.stringify(result))
  return result
}

//   const childrenSinks$ = array$.map(array => {
//     return array.map((_, index) => isolate(SampleInfo, index)(sources))
//   });

// const composedChildrenSinks$ = childrenSinks$.compose(pick('DOM')).compose(mix(xs.combine))

function intent(domSource$) {}

function model(state$) {
  const filterInfo$ = state$.map((state) => composeFilterInfo(state.core.data))

  return {
    filterInfo$: filterInfo$,
  }
}

function view(filterInfo$) {
  const makeFilters = (filterInfo, initialization) => {
    // const filterInfo = composeFilterInfo(data)

    const createFilter = (key, info) =>
      p([
        div(span(key)),
        div([
          div([span("hasUnits: "), span(info.hasUnits)]),
          div([span("hasRange: "), span(info.hasRange)]),
          div([span("minValue: "), span(info.minValue)]),
          div([span("maxValue: "), span(info.maxValue)]),
          div([
            span("values:"),
            div(info.values.map((_) => span(JSON.stringify(_)))),
          ]),
        ]),
      ])

    const filters = keys(filterInfo).map((key) =>
      createFilter(key, filterInfo[key])
    )

    return div(
      ".sampleSelectionFilters",
      div(
        ".row",
        div(
          ".col .s10 .offset-s1 .l10 .offset-l1",
          initialization ? [span()] : filters
        )
      )
    )
  }

  const vdom$ = filterInfo$.map((filterInfo) => makeFilters(filterInfo, false))

  return vdom$
}

function SampleSelectionFilters(sources) {
  const state$ = sources.onion.state$

  //   intent()
  const model_ = model(state$)
  const vdom$ = view(model_.filterInfo$)

  return {
    log: xs.empty(),
    DOM: vdom$,
  }
}

export { SampleSelectionFilters, SampleSelectionFiltersLens }
