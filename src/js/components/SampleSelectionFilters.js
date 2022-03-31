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
  fromPairs,
  flatten,
  equals,
  lensProp,
  set,
  findIndex,
  adjust,
  view as viewR,
  find,
  whereEq,
} from "ramda"
import dropRepeats from "xstream/extra/dropRepeats";

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

    const thisFilterInfo$ = sources.filterInfo$.map((info) => info[key])
    const thisFilterData$ = sources.filterData$.map((data) => data[key])
   
    const valueElements = (key, unitInfo, filterData) => {

      const list = toPairs(unitInfo.values).map(([value, amount]) => {
        
        var use = false
        const matcher = whereEq({ type: 'value', unit: unitInfo.unit, value: value })
        if (filterData?.length > 0) {
          const data = find( matcher )(filterData)
          // console.log("data: " + JSON.stringify(data))
          use = data.use
        }

        if (use == false) {
          console.log("not checked: " + serialize(key, unitInfo.unit, value))
        }

        return li(".selection",[
          label("", { props: { id: "." + key } }, [
              input(
                  ".grey .selection-cb",
                  { props: { type: "checkbox", checked: use, id: serialize(key, unitInfo.unit, value) } },
                  "tt"
              ),
              span(value),
              span(" "),
              span("(" + amount + ")")
              ]),
        ])
      })

        return div(".sampleSelectionFilter-" + key, [
            span(key + ' - ' + unitInfo.unit),
            ul(list)
        ])
    }

    // TODO use 'filterData' to retrieve checked or unchecked values
    const createFilter = (key, info, filterData) =>
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
            div(info.values.map((_) => valueElements(key, _, filterData)))
          ]),
        ]),
      ])

    const vdom$ = xs
      .combine(
        thisFilterInfo$,
        thisFilterData$,
      )
      .map(([info, filterData]) => createFilter(key, info, filterData))

    return {
        DOM: vdom$,
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

  const useValueClick$ = domSource$.select(".selection-cb")
  .events("click", { preventDefault: true })
  // .events("click")
  .map((ev) => ev.ownerTarget.id)

  return {
    useValueClick$: useValueClick$
  }
}

function model(state$, useClick$) {
  const filterInfo$ = state$
    .map((state) => composeFilterInfo(state.core.data))
    .compose(dropRepeats(equals))
    .remember()

  const defaultReducer$ = xs.of((prevState) => ({
    ...prevState,
    core: {
      filterData: {},
      filterInfo: {},
    }
  }))

  const initialFilterData$ = filterInfo$.map((filterInfo) => {

    const filterDataPairs = toPairs(filterInfo).map(([key, value]) => {
      const nestedValues = value.values.map((valuesPerUnit) => keys(valuesPerUnit.values).map((v) => ({ type: 'value', value: v, unit: valuesPerUnit.unit, use: true })))
      const flattenedValues = flatten(nestedValues)

      return [key, flattenedValues]
    })

    const filterData = fromPairs(filterDataPairs)
    return filterData
  })

  const updateFilterData = (key, unit, value, prevFilterData) => {
    const keyLens = lensProp(key)
    const matcher = whereEq({ type: 'value', unit: unit, value: value })
    const toggleUse = (v) => ({ ...v, use: !v.use })


    console.log("prevFilterData: ")
    console.log(prevFilterData)
    console.log("key: " + key + " unit: " + unit + " value: " + value)

    const currentFilterDataKey = viewR(keyLens, prevFilterData)
    const index = findIndex( matcher )(currentFilterDataKey)
    
    // if value not found, return unchanged state
    if (index < 0)
      return prevState

    const currentFilterDataOnlyKeyUpdatedValue = adjust(index, toggleUse, currentFilterDataKey )
    const updatedFilterData = set(keyLens, currentFilterDataOnlyKeyUpdatedValue, prevFilterData)
    return updatedFilterData
  }

  const filterInfoReducer$ = filterInfo$.map((filterInfo) => (prevState) => ({
    ...prevState,
    core: {
      filterInfo: filterInfo,
      filterData: prevState.core.filterData,
    }
  }))

  const initFilterDataReducer$ = initialFilterData$.map((filterData) => (prevState) => ({
    ...prevState,
    core: {
      filterInfo: prevState.core.filterInfo,
      filterData: filterData,
    }
  }))

  const filterData$ = state$.map((state) => state.core.filterData)

  const filterDataReducer$ = useClick$.map((id) => (prevState) => {
    const [key, unit, value] = deserialize(id)
    const filterData = updateFilterData(key, unit, value, prevState.core.filterData)
    return {
    ...prevState,
    core: {
      filterInfo: prevState.core.filterInfo,
      filterData: filterData,
    }
  }})

  return {
    filterInfo$: filterInfo$,
    filterData$: filterData$,
    onion: xs.merge(
      defaultReducer$,
      filterInfoReducer$,
      initFilterDataReducer$,
      filterDataReducer$,
      ),
  }
}

function view(childrenSinks$) {

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
  const model_ = model(state$, intent_.useValueClick$)

  const childrenSinks$ = model_.filterInfo$.map(filterInfo => {
    const keys_ = keys(filterInfo)
    return keys_.map((key) => SingleSampleSelectionFilter({
        ...sources,
        key: key,
        filterInfo$: model_.filterInfo$,
        filterData$: model_.filterData$,
        }))
  })
  .remember()

  const vdom$ = view(childrenSinks$)

  return {
    log: xs.empty(),
    DOM: vdom$,
    onion: model_.onion,
  }
}

export { SampleSelectionFilters, SampleSelectionFiltersLens }
