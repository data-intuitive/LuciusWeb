import { a, div, br, label, input, p, button, code, pre, span, h5 } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll, omit } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

function Statistics(sources) {

    const state$ = sources.onion.state$

    // Check when the state has changed, omit the result key
    const modifiedState$ = state$
        .compose(dropRepeats((x, y) => equals(omit(['result'], x), omit(['result'], y))))
        .compose(debounce(100))

    const props$ = sources.props

    const request$ = xs.combine(modifiedState$, props$)
        .map(([state, props]) => {
            return {
                url: props.url + '&classPath=com.dataintuitive.luciusapi.statistics',
                method: 'POST',
                send: {},
                'category': 'statistics'
            }
        })

    const response$$ = sources.HTTP
        .select('statistics')

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
                .filter(response => false) // ignore regular event
                .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()

    const validResponse$ = response$$
        .map(response$ =>
            response$
                .replaceError(error => xs.empty())
        )
        .flatten()

    const data$ = validResponse$
        .map(result => result.body.result.data)


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

    const loadingVdom$ = request$
        .mapTo(container([p('Loading...')]))

    const loadedVdom$ = data$
        .map(data => container([

            // div('.row', [
            div('.col .s3 .green .darken-3 .center-align', [p('.green-text .text-darken-3', { style: { fontSize: 'large' } }, ['nothing'])]),
            div('.col .s3 .green .darken-3 .center-align', [p('.white-text', { style: { fontSize: 'huge' } }, ['MCF7'])]),
            div('.col .s3 .green .darken-3 .center-align', [p('.white-text', { style: { fontSize: 'large' } }, ['PBMC'])]),
            div('.col .s3 .green .darken-3 .center-align', [p('.white-text', { style: { fontSize: 'large' } }, ['Total'])]),

            // ]),
            // div('.row', [
            div('.col .s3', [p(['# profiles'])]),
            div('.col .s3 .center-align', [p(data.samples.mcf7)]),
            div('.col .s3 .center-align', [p(data.samples.pbmc)]),
            div('.col .s3 .center-align', [p(data.samples.total)]),

            // ]),
            // div('.row', [
            div('.col .s3', [p(['# informative profiles'])]),
            div('.col .s3 .center-align', [p(data.informative.mcf7)]),
            div('.col .s3 .center-align', [p(data.informative.pbmc)]),
            div('.col .s3 .center-align', [p(data.informative.total)]),

            // ]),
            // div('.row', [
            div('.col .s3', [p(['# unique compounds'])]),
            div('.col .s3 .center-align', [p(data.compounds.mcf7)]),
            div('.col .s3 .center-align', [p(data.compounds.pbmc)]),
            div('.col .s3 .center-align', [p(data.compounds.total)]),

            // ])
            // p(['# Compounds: ', data.compounds]),
            // p(['# Samples: ', data.samples]),
            // p(['# Genes: ', data.genes]),
        ])
        )

    const errorVdom$ = invalidResponse$.mapTo(div([p('An error occured !!!')]))

    const vdom$ = xs.merge(
        initVdom$,
        loadingVdom$,
        loadedVdom$,
        errorVdom$,
    )

    // This is needed in order to get the onion stream active!
    const defaultReducer$ = xs.of(prevState => {
        if (typeof prevState === 'undefined') {
            return {}
        } else {
            return prevState
        }
    });

    // Add the result to the state
    const stateReducer$ = data$.map(data => prevState => merge(prevState, { result: data }))

    return {
        DOM: vdom$,
        HTTP: request$,
        onion: xs.merge(
            defaultReducer$,
            stateReducer$
        )

    }
}

export { Statistics }
