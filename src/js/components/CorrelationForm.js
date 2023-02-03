import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { SignatureCheck, checkLens1, checkLens2 } from '../components/SignatureCheck'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '../utils/logger'
import { typer } from '../utils/searchUtils'

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
    get: state => ({
        core: state.form, 
        settings: { 
            form: state.settings.form, 
            api: state.settings.api 
        },
        search1: state.routerInformation.params?.signature1,
        search2: state.routerInformation.params?.signature2,
        searchAutoRun: state.routerInformation.params?.autorun,
        searchTyper: state.routerInformation.params?.typer,
    }),
    set: (state, childState) => ({
        ...state,
        form: childState.core,
        routerInformation: {
            ...state.routerInformation,
            pageState: {
              ...state.routerInformation.pageState,
              signature1: childState.core.query1,
              signature2: childState.core.query2,
            }
          }
    })
};

function CorrelationForm(sources) {

    const logger = loggerFactory('correlationForm', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$

    // Check Signature subcomponent, via isolation
    const signatureCheck1 = isolate(SignatureCheck, { onion: checkLens1 })(sources)
    const signatureCheck2 = isolate(SignatureCheck, { onion: checkLens2 })(sources)

    // Valid query?
    const validated1$ = state$.map(state => state.core.validated1)
    const validated2$ = state$.map(state => state.core.validated2)

  const vdom1$ = xs.combine(state$)
  .map(([state, check1dom, check2dom, validated1, validated2]) => {
    return state
  })

  const vdom$ = xs.combine(state$, signatureCheck1.DOM, signatureCheck2.DOM, validated1$, validated2$)
        .map(
        ([state, checkdom1, checkdom2, validated1, validated2]) => {
            const query1 = state.core.query1
            const query2 = state.core.query2
            return div(
                [
                    div('.row .WF-header .white-text', { style: { margin: '0px', padding: '20px 10px 10px 10px' } }, [
                        // label('Query: '),
                        div('.Default1 .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        input('.Query1 .col s10 .white-text', { style: { fontSize: '20px' }, props: { type: 'text', value: query1 }, value: query1 }),
                    ]),
                    div([
                        (!validated1 || query1 == '') ? div('.validation',[checkdom1]) : div()
                    ]),
                    div('.row .WF-header .white-text', { style: { margin: '0px', padding: '20px 10px 10px 10px' } }, [
                        div('.Default2 .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        input('.Query2 .col s10 .white-text', { style: { fontSize: '20px' }, props: { type: 'text', value: query2 }, value: query2 }),
                        (validated1 && validated2)
                            ? div('.SignatureCheck2 .waves-effect .col .s1 .center-align', [
                                i('.large .material-icons .validated', { style: { fontSize: '45px', fontColor: 'grey' } }, ['play_arrow'])])
                            : div('.SignatureCheck2 .col .s1 .center-align', [
                                i('.large .material-icons', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')])
                    ]),
                    div([
                        (!validated2 || query2 == '') ? div('.validation', [checkdom2]) : div()
                    ])
                ])
        });

    // Update in query, or simply ENTER
    const typer1$ = typer(state$, 'search1', 'searchTyper')
    const newQuery1$ = xs.merge(
        sources.DOM.select('.Query1').events('input').map(ev => ev.target.value),
        // Ghost 
        state$.map(state => state.core.query1).compose(dropRepeats()),
        typer1$,
    )

    const typer2$ = typer(state$, 'search2', 'searchTyper')
    const newQuery2$ = xs.merge(
        sources.DOM.select('.Query2').events('input').map(ev => ev.target.value),
        // Ghost 
        state$.map(state => state.core.query2).compose(dropRepeats()),
        typer2$,
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
        newState.core.query1 = 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2'
        newState.core.validated1 = false
        return newState
    })
    const setDefault2$ = sources.DOM.select('.Default2').events('click')
    const setDefaultReducer2$ = setDefault2$.map(events => prevState => {
        let newState = clone(prevState)
        newState.core.query2 = 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2'
        newState.core.validated2 = false
        return newState
    })

    // Takes care of initialization
    const defaultReducer$ = xs.of(prevState => {
        // Signatureform -- defaultReducer
        if (typeof prevState === 'undefined') {
            // Settings are handled higher up, but in case we use this component standalone, ...
            return {
                core: {
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
                core: {
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
        newState.core.query1 = query
        return newState
    })
    const query2Reducer$ = newQuery2$.map(query => prevState => {
        // Signatureform -- queryReducer
        let newState = clone(prevState)
        newState.core.query2 = query
        return newState
    })

    // invalidates the query when input changes
    const invalidateReducer1$ = newQuery1$.map(query => prevState => {
        // Signatureform -- invalidateReducer
        let newState = clone(prevState)
        newState.core.validated1 = false
        return newState
    })
    const invalidateReducer2$ = newQuery2$.map(query => prevState => {
        // Signatureform -- invalidateReducer
        let newState = clone(prevState)
        newState.core.validated2 = false
        return newState
    })

    // Validates the state when validated from check
    const validateReducer1$ = signatureCheck1.validated
        .map(signal => prevState => {
            // Signatureform -- validateReducer
            let newState = clone(prevState)
            newState.core.validated1 = true
            return newState
        })
    const validateReducer2$ = signatureCheck2.validated
        .map(signal => prevState => {
            // Signatureform -- validateReducer
            let newState = clone(prevState)
            newState.core.validated2 = true
            return newState
        })

    // When update is clicked, update the query. Onionify does the rest
    const childReducer1$ = signatureCheck1.onion
    const childReducer2$ = signatureCheck2.onion

    // Auto start query
    // Only run once, even if query is changed and then reverted to original value
    const searchAutoRun$ = state$
    .filter(
        (state) => state.searchAutoRun == "" || state.searchAutoRun == "yes"
    )
    .filter((state) => state.search1 == state.core.query1 && state.search2 == state.core.query2)
    .filter((state) => state.core.validated1 == true && state.core.validated2 == true)
    .mapTo(true)
    .compose(dropRepeats(equals))


    // When GO clicked or enter -> send updated 'value' to sink
    // Maybe catch when no valid query?
    const query$ = xs.merge(
        update$,
        // Ghost mode
        sources.onion.state$.map(state => state.core.ghost).filter(ghost => ghost).compose(dropRepeats()),
        searchAutoRun$,
    )
        .compose(sampleCombine(state$))
        .map(([update, state]) => ({query1: state.core.query1, query2: state.core.query2}))
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
        asyncQueryStatus: xs.merge(
            signatureCheck1.asyncQueryStatus,
            signatureCheck2.asyncQueryStatus,
        ),
        output: query$
    };

}

export { CorrelationForm, formLens };
