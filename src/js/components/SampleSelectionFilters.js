import xs from "xstream"
import { div, label, input, button, span, i } from "@cycle/dom"
import { pick, mix } from 'cycle-onionify';
import {
  prop,
  keys,
  length,
  includes,
  filter,
  uniq,
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
  view as viewR,
  find,
  whereEq,
  sum,
  any,
} from "ramda"
import dropRepeats from "xstream/extra/dropRepeats";
import flattenConcurrently from 'xstream/extra/flattenConcurrently'
import SampleCombine from 'xstream/extra/sampleCombine'
import delay from "xstream/extra/delay"
import debounce from "xstream/extra/debounce"
import pairwise from "xstream/extra/pairwise"

/**
 * @module components/SampleSelectionFilters
 */

const SampleSelectionFiltersLens = {
  get: (state) => ({
    core: {
      data: state.core.data,
      filterData: state.core?.sampleSelectionFilters?.filterData,
      filterInfo: state.core?.sampleSelectionFilters?.filterInfo,
      stateData: state.core?.sampleSelectionFilters?.stateData,
    }
  }),
  set: (state, childState) => ({
    ...state,
    core: {
      ...state.core,
      sampleSelectionFilters: {
        filterData: childState.core?.filterData,
        filterInfo: childState.core?.filterInfo,
        stateData: childState.core?.stateData,
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

function SingleSampleSelectionFilter(key, filterInfo$, filterData$, stateData$, filterConfig) {

    const thisFilterInfo$ = filterInfo$.map((info) => info[key])
    const thisFilterData$ = filterData$.map((data) => data[key])
    const thisFilterConfig = filterConfig[key]
   
    const valueElements = (key, unitInfo, filterData) => {

      const list = toPairs(unitInfo.values).map(([value, amount]) => {
        
        var use = false
        const matcher = whereEq({ type: 'value', unit: unitInfo.unit, value: value })
        if (filterData?.length > 0) {
          const data = find( matcher )(filterData)
          use = data?.use
        }

        return div(".collection-item", { props: { id: serialize(key, unitInfo.unit, value) }}, [
          label("", [
              input(
                  ".selection-cb",
                  { props: { type: "checkbox", checked: use } },
                  "tt"
              ),
              span(value),
              span(" "),
              span("(" + amount + ")"),
              ]),
        ])
      })

      return div(".sampleSelectionFilter-" + key + "-checkboxes", [
          div(".collection .selection", list)
      ])
    }

    const sliderElements = (key, unitInfo, filterData) => {
      const slider2Exists = any(whereEq( { type: 'range', unit: unitInfo.unit, id:1 } ), filterData ?? [])
      const sliderDiv = div(".sampleSelectionFilter-" + key + "-sliders .row", [
        div(".col.s11 .sampleSelectionFilterSlider", { props: { id: serialize(key, unitInfo.unit, '-slider-')}}),
        div(".col.s1",
          unitInfo.allowDoubleRange 
          ? [button(".btn-flat .sampleSelectionRangeSwitch",
                { props: { id: serialize(key, unitInfo.unit, '-rangeswitch-')}}, 
                i(
                  ".material-icons .grey-text",
                  slider2Exists ? "remove" : "add"
                )
            )]
          : []
        )
      ])

      return unitInfo.hasRange ? sliderDiv : div()
    }

    const createFilter = (key, info, filterData, stateData, filterConfig) => {

      const mappedInfo = flatten(info.values.map((unitInfo) => {

        const showValues = filterConfig?.values != 'hide'
        const hasRange = any(whereEq( { type: 'range', unit: unitInfo.unit } ), filterData ?? [])
        const showRange = filterConfig?.range != 'hide' && hasRange

        const unitValuePairs = toPairs(unitInfo.values)
        const firstDataChunk = { ...unitInfo, values: fromPairs(unitValuePairs.filter((_, i) => i < unitValuePairs.length / 2)) }
        const secondDataChunk = { ...unitInfo, values: fromPairs(unitValuePairs.filter((_, i) => i >= unitValuePairs.length / 2)) }

        const thisStateData = stateData[serialize(key, unitInfo.unit, "")]?.state // open (true) or closed (false)
        // any filter value or range set? if so set class so css coloring can be set
        const filterDeselectedValues = filter(whereEq( { type: 'value', unit: unitInfo.unit, use: false } ), filterData ?? [])
        const filterRange = find(whereEq( { type: 'range', unit: unitInfo.unit, id: 0 } ), filterData ?? [])
        const filterRange2 = find(whereEq( { type: 'range', unit: unitInfo.unit, id: 1 } ), filterData ?? [])

        const hasFilterRange = 
          filterRange == undefined
            ? false // no range filters
            : filterRange2 == undefined // 1 or 2 range filters
              ? filterRange.min != unitInfo.min || filterRange.max != unitInfo.max
              : filterRange.min != unitInfo.min || filterRange.max != filterRange2.min || filterRange2.max != unitInfo.max

        const activeFilterClass = 
          (filterDeselectedValues.length > 0
            ? " .activeValueFilter"
            : ""
          )
          + (hasFilterRange
            ? " .activeRangeFilter"
            : ""
          )

        const filterElements = []
          .concat(
            showValues
              ? [
                  div(".col.l6.s12", valueElements(key, firstDataChunk, filterData)),
                  div(".col.l6.s12", valueElements(key, secondDataChunk, filterData))
                ]
              : []
          )
          .concat(
            showRange
            ? [div(".col .s12", sliderElements(key, unitInfo, filterData))]
            : []
          )
        
        return showValues || showRange
          ? thisStateData
            ? [
              div(".col .s12.m4.l2", div(".chip .sampleSelectionFilterHeader" + activeFilterClass, { props: { id: serialize(key, unitInfo.unit, "-header-") } } , [span(key), span(" "), span(unitInfo.unit)])),
              div(".col .s12", filterElements)
              ]
            : [
              div(".col .s12.m4.l2", div(".chip .sampleSelectionFilterHeader" + activeFilterClass, { props: { id: serialize(key, unitInfo.unit, "-header-") } } , [span(key), span(" "), span(unitInfo.unit)])),
              ]
          : []
      }))

      return mappedInfo
    }
    
    const vdom$ = xs
      .combine(
        thisFilterInfo$,
        thisFilterData$,
        stateData$,
      )
      .map(([info, filterData, stateData]) => createFilter(key, info, filterData, stateData, thisFilterConfig))

    const createSliderDriverObject = (key, unitInfo, minValue, maxValue, minValue2, maxValue2) => {
      const scale = (v) => (Number(v) - Number(unitInfo.min)) / (Number(unitInfo.max) - Number(unitInfo.min))
      const rescale = (v) => {
        if (v == unitInfo.min)
          return 'min'
        else if (v == unitInfo.max)
          return 'max'
        
        const scaled = scale(v) * 100
        return scaled.toString() + "%"
      }

      const rangeValues = keys(unitInfo.values).sort((a, b) => Number(a) - Number(b)) // All values numerically sorted
      const rangeNumberValues = rangeValues.map((v) => Number(v)) // All values as numbers
      const scaledRange = fromPairs(rangeNumberValues.map((v) => [rescale(v), v])) // All values as dict: scaled -> value
      const formatLookupDict = fromPairs(rangeValues.map((v) => [Number(v), v])) // All values as dict: Number -> original string
      
      const showPipValues = rangeNumberValues.reduce((acc, v, index, arr) => 
        (index == 0) || ((scale(v) - scale(acc.slice(-1)[0]) >= 0.1) && (scale(v) <= 0.9)) || (index == length(arr) - 1)
        ? acc.concat(v)
        : acc,
        []) // Only values that are either first, far enough from others, or last => Spacy
      const formatLookupDictPips = fromPairs(rangeValues.map((v) => 
        [
          Number(v), 
          includes(Number(v), showPipValues) ? v : ""
        ])) // All values as dict: Number -> original string (spacy) or empty string (non-spacy)

      // Formatter to convert all values as original strings, provide fallback
      const formatLookup = { to: (v) => formatLookupDict[v] ?? v.toFixed(2), from: (v) => v }
      // Formatter to convert spacy values as original strings, provide fallback
      const formatLookupPips = { to: (v) => formatLookupDictPips[v] ?? v.toFixed(2), from: (v) => v }

      const doubleRange = minValue2 != undefined && maxValue2 != undefined
      const minValueWDefault = minValue ?? unitInfo.minValue
      const maxValueWDefault = maxValue  ?? unitInfo.maxValue
      const minValueWDefault2 = minValue2 ?? unitInfo.maxValue
      const maxValueWDefault2 = maxValue2 ?? unitInfo.maxValue

      const startRange = doubleRange  ? [minValueWDefault, maxValueWDefault, minValueWDefault2, maxValueWDefault2] : [minValueWDefault, maxValueWDefault]
      const connect = doubleRange  ? [false, true, false, true, false] : true

      return {
        id: serialize(key, unitInfo.unit, '-slider-'),
        object: {
          start: startRange,
          snap: true,
          connect: connect,
          orientation: 'horizontal',
          range: scaledRange,
          format: formatLookup,
          pips: {
            mode: 'values',
            values: rangeNumberValues,
            density: 100,
            stepped: true,
            format: formatLookupPips,
          }
        }
      }
    }

    const sliderInfo$ = thisFilterInfo$
      .map((info) => xs.fromArray(info.values))
      .compose(flattenConcurrently)
      .filter((unitInfo) => unitInfo.hasRange)
    const sliderData$ = thisFilterData$
      .map((dataArr) => find(whereEq( { type: "range", id: 0 } ), dataArr ?? []))
    const sliderData2$ = thisFilterData$
      .map((dataArr) => find(whereEq( { type: "range", id: 1 } ), dataArr ?? []))
    const sliderObject$ = xs
      .combine(sliderInfo$, sliderData$, sliderData2$)
      .map(([unitInfo, unitData, unitData2]) => createSliderDriverObject(key, unitInfo, unitData?.min, unitData?.max, unitData2?.min, unitData2?.max))

    const slider$ = stateData$
      .compose(debounce(10))
      .compose(dropRepeats(equals))
      .compose(SampleCombine(sliderObject$))
      .map(([states, sliderObject]) => {
        const [sliderKey, sliderUnit, _] = deserialize(sliderObject.id)
        const filterId = serialize(sliderKey, sliderUnit, '')
        return {
          ...sliderObject,
          shown: states[filterId]?.state ?? false
        }
      })

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

/**
 * Create an object that specifies what filters can be created
 * @param {Object} data Master data that needs to be analyzed on how it can be filtered
 * @returns {Object}
 */
const composeFilterInfo = (data) => {
  // we need at least 1 data entry to be able to compose the data types that will be present in the data
  if (length(data) == 0) return {}

  const getValueStruct = (unit, arr) => {
    const counts = countBy(identity, arr)
    const isAllNumbers = none(isNaN, arr)
    const allIntegers = any(Number.isInteger, arr)
    const minValue = isAllNumbers ? apply(Math.min, arr) : 0
    const maxValue = isAllNumbers ? apply(Math.max, arr) : 0
    const valueOptions = length(keys(counts))
    return {
      unit: unit,
      values: counts,
      hasRange: isAllNumbers && valueOptions >= 3,
      allowDoubleRange: isAllNumbers && valueOptions >= 5,
      allIntegers: allIntegers,
      min: minValue,
      max: maxValue,
      amount: length(arr),
      valueOptions: valueOptions,
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
      const valueOptions = sum(unitValuesArr.map(prop("valueOptions")))

      return [
        dataKey, {
          hasUnits: true,
          hasRange: allHasRange,
          min: allMinValue,
          max: allMaxValue,
          values: unitValuesArr,
          valueOptions: valueOptions,
        },
      ]
    } else {
      const arr = data.map(prop(dataKey))
      const values = getValueStruct("", arr)

      return [
        dataKey, {
          hasUnits: false,
          hasRange: values.hasRange,
          min: values.min,
          max: values.max,
          values: [values],
          valueOptions: values.valueOptions,
        },
      ]
    }
  })

  const result = fromPairs(mappedDataArr.filter(([k, v]) => v.valueOptions > 1))
  return result
}


function intent(domSource$) {

  const useValueClick$ = domSource$.select(".collection-item")
    .events("click", { preventDefault: true })
    .map((ev) => ({id: ev.ownerTarget.id, modifier: ev.altKey}))

  const headerClick$ = domSource$.select(".sampleSelectionFilterHeader")
    .events("click")
    .map((ev) => ev.ownerTarget.id)

  const switchRangeClick$ = domSource$.select(".sampleSelectionRangeSwitch")
    .events("click")
    .map((ev) => ev.ownerTarget.id)

  return {
    useValueClick$: useValueClick$,
    headerClick$: headerClick$,
    switchRangeClick$: switchRangeClick$,
  }
}

function model(state$, intents, sliderEvents$) {
  const filterInfo$ = state$
    .map((state) => composeFilterInfo(state.core.data))
    .compose(dropRepeats(equals))
    .remember()

  const defaultReducer$ = xs.of((prevState) => ({
    ...prevState,
    core: {
      filterData: {},
      filterInfo: {},
      state: {},
    }
  }))

  /**
   * Convert incoming filter information (base information) to filter data (how filters are configured)
   * @const modelInitialFilterData$
   * @type {Stream}
   */
  const initialFilterData$ = filterInfo$.map((filterInfo) => {

    const filterDataPairs = toPairs(filterInfo).map(([key, value]) => {
      const nestedValues = value.values.map((valuesPerUnit) => keys(valuesPerUnit.values).map((v) => ({ type: 'value', value: v, unit: valuesPerUnit.unit, use: true })))
      const nestedRange = value.values.map((valuesPerUnit) => valuesPerUnit.hasRange 
        ? [{ type: 'range', min: valuesPerUnit.min, max: valuesPerUnit.max, unit: valuesPerUnit.unit, id: 0 }] 
        : [])
      const flattenedValues = flatten(nestedValues.concat(nestedRange)) // tag on nestedRange, either empty array or array with single object

      return [key, flattenedValues]
    })

    const filterData = fromPairs(filterDataPairs)
    return filterData
  })

  /**
   * Toggle single or all values because user clicked a value without or with the modifier key
   * @const model/updateFilterData
   * @param {String} key identifier for what values to update
   * @param {String} unit identifier for what values to update
   * @param {String} value identifier for what single value to update or ignored in case modifier is used
   * @param {Boolean} modifier modifier key being pressed or not (toggle single or all values)
   * @param {Object} prevFilterData data to be updated
   * @returns {Object} updated data 
   */
  const updateFilterData = (key, unit, value, modifier, prevFilterData) => {
    const keyLens = lensProp(key)
    // if modifier key is pressed, toggle all data points that match this key & unit, otherwise toggle single data point matching key, unit and value
    const matcher = modifier
      ? whereEq({ type: 'value', unit: unit })
      : whereEq({ type: 'value', unit: unit, value: value })
    const toggleUse = (v) => ({ ...v, use: !v.use })
    const matchToggle = (v) => matcher(v) ? toggleUse(v) : v

    const currentFilterDataKey = viewR(keyLens, prevFilterData)
    const currentFilterDataOnlyKeyUpdatedValue = currentFilterDataKey.map((data) => matchToggle(data))
    const updatedFilterData = set(keyLens, currentFilterDataOnlyKeyUpdatedValue, prevFilterData)
    return updatedFilterData
  }

  /**
   * Update range min & max values
   * @const model/updateSliderFilterData
   * @param {String} key identifier for what range to update
   * @param {String} unit identifier for what range to update
   * @param {Array} sliderValue array of the slider values, either 2 or 4 values
   * @param {String} sliderHandle id of the DOM slider
   * @param {Object} prevFilterData data to be updated
   * @returns {Object} updated data
   */
  const updateSliderFilterData = (key, unit, sliderValue, sliderHandle, prevFilterData) => {
    const keyLens = lensProp(key)
    const matcher = whereEq({ type: 'range', unit: unit, id: 0 })
    const changeRanges = (v) => ({ ...v, min: sliderValue[0], max: sliderValue[1] })
    const matchUpdate = (v) => matcher(v) ? changeRanges(v) : v

    // 2nd slider for this key/unit
    const matcher2 = whereEq({ type: 'range', unit: unit, id: 1 })
    const changeRanges2 = (v) => ({ ...v, min: sliderValue[2], max: sliderValue[3] })
    const matchUpdate2 = (v) => matcher2(v) ? changeRanges2(v) : v

    const currentFilterDataKey = viewR(keyLens, prevFilterData)
    const currentFilterDataOnlyKeyUpdatedValue = currentFilterDataKey.map((data) => matchUpdate(data))
    const currentFilterDataOnlyKeyUpdatedValue2 = currentFilterDataOnlyKeyUpdatedValue.map((data) => matchUpdate2(data))
    const updatedFilterData = set(keyLens, currentFilterDataOnlyKeyUpdatedValue2, prevFilterData)

    return updatedFilterData
  }

  /**
   * Store incoming (master) data
   * @const model/filterInfoReducer$
   * @type {Reducer}
   */
  const filterInfoReducer$ = filterInfo$.map((filterInfo) => (prevState) => ({
    ...prevState,
    core: {
      ...prevState.core,
      filterInfo: filterInfo,
    }
  }))

  /**
   * Store new filterData when new data arrives
   * @const model/initFilterDataReducer$
   * @type {Reducer}
  */
  const initFilterDataReducer$ = initialFilterData$.map((filterData) => (prevState) => ({
    ...prevState,
    core: {
      ...prevState.core,
      filterData: filterData,
    }
  }))

  /**
   * Create new stateData (filter open/closed, 1/2 slider mode) from updated (master) filter data
   * @const model/initStateDataReducer$
   * @type {Reducer}
   */
  const initStateDataReducer$ = initialFilterData$.map((filterData) => (prevState) => {
    const newStateDataHeaders = uniq(flatten(toPairs(filterData).map(([key, value]) => value.map((v) => serialize(key, v.unit, "")))))
    // if already exists, use old state value, otherwise set to false (closed)
    const updatedStateData = fromPairs(newStateDataHeaders.map((h) => [h, 
      {
        state: prevState.core.stateData[h]?.state ?? false,
        mode:  prevState.core.stateData[h]?.mode ?? 1,
      }
    ]))
    return {
      ...prevState,
      core: {
        ...prevState.core,
        stateData: updatedStateData,
      }
    }
  })

  /**
   * Get event from DOM and update the filter state being open or closed
   * @const model/stateDataReducer$
   * @type {Reducer}
   */
  const stateDataReducer$ = intents.headerClick$.map((id) => (prevState) => {
    const [key, unit, _] = deserialize(id)
    const filterId = serialize(key, unit, '')
    return {
    ...prevState,
    core: {
      ...prevState.core,
      stateData: {
        ...prevState.core.stateData,
        [filterId]: {
          state: !prevState.core.stateData[filterId].state,
          mode: prevState.core.stateData[filterId].mode,
        }
      }
    }
  }})

  /**
   * Get event from DOM and update filter range mode in stateData
   * @const model/stateDataSliderReducer$
   * @type {Reducer}
   */
  const stateDataSliderReducer$ = intents.switchRangeClick$.map((id) => (prevState) => {
    const [key, unit, _] = deserialize(id)
    const filterId = serialize(key, unit, '')
    return {
    ...prevState,
    core: {
      ...prevState.core,
      stateData: {
        ...prevState.core.stateData,
        [filterId]: {
          state: prevState.core.stateData[filterId].state,
          mode: prevState.core.stateData[filterId].mode == 1 ? 2 : 1
        }
      }
    }
  }})

  const stateData$ = state$.map((state) => state.core.stateData)
  const filterData$ = state$.map((state) => state.core.filterData)

  /**
   * Get event from DOM and update the filterData with the updated values
   * @const model/filterDataReducer$
   * @type {Reducer}
   */
  const filterDataReducer$ = intents.useValueClick$.map((ev) => (prevState) => {
    const [key, unit, value] = deserialize(ev.id)
    const filterData = updateFilterData(key, unit, value, ev.modifier, prevState.core.filterData)
    return {
      ...prevState,
      core: {
        ...prevState.core,
        filterData: filterData,
      }
    }
  })

  /**
   * Get event from DOM and update the filterData with the updated values
   * @const model/sliderFilterDataReducer$
   * @type {Reducer}
   */
  const sliderFilterDataReducer$ = sliderEvents$.map((ev) => (prevState) => {
    const [key, unit, _] = deserialize(ev.id)
    const filterData = updateSliderFilterData(key, unit, ev.value, ev.handle, prevState.core.filterData)
    return {
      ...prevState,
      core: {
        ...prevState.core,
        filterData: filterData,
      }
    }
  })

  /**
   * Convert stateData object to stream of changes in the mode values
   * Stream consists of key, value pairs
   * @const model/sliderSwitchRange$
   * @type {Stream}
   */
  const sliderSwitchRange$ = stateData$
    .map((v) => toPairs(v))
    .map((arr) => arr.map(([k, v]) => [k, v.mode]))
    .map((arr) => fromPairs(arr))
    .compose(pairwise)
    .map(([a, b]) => filter(([k, v]) => v != a[k], toPairs(b)))
    .map((a) => xs.fromArray(a))
    .compose(flattenConcurrently)

  /**
   * Starting from an id/mode-value pair, change between 1 or 2 sliders in filterData
   * @const model/sliderSwitchRangeReducer$
   * @type {Reducer}
   */
  const sliderSwitchRangeReducer$ = sliderSwitchRange$.map(([id, mode]) => (prevState) => {
    const [key, unit, _] = deserialize(id)
    const prevFilterData = prevState.core.filterData

    const keyLens = lensProp(key)
    const currentFilterDataKey = viewR(keyLens, prevFilterData)
    
    const unitInfo = find(whereEq( { unit: unit } ), prevState.core.filterInfo[key].values)
    const rangeValues = keys(unitInfo.values).sort((a, b) => Number(a) - Number(b)) // All values numerically sorted
    const middleValue1 = Number(rangeValues[~~(unitInfo.valueOptions/4)])
    const middleValue2 = Number(rangeValues[~~(unitInfo.valueOptions*3/4)])

    const rangesArr = !unitInfo.hasRange
      ? []
      : mode == 2 && unitInfo.allowDoubleRange
        ? [
            { type: 'range', min: unitInfo.min, max: middleValue1, unit: unit, id: 0 },
            { type: 'range', min: middleValue2, max: unitInfo.max, unit: unit, id: 1 },
          ]
        : [ { type: 'range', min: unitInfo.min, max: unitInfo.max, unit: unit, id: 0 } ]

    const thisFilterDataWithoutRanges = filter((f) => f?.type != 'range', currentFilterDataKey)
    const currentFilterDataKeyUpdatedValue = thisFilterDataWithoutRanges.concat(rangesArr)

    const updatedFilterData = set(keyLens, currentFilterDataKeyUpdatedValue, prevFilterData)

    return {
      ...prevState,
      core: {
        ...prevState.core,
        filterData: updatedFilterData,
      }
    }
  })

  /**
   * Remove data without actual used filters
   * 
   * Removes data with either all values are selected or ranges are full range
   * @param {Array} keyValuePairs 
   * @param {Object} info 
   * @returns {Array} array of key/value pairs
   */
  const filterUnits = (keyValuePairs, info) => {
    function filterData(data, info) {
      if (info == undefined)
        return data

      const filteredUnitData = info.values.map((unitInfo) => {
        const unitData = filter(whereEq( { unit: unitInfo.unit } ), data) // get data from only matching unit, still contains both 'value' and 'range' types
        const unitValues = filter(whereEq( { type: 'value' } ), unitData).map((v) => v.value) // only keep 'value' type and map to only value type so we have a flat list of values
        const unitInfoValues = keys(unitInfo.values) // get flat list of values from unitInfo
        const noChangeInValues = equals(unitValues, unitInfoValues)

        const range = find(whereEq( { type: 'range', id: 0 } ), unitData)
        const range2 = find(whereEq( { type: 'range', id: 1 } ), unitData)

        const useRange = range == undefined
          ? false // no range
          : range2 == undefined
            ? range.min != unitInfo.min || range.max != unitInfo.max // single range mode
            : range.min != unitInfo.min || range.max != range2.min || range2.max != unitInfo.max // double range mode
        
        return []
          .concat(filter((v) => v.type == 'value' && !noChangeInValues, unitData))
          .concat(filter((v) => v.type == 'range' && useRange, unitData))
      })

      return flatten(filteredUnitData)
    }
    const filteredData = keyValuePairs.map(([key, value]) => [ key, filterData(value, info[key]) ])
    return filteredData
  }

  /**
   * Minimize filters to actually set/changed filters
   * @const model/filterOutputs$
   * @type {Stream}
   */
  const filterOutput$ = xs
    .combine(filterData$, filterInfo$)
    .map(([dataObject, info]) => [toPairs(dataObject), info]) // split object to an array of key/value pairs
    .map(([arr, info]) => [arr.map(([key, values]) => [ key, filter( (v) => (v?.type != 'value') || v?.use , values) ]), info]) // don't use 'type' == 'value' when 'use' is false
    .map(([arr, info]) => [filterUnits(arr, info), info]) // filter data per key & unit if either it has all values selected or range is full range
    .map(([arr, info]) => [filter(([key, values]) => length(values) != 0, arr), info]) // remove a key if there is no more data left
    .map(([dataPairs, info]) => fromPairs(dataPairs)) // rebuild to an object

  return {
    filterInfo$: filterInfo$,
    filterData$: filterData$,
    filterOutput$: filterOutput$,
    stateData$: stateData$,
    onion: xs.merge(
      defaultReducer$,
      filterInfoReducer$,
      initFilterDataReducer$,
      initStateDataReducer$,
      stateDataReducer$,
      stateDataSliderReducer$,
      filterDataReducer$,
      sliderFilterDataReducer$,
      sliderSwitchRangeReducer$,
      ),
  }
}

function view(childrenSinks$) {

  const composedChildrenSinks$ = childrenSinks$.compose(pick('DOM')).compose(mix(xs.combine))

  const vdom$ = composedChildrenSinks$
    .map((arr) => flatten([].concat(arr)))
    .map((arr) =>
      div(
        ".sampleSelectionFilters .col .s10 .offset-s1",
        div(".row",
          div(div(".col .s12", arr))
        )
      )
    )
    .startWith(div())

  return vdom$
}

function SampleSelectionFilters(sources) {
  const state$ = sources.onion.state$
  const sliderEvents$ = sources.slider

  const intent_ = intent(sources.DOM)
  const model_ = model(state$, intent_, sliderEvents$)

  const filterConfig = {
    significantGenes: {
      values: 'hide',
      range: 'show',
    },
    inchikey: {
      values: 'hide',
      range : 'hide',
    },
    smiles: {
      values: 'hide',
      range: 'hide',
    },
    id: {
      values: 'hide',
      range: 'hide',
    }
  }

  const childrenSinks$ = model_.filterInfo$
    .map((filterInfo) => 
      keys(filterInfo).map((key) => 
        SingleSampleSelectionFilter(key, model_.filterInfo$, model_.filterData$, model_.stateData$, filterConfig)))
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
