import xs from 'xstream'
import { merge, prop, equals, mergeAll, mergeWith, mergeDeepRight } from 'ramda';
import delay from 'xstream/extra/delay'
import concat from 'xstream/extra/concat'


export const runScenario = (scenario) => {

    const scenarioStreamArray = scenario.map(step => xs.of(step).compose(delay(step.delay)))

    const reducerStreamArray = scenarioStreamArray.map(step$ =>
        step$.map(step => prevState => mergeDeepRight(prevState, step.state))
    )
    const popupStreamArray = scenarioStreamArray.map(step$ =>
        step$.map(step => step.message)
    )

    const reducer$ = concat(...reducerStreamArray)

    const popup$ = concat(...popupStreamArray)

    return {
        scenarioReducer$: reducer$,
        scenarioPopup$: popup$
    }
}
