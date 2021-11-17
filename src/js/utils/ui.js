import { equals } from "ramda"
import xs from "xstream"
import dropRepeats from "xstream/extra/dropRepeats"
import debounce from 'xstream/extra/debounce'

import { div, p } from "@cycle/dom"

// Check committed output of a component with the intermediate value.
// If these are not the same then it suggests that the user made a change, hence the state is dirty.
function dirtyUiStream(output$, current$) {
    return xs.combine(output$, current$)
        .map(([output, current]) => !equals(output, current))
        .compose(debounce(10))
        .compose(dropRepeats(equals))
        .startWith(false)
}

// Reducer dedicated to outputting the dirty state of a component into the component onion
export function dirtyUiReducer(output$, current$) {

    const dirty$ = dirtyUiStream(output$, current$)

    return dirty$.map((dirty) => (prevState) => ({
        ...prevState,
        core: {...prevState.core, dirty: dirty },
        }))
}

// Reducer dedicated to outputting the busy state of a component into the component onion
export function busyUiReducer(start$, finished$) {
  
  const busy$ = xs.merge(start$.mapTo(true), finished$.mapTo(false))
  
  return busy$.map((busy) => (prevState) => ({
    ...prevState,
    core: {...prevState.core, busy: busy },
    }))
}

// Provide wrapper that encapsulates the inner portion with an extra div that sets opacity
// Supports setting 'debugName' which adds an extra div with text in it to display the current dirty state on the vdom
function dirtyWrapper(dirty, inner, debugName) {
    const withDebug = (
      div(dirty ? '.disabled' : '.enabled', { style: { opacity: dirty ? 0.2 : 1.0 } },[
        div('.card .orange .lighten-3', [ p('.center', debugName + " dirty: " + dirty) ]),
        inner
      ])
    )

    const withoutDebug = (
        div(dirty ? '.disabled' : '.enabled', { style: { opacity: dirty ? 0.2 : 1.0 } },[
          inner
        ])
      )

    return (debugName === undefined) ? withoutDebug : withDebug
}

// Provide wrapper that encapsulates the inner portion with an extra div that sets opacity
// Assumes state$ to be the default component onion which includes _.ui.dirty
// inner$ is a stream with the regular component UI
// Supports setting 'debugName' which adds an extra div with text in it to display the current dirty state on the vdom
export function dirtyWrapperStream(state$, inner$, debugName) {
    return xs.combine(state$, inner$)
    .map(([state, inner]) => dirtyWrapper( (state.ui ?? {}).dirty ?? false, inner, debugName))
}
