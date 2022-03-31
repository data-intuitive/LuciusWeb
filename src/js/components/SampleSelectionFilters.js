import xs from "xstream"
import { div, label, input, button, span, p, i, ul, li } from "@cycle/dom"
import { pick, mix } from 'cycle-onionify';
import isolate from '@cycle/isolate'
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
  toPairs,
} from "ramda"
import { flatten } from "ramda";
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import dropRepeats from "xstream/extra/dropRepeats";
import { equals } from "ramda";

const SampleSelectionFiltersLens = {
  // get: (state) => ({ ...state }),
  // set: (state, childState) => ({ ...state }),
  get: (state) => ({
    core: {
      data: state.core.data,
      filterData: state.core?.sampleSelectionFilters?.filterData,
      filterInfo: state.core?.sampleSelectionFilters?.filterInfo,
    }
  }),
  set: (state, childState) => ({
    ...state,
    core: {
      ...state.core,
      sampleSelectionFilters: {
        filterData: childState.core?.filterData,
        filterInfo: childState.core?.filterInfo,
      }
    },
  }),
}

// serialize fields into a string that's deserializable again
// might need to adjust delimiter and check if certain characters need to be escaped
const serialize = (key, unit, value) => {
  const str = [key, unit, value].join("___")
  return str
}

const deserialize = (str) => {
  const arr = str.split("___")
  return arr
}

function SingleSampleSelectionFilter(sources) {

    const key = sources.key
    const filterInfo$ = sources.filterInfo$

    const thisFilterInfo$ = filterInfo$.map((info) => info[key])
   
    const valueElements = (key, unitInfo) => {

        const list = toPairs(unitInfo.values).map(([value, amount]) => li(".selection",[
            label("", { props: { id: "." + key } }, [
                input(
                    ".grey .selection-cb",
                    { props: { type: "checkbox", checked: true, id: serialize(key, unitInfo.unit, value) } },
                    "tt"
                ),
                span(value),
                span(" "),
                span("(" + amount + ")")
                ]),
        ]))

        return div(".sampleSelectionFilter-" + key, [
            span(key + ' - ' + unitInfo.unit),
            ul(list)
        ])
    }

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
            //div(info.values.map((_) => span(JSON.stringify(_)))),
            div(info.values.map((_) => valueElements(key, _)))
          ]),
        ]),
      ])

    return {
        DOM: thisFilterInfo$.map((info) => createFilter(key, info)),
    }
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

  // go from array of objects { 'key': {...} } to single object { 'key1': {...}, 'key2': {...} }
  const reducer = (acc, value) => ({ ...acc, ...value })
  const result = reduce(reducer, {}, mappedDataArr)
  // console.log("result: " + JSON.stringify(result))
  return result
}


function intent(domSource$) {

  const useClick$ = domSource$.select(".selection-cb")
  // .events("click", { preventDefault: true })
  .events("click")
  .map((ev) => ev.ownerTarget.id)

  return {
    useClick$: useClick$
  }
}

function model(sources, state$, useClick$) {
  const filterInfo$ = state$
    .map((state) => composeFilterInfo(state.core.data))
    .compose(dropRepeats(equals))
    .remember()

  const useClickTest = useClick$.map((id) => deserialize(id)).debug("useClickTest")//.addListener({ })

  const defaultReducer$ = xs.of((prevState) => ({
    ...prevState,
    core: {
      filterData: "foo",
      filterInfo: "bar",
    }
  }))

  const filterInfoReducer$ = filterInfo$.map((filterInfo) => (prevState) => ({
    ...prevState,
    core: {
      filterInfo: filterInfo,
      filterData: prevState.core.filterData,
    }
  }))

  const valueSelectedReducer$ = useClickTest.map(([key, unit, value]) => (prevState) => ({
    ...prevState,
    core: {
      filterInfo: prevState.core.filterInfo,
      filterData: key + "-" + unit + "-" + value
    }
  }))

  return {
    filterInfo$: filterInfo$,
    onion: xs.merge(
      defaultReducer$,
      filterInfoReducer$,
      valueSelectedReducer$,
      ),
  }
}

function view(filterInfo$, childrenSinks$) {

  const composedChildrenSinks$ = childrenSinks$.compose(pick('DOM')).compose(mix(xs.combine))

  const vdom$ = composedChildrenSinks$.map((arr) =>
    div(
      ".sampleSelectionFilters",
      div(".row", div(".col .s10 .offset-s1 .l10 .offset-l1", arr))
    )
  )
  .startWith(div())

  return vdom$
}

function SampleSelectionFilters(sources) {
  const state$ = sources.onion.state$//.debug("SampleSelectionFilters-state$")



  const intent_ = intent(sources.DOM)
  const model_ = model(sources, state$, intent_.useClick$)

  const childrenSinks$ = model_.filterInfo$.map(filterInfo => {
    const keys_ = keys(filterInfo)
    return keys_.map((key) => SingleSampleSelectionFilter({
        ...sources,
        key: key,
        filterInfo$: model_.filterInfo$
        }))
  })
  .remember()

  const vdom$ = view(model_.filterInfo$, childrenSinks$)

  return {
    log: xs.empty(),
    DOM: vdom$,
    onion: model_.onion,
  }
}

export { SampleSelectionFilters, SampleSelectionFiltersLens }
