import { a, div, br, label, input, p, button, code, pre, span, h5 } from '@cycle/dom'
import xs from 'xstream'
import { equals, mergeRight, omit } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import { StatisticsQuery } from '../utils/asyncQuery';
import delay from 'xstream/extra/delay';

const statisticsLens = {
    get: state => ({ core: state.stats, settings: { api: state.settings.api } }),
    set: (state, childState) => ({...state, stats: childState.core })
  }

function Statistics(sources) {

    const state$ = sources.onion.state$

    const triggerObject$ = state$
        .take(1)
        .mapTo({ })
        .compose(delay(100))

    const queryData = StatisticsQuery(triggerObject$)(sources)

    const data$ = queryData.data$.map((result) => result.data)

    const container = (el) => div([
        div('.row', [
            div('.col .s10 .offset-s1', [
                div('.row', []),
                h5('.center-align', ['Statistics']),
                div('.row', []),
                div('.green-text .text-darken-3', { style: { fontSize: 'large' } }, el)
            ])
        ])
    ])

    const initVdom$ = xs.of(container([p('Initializing...')]))

    const loadingVdom$ = triggerObject$
        .mapTo(container([p('Loading...')]))

    const extracts = (els) => els.map(x => span(x + " "))

    const loadedVdom$ = data$
        .map(data => container([

          div('.row', [
            div('.col .s4 .green .darken-3 .center-align', [p('.green-text .text-darken-3', { style: { fontSize: 'large' } }, ['nothing'])]),
            div('.col .s4 .green .darken-3 .center-align', [p('.white-text', { style: { fontSize: 'large' } }, ["Extract (at most 10 entries)"])]),
            div('.col .s4 .green .darken-3 .center-align', [p('.white-text', { style: { fontSize: 'large' } }, ['Total'])])
          ]),
          div('.row', [
            div('.col .s4', [p(['# profiles'])]),
            div('.col .s4', [p('', { style : { fontSize : 'small' }}, extracts(data.samples.sample))]),
            div('.col .s4 .center-align', [p(data.samples.total)])
          ]),
          div('.row', [
            div('.col .s4', [p(['# informative profiles'])]),
            div('.col .s4 .center-align', [p([" "])]),
            div('.col .s4 .center-align', [p(data.informative.total)])
          ]),
          div('.row', [
            div('.col .s4', [p(['# unique treatments'])]),
            div('.col .s4', [p('', { style : { fontSize : 'small' }}, extracts(data.treatments.sample))]),
            div('.col .s4 .center-align', [p(data.treatments.total)])
          ]),
          div('.row', [
            div('.col .s4', [p(['# doses'])]),
            div('.col .s4', [p('', { style : { fontSize : 'small' }}, extracts(data.doses.sample))]),
            div('.col .s4 .center-align', [p(data.doses.total)])
          ]),
          div('.row', [
            div('.col .s4', [p(['# cells'])]),
            div('.col .s4', [p('', { style : { fontSize : 'small' }}, extracts(data.cells.sample))]),
            div('.col .s4 .center-align', [p(data.cells.total)])
          ]),
          div('.row', [
            div('.col .s4', [p(['# types'])]),
            div('.col .s4', [p('', { style : { fontSize : 'small' }}, extracts(data.types.sample))]),
            div('.col .s4 .center-align', [p(data.types.total)])
          ])
        ])
        )

    const errorVdom$ = queryData.invalidData$
      .mapTo(
        div(".component-error-state", [
          p(".header", "An error occured!"),
          p(".text", "Please try again in 5 minutes. If the issue persists please contact support.")
        ])
      )

    const killedVdom$ = queryData.jobDeleted$.mapTo(div([p('Job terminated by user')]))

    const vdom$ = xs.merge(
        initVdom$,
        loadingVdom$,
        loadedVdom$,
        errorVdom$,
        killedVdom$,
    )

    // This is needed in order to get the onion stream active!
    const defaultReducer$ = xs.of((prevState) => ({
        ...prevState,
        core: {
          stats: {},
        },
      }))

    // Add the result to the state
    const stateReducer$ = data$.map(data => prevState => ({ ...prevState, core: { result: data } }))

    return {
        DOM: vdom$,
        HTTP: queryData.HTTP,
        asyncQueryStatus: queryData.asyncQueryStatus,
        onion: xs.merge(
            defaultReducer$,
            stateReducer$,
        )

    }
}

export { Statistics, statisticsLens }
