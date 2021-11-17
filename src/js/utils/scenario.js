import xs from "xstream"
import { mergeDeepRight, mergeDeepWithKey } from "ramda"
import delay from "xstream/extra/delay"
import concat from "xstream/extra/concat"

/**
 * We expect the following input for the right-hand side:
 *
 * {index_in_array: {new object value}}
 */
const updateData = (k, l, r) =>
  k == "data"
    ? l.map((el, i) => (i == r.index ? mergeDeepRight(el, r.value) : el))
    : r

/**
 * Helper function to run scenarios.
 *
 * The hardest part is providing the new state and merging that to the previous one.
 * Especially for Arrays, because we don't want to provide the full array in every step.
 */
export const runScenario = (scenario) => {
  const scenarioStreamArray = scenario.map((step) =>
    xs.of(step).compose(delay(step.delay))
  )

  const reducerStreamArray = scenarioStreamArray.map((step$) =>
    step$.map(
      (step) => (prevState) =>
        mergeDeepWithKey(updateData, prevState, step.state)
    )
  )
  const popupStreamArray = scenarioStreamArray.map((step$) =>
    step$.map((step) => step.message)
  )

  const reducer$ = concat(...reducerStreamArray)

  const popup$ = concat(...popupStreamArray)

  return {
    scenarioReducer$: reducer$,
    scenarioPopup$: popup$,
  }
}
