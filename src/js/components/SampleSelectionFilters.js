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
import flattenConcurrently from 'xstream/extra/flattenConcurrently'
import delay from "xstream/extra/delay"

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

function SingleSampleSelectionFilter(key, filterInfo$, filterData$) {

    const thisFilterInfo$ = filterInfo$.map((info) => info[key])
    const thisFilterData$ = filterData$.map((data) => data[key])
   
    const valueElements = (key, unitInfo, filterData) => {

      const list = toPairs(unitInfo.values).map(([value, amount]) => {
        
        var use = false
        const matcher = whereEq({ type: 'value', unit: unitInfo.unit, value: value })
        if (filterData?.length > 0) {
          const data = find( matcher )(filterData)
          use = data?.use
        }

        return li(".selection-list", { props: { id: serialize(key, unitInfo.unit, value) }}, [
          label("", [
              input(
                  ".selection-cb",
                  { props: { type: "checkbox", checked: use } },
                  "tt"
              ),
              span(value),
              span(" "),
              span("(" + amount + ")"),
              span(" "),
              span("use: " + use)
              ]),
        ])
      })

      return div(".sampleSelectionFilter-" + key + "-checkboxes", { style: { borderStyle: "solid"} }, [
          span(key + ' - ' + unitInfo.unit),
          ul(list)
      ])
    }

    const sliderElements = (key, unitInfo, filterData) => {
      const sliderData = filter((f) => f?.type == 'range' && f?.unit == unitInfo.unit, filterData ?? [])
      const sanitizedSliderData = length(sliderData) > 0 ? sliderData[0] : { }
      
      const sliderDiv = div(".sampleSelectionFilter-" + key + "-sliders", { style: { borderStyle: "solid"} }, [
        span(key + '  - ', unitInfo.unit),
        span(" slider"),
        div(".sampleSelectionFilterSlider", { props: { id: serialize(key, unitInfo.unit, '-slider-')}}),
        div([
          div([span("min: "), span(sanitizedSliderData.min)]),
          div([span("max: "), span(sanitizedSliderData.max)]),
        ])
      ])

      return unitInfo.hasRange ? sliderDiv : div()
    }

    const createFilter = (key, info, filterData) =>
      p([
        div(span(key)),
        div([
          div([span("hasUnits: "), span(info.hasUnits)]),
          div([span("hasRange: "), span(info.hasRange)]),
          div([span("min: "), span(info.min)]),
          div([span("max: "), span(info.max)]),
          div([
            span("values:"),
            //div(info.values.map((_) => span(JSON.stringify(_)))),
            div(info.values.map((_) => valueElements(key, _, filterData))),
            div(info.values.map((_) => sliderElements(key, _, filterData))),
          ]),
        ]),
      ])
    
    const vdom$ = xs
      .combine(
        thisFilterInfo$,
        thisFilterData$,
      )
      .map(([info, filterData]) => createFilter(key, info, filterData))

    const createSliderDriverObject = (key, unitInfo) => ({
      id: serialize(key, unitInfo.unit, '-slider-'),
      object: {
        start: [unitInfo.min, unitInfo.max],
        connect: true,
        orientation: 'horizontal',
        range: {
          'min': unitInfo.min,
          'max': unitInfo.max
        },
      }
    })

    const createSliderDriverObjectStepped = (key, unitInfo) => {

      const rescale = (v) => {
        if (v == unitInfo.min)
          return 'min'
        else if (v == unitInfo.max)
          return 'max'
        
        const scaled = (Number(v) - Number(unitInfo.min)) / (Number(unitInfo.max) - Number(unitInfo.min)) * 100
        return scaled.toString() + "%"
      }

      const rangeValues = keys(unitInfo.values)
      const scaledPairs = rangeValues.map((v) => [rescale(v), Number(v)])
      const scaledRange = fromPairs(scaledPairs)
      const pipValues = keys(unitInfo.values).map((v) => Number(v))

      return {
        id: serialize(key, unitInfo.unit, '-slider-'),
        object: {
          start: [unitInfo.min, unitInfo.max],
          snap: true,
          connect: true,
          orientation: 'horizontal',
          range: scaledRange,
          pips: {
            mode: 'values',
            values: pipValues,
            density: 4,
            stepped: true
          }
        }
      }
    }

    const createSliderDriverObjectSteppedUniformSpaced = (key, unitInfo) => {

      const rescale = (v, index, total) => {
        if (v == unitInfo.min)
          return 'min'
        else if (v == unitInfo.max)
          return 'max'
        
        const scaled = (index - 1) / (total - 1) * 100
        return scaled.toString() + "%"
      }

      const rangeValues = keys(unitInfo.values)
      const scaledPairs = rangeValues.map((v, i) => [rescale(v, i, length(rangeValues)), Number(v)])
      const scaledRange = fromPairs(scaledPairs)
      const pipValues = keys(unitInfo.values).map((v) => Number(v))

      return {
        id: serialize(key, unitInfo.unit, '-slider-'),
        object: {
          start: [unitInfo.min, unitInfo.max],
          snap: true,
          connect: true,
          orientation: 'horizontal',
          range: scaledRange,
          pips: {
            mode: 'values',
            values: pipValues,
            density: 4,
            stepped: true
          }
        }
      }
    }

    const slider$ = thisFilterInfo$
      .map((info) => xs.fromArray(info.values))
      .compose(flattenConcurrently)
      .filter((unitInfo) => unitInfo.hasRange)
      .map((unitInfo) => createSliderDriverObjectStepped(key, unitInfo))

    return {
        DOM: vdom$,
        slider: slider$,
    }
}



// const composedFilterInfo = {
//   'field1': {
//     hasUnits: false,
//     hasRange: false,
//     min: 0,
//     max: 0,
//     values: [
//       { unit: '', values: {'a': 3, 'b': 2, 'c': 2, 'd': 3}, hasRange: false, min: 0, max: 0, amount: 10 },
//     ]
//   },
//   'field2': {
//     hasUnits: true,
//     hasRange: true, // only true if all units have 'hasRange' == true
//     min: 0.001, // minimum of all values
//     max: 100,
//     values: [
//       { unit: 'unit1', values: {0.001: 2, 0.01: 2, 0.1: 3, 1: 3}, hasRange: true, min: 0.001, max: 1, amount: 10 },
//       { unit: 'unit2', values: {10: 5, 100: 5}, hasRange: true, min: 10, max: 100, amount: 10 },
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
      hasRange: isAllNumbers && length(keys(counts)) >= 3,
      min: minValue,
      max: maxValue,
      amount: length(arr),
    }
  }

  const dataKeys = keys(data[0]).filter((v) => v != 'use')

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
        ? apply(Math.min, unitValuesArr.map(prop("min")))
        : 0
      const allMaxValue = allHasRange
        ? apply(Math.max, unitValuesArr.map(prop("max")))
        : 0

      return {
        [dataKey]: {
          hasUnits: true,
          hasRange: allHasRange,
          min: allMinValue,
          max: allMaxValue,
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
          min: values.min,
          max: values.max,
          values: [values],
        },
      }
    }
  })

  // go from array of objects { 'key': {...} } to single object { 'key1': {...}, 'key2': {...} }
  const reducer = (acc, value) => ({ ...acc, ...value })
  const result = reduce(reducer, {}, mappedDataArr)
  return result
}


function intent(domSource$) {

  const useValueClick$ = domSource$.select(".selection-list")
  .events("click", { preventDefault: true })
  .map((ev) => ev.ownerTarget.id)

  return {
    useValueClick$: useValueClick$
  }
}

function model(state$, useClick$, sliderEvents$) {
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
      const nestedRange = value.values.map((valuesPerUnit) => valuesPerUnit.hasRange ? [{ type: 'range', min: valuesPerUnit.min, max: value.max, unit: valuesPerUnit.unit }] : [])
      const flattenedValues = flatten(nestedValues.concat(nestedRange)) // tag on nestedRange, either empty array or array with single object

      return [key, flattenedValues]
    })

    const filterData = fromPairs(filterDataPairs)
    return filterData
  })

  const updateFilterData = (key, unit, value, prevFilterData) => {
    const keyLens = lensProp(key)
    const matcher = whereEq({ type: 'value', unit: unit, value: value })
    const toggleUse = (v) => ({ ...v, use: !v.use })

    const currentFilterDataKey = viewR(keyLens, prevFilterData)
    const index = findIndex( matcher )(currentFilterDataKey)
    
    // if value not found, return unchanged state
    if (index < 0)
      return prevFilterData

    const currentFilterDataOnlyKeyUpdatedValue = adjust(index, toggleUse, currentFilterDataKey )
    const updatedFilterData = set(keyLens, currentFilterDataOnlyKeyUpdatedValue, prevFilterData)
    return updatedFilterData
  }

  const updateSliderFilterData = (key, unit, sliderValue, sliderHandle, prevFilterData) => {
    const keyLens = lensProp(key)
    const matcher = whereEq({ type: 'range', unit: unit })
    const changeRanges = (v) => ({ ...v, min: sliderValue[0], max: sliderValue[1] })

    const currentFilterDataKey = viewR(keyLens, prevFilterData)
    const index = findIndex( matcher )(currentFilterDataKey)
    
    // if value not found, return unchanged state
    if (index < 0)
      return prevFilterData

    const currentFilterDataOnlyKeyUpdatedValue = adjust(index, changeRanges, currentFilterDataKey )
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
    }
  })

  const sliderFilterDataReducer$ = sliderEvents$.map((ev) => (prevState) => {
    const [key, unit, _] = deserialize(ev.id)
    const filterData = updateSliderFilterData(key, unit, ev.value, ev.handle, prevState.core.filterData)
    return {
      ...prevState,
      core: {
        filterInfo: prevState.core.filterInfo,
        filterData: filterData,
      }
    }
  })

  const filterRangeChanged = (rangeValue, key, filterInfo) => {
    if (length(keys(filterInfo)) == 0)
      return false

    const thisFilterInfo = find((v) => v.unit == rangeValue.unit, filterInfo[key]?.values ?? [])
    if (thisFilterInfo == undefined) {
      console.warn("unexpected result of filtering range information")
      console.log('rangeValue', rangeValue)
      console.log('key', key)
      console.log('filterInfo', filterInfo)
      return false
    }
    return (rangeValue.min != thisFilterInfo.min) || (rangeValue.max != thisFilterInfo.max)
  }

  const filterOutput$ = xs
    .combine(filterData$,filterInfo$)
    .map(([dataObject, info]) => [toPairs(dataObject), info])
    .map(([arr, info]) => [arr.map(([key, values]) => [ key, filter( (v) => (v?.type != 'value') || v?.use , values) ]), info]) // don't use 'type' == 'value' when 'use' is false
    .map(([arr, info]) => [arr.map(([key, values]) => [ key, filter( (v) => (v?.type != 'range') || filterRangeChanged(v, key, info) , values) ]), info]) // don't use 'type' == 'range' when min & max are same as in FilterInfo
    .map(([dataPairs, info]) => fromPairs(dataPairs))

  return {
    filterInfo$: filterInfo$,
    filterData$: filterData$,
    filterOutput$: filterOutput$,
    onion: xs.merge(
      defaultReducer$,
      filterInfoReducer$,
      initFilterDataReducer$,
      filterDataReducer$,
      sliderFilterDataReducer$,
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
  const state$ = sources.onion.state$
  const sliderEvents$ = sources.slider

  const intent_ = intent(sources.DOM)
  const model_ = model(state$, intent_.useValueClick$, sliderEvents$)

  const childrenSinks$ = model_.filterInfo$
    .map((filterInfo) => 
      keys(filterInfo).map((key) => 
        SingleSampleSelectionFilter(key, model_.filterInfo$, model_.filterData$)))
    .remember()

  const vdom$ = view(childrenSinks$)
  
  const sliderDriver$ = childrenSinks$.compose(pick('slider')).compose(mix(xs.merge))

  return {
    log: xs.empty(),
    DOM: vdom$,
    onion: model_.onion,
    slider: sliderDriver$.compose(delay(10)),
    output: model_.filterOutput$,
  }
}

export { SampleSelectionFilters, SampleSelectionFiltersLens }
