import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { SignatureCheck, checkLens1, checkLens2 } from '../components/SignatureCheck'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'

const stateTemplate = {
    form: {
        query1: 'Passed through to check as well',
        query2: 'Passed through to check as well',
        validated1: 'Has this query been validated?',
        validated2: 'Has this query been validated?'
    },
    settings: 'settings passed from root state'
}

// Granular access to global state and parts of settings
const formLens = {
    get: state => ({ form: state.form, settings: { form: state.settings.form, api: state.settings.api } }),
    set: (state, childState) => ({ ...state, form: childState.form })
};

function CorrelationForm(sources) {

    const logger = loggerFactory('correlationForm', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$

    // Check Signature subcomponent, via isolation
    const signatureCheck1 = isolate(SignatureCheck, { onion: checkLens1 })(sources)
    const signatureCheck2 = isolate(SignatureCheck, { onion: checkLens2 })(sources)

    // Valid query?
    const validated1$ = state$.map(state => state.form.validated1)
    const validated2$ = state$.map(state => state.form.validated2)

  const vdom1$ = xs.combine(state$)
  .map(([state, check1dom, check2dom, validated1, validated2]) => {
    return state
  })

  const vdom$ = xs.combine(state$, signatureCheck1.DOM, signatureCheck2.DOM, validated1$, validated2$)
        .map(
        ([state, checkdom1, checkdom2, validated1, validated2]) => {
            const query1 = state.form.query1
            const query2 = state.form.query2
            return div(
                [
                    div('.row .blue .darken-3 .white-text', { style: { margin: '0px', padding: '20px 10px 10px 10px' } }, [
                        // label('Query: '),
                        div('.Default1 .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons .blue-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        input('.Query1 .col s10 .white-text', { style: { fontSize: '20px' }, props: { type: 'text', value: query1 }, value: query1 }),
                    ]),
                    div([
                        (!validated1 || query1 == '') ? div('.blue.lighten-3',[checkdom1]) : div()
                    ]),
                    div('.row .blue .darken-3 .white-text', { style: { margin: '0px', padding: '20px 10px 10px 10px' } }, [
                        div('.Default2 .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons .blue-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        input('.Query2 .col s10 .white-text', { style: { fontSize: '20px' }, props: { type: 'text', value: query2 }, value: query2 }),
                        (validated1 && validated2)
                            ? div('.SignatureCheck2 .waves-effect .col .s1 .center-align', [
                                i('.large .material-icons', { style: { fontSize: '45px', fontColor: 'grey' } }, ['play_arrow'])])
                            : div('.SignatureCheck2 .col .s1 .center-align', [
                                i('.large .material-icons .blue-text', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')])
                    ]),
                    div([
                        (!validated2 || query2 == '') ? div('.blue.lighten-3', [checkdom2]) : div()
                    ])
                ])
        });

    // Update in query, or simply ENTER
    const newQuery1$ = xs.merge(
        sources.DOM.select('.Query1').events('input').map(ev => ev.target.value),
        // Ghost 
        state$.map(state => state.form.query1).compose(dropRepeats())
    )
    const newQuery2$ = xs.merge(
        sources.DOM.select('.Query2').events('input').map(ev => ev.target.value),
        // Ghost 
        state$.map(state => state.form.query2).compose(dropRepeats())
    )

    // Updated state is propagated and picked up by the necessary components
    const click1$ = sources.DOM.select('.SignatureCheck1').events('click')
    const click2$ = sources.DOM.select('.SignatureCheck2').events('click')
    // const enter1$ = domSource$.select('.Query').events('keydown').filter(({ keyCode, ctrlKey }) => keyCode === ENTER_KEYCODE && ctrlKey === false);
    const update$ = xs.merge(click1$, click2$)//.debug(log)

    // Set a default signature for demo purposes
    const setDefault1$ = sources.DOM.select('.Default1').events('click')
    const setDefaultReducer1$ = setDefault1$.map(events => prevState => {
        let newState = clone(prevState)
        newState.form.query1 = 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2'
        newState.form.validated1 = false
        return newState
    })
    const setDefault2$ = sources.DOM.select('.Default2').events('click')
    const setDefaultReducer2$ = setDefault2$.map(events => prevState => {
        let newState = clone(prevState)
        newState.form.query2 = 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2'
        newState.form.validated2 = false
        return newState
    })

    // Takes care of initialization
    const defaultReducer$ = xs.of(prevState => {
        // Signatureform -- defaultReducer
        if (typeof prevState === 'undefined') {
            // Settings are handled higher up, but in case we use this component standalone, ...
            return {
                form: {
                    query1: '',
                    query2: '',
                    validated1: false,
                    validated2: false
                },
                settings: initSettings
            }
        } else {
            return ({
                ...prevState,
                form: {
                    query1: '',
                    query2: '',
                    validated1: false,
                    validated2: false
                },
            })
        }
    })

    // Update the state when input changes
    const query1Reducer$ = newQuery1$.map(query => prevState => {
        // Signatureform -- queryReducer
        let newState = clone(prevState)
        newState.form.query1 = query
        return newState
    })
    const query2Reducer$ = newQuery2$.map(query => prevState => {
        // Signatureform -- queryReducer
        let newState = clone(prevState)
        newState.form.query2 = query
        return newState
    })

    // invalidates the query when input changes
    const invalidateReducer1$ = newQuery1$.map(query => prevState => {
        // Signatureform -- invalidateReducer
        let newState = clone(prevState)
        newState.form.validated1 = false
        return newState
    })
    const invalidateReducer2$ = newQuery2$.map(query => prevState => {
        // Signatureform -- invalidateReducer
        let newState = clone(prevState)
        newState.form.validated2 = false
        return newState
    })

    // Validates the state when validated from check
    const validateReducer1$ = signatureCheck1.validated
        .map(signal => prevState => {
            // Signatureform -- validateReducer
            let newState = clone(prevState)
            newState.form.validated1 = true
            return newState
        })
    const validateReducer2$ = signatureCheck2.validated
        .map(signal => prevState => {
            // Signatureform -- validateReducer
            let newState = clone(prevState)
            newState.form.validated2 = true
            return newState
        })

    // When update is clicked, update the query. Onionify does the rest
    const childReducer1$ = signatureCheck1.onion
    const childReducer2$ = signatureCheck2.onion

    // When GO clicked or enter -> send updated 'value' to sink
    // Maybe catch when no valid query?
    const query$ = xs.merge(
        update$,
        // Ghost mode
        sources.onion.state$.map(state => state.form.ghost).filter(ghost => ghost).compose(dropRepeats())
    )
        .compose(sampleCombine(state$))
        .map(([update, state]) => ({query1: state.form.query1, query2: state.form.query2}))
        .remember()

    return {
        log: xs.merge(
            // logger(state$, 'state$'),
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            setDefaultReducer1$,
            setDefaultReducer2$,
            query1Reducer$,
            query2Reducer$,
            invalidateReducer1$,
            invalidateReducer2$,
            childReducer1$,
            childReducer2$,
            validateReducer1$,
            validateReducer2$
        ),
        HTTP: xs.merge(
          signatureCheck1.HTTP,
          signatureCheck2.HTTP,
        ),
        output: query$
    };

}

export { CorrelationForm, formLens };
