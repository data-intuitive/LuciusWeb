import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { SignatureCheck, checkLens } from '../components/SignatureCheck'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'

const stateTemplate = {
    form: {
        query: 'Passed through to check as well',
        validated: 'Has this query been validated?'
    },
    settings: 'settings passed from root state'
}

// Granular access to global state and parts of settings
const formLens = {
    get: state => ({ form: state.form, settings: { form: state.settings.form, api: state.settings.api } }),
    set: (state, childState) => ({ ...state, form: childState.form })
};

function SignatureForm(sources) {

    const logger = loggerFactory('signatureForm', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$
    const domSource$ = sources.DOM;
    const props$ = sources.props;

    // Check Signature subcomponent, via isolation
    const signatureCheckSink = isolate(SignatureCheck, { onion: checkLens })(sources)
    const signatureCheckDom$ = signatureCheckSink.DOM;
    const signatureCheckHTTP$ = signatureCheckSink.HTTP;
    const signatureCheckReducer$ = signatureCheckSink.onion;

    // Valid query?
    const validated$ = state$.map(state => state.form.validated)

    const vdom$ = xs.combine(state$, signatureCheckDom$, validated$)
        .map(
        ([state, checkdom, validated]) => {
            const query = state.form.query
            return div(
                [
                    div('.row  .pink .darken-4 .white-text', { style: { padding: '20px 10px 10px 10px' } }, [
                        // label('Query: '),
                        div('.Default .waves-effect .col .s1 .center-align', [
                            i('.large  .center-align .material-icons .pink-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                        ]),
                        // textarea('.Query .col .s10 .materialize-textarea', {style: {fontSize: '20px'} , props: {type: 'text', value: query.trim()}, value: query.trim()}),
                        input('.Query .col s10', { style: { fontSize: '20px' }, props: { type: 'text', value: query }, value: query }),
                        // div('.row', [
                        // div('.col .s1'),
                        (validated)
                            ? div('.SignatureCheck .waves-effect .col .s1 .center-align', [
                                i('.large .material-icons', { style: { fontSize: '45px', fontColor: 'grey' } }, ['play_arrow'])])
                            : div('.SignatureCheck .col .s1 .center-align', [
                                i('.large .material-icons .pink-text', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')])
                        // ])
                    ]),
                    div([
                        (!validated || query == '') ? div([checkdom]) : div()
                    ])
                ])
        });

    // Update in query, or simply ENTER
    const newQuery$ = xs.merge(
        domSource$.select('.Query').events('input').map(ev => ev.target.value),
        // Ghost 
        state$.map(state => state.form.query).compose(dropRepeats())
    )

    // Updated state is propagated and picked up by the necessary components
    const click$ = domSource$.select('.SignatureCheck').events('click')
    const enter$ = domSource$.select('.Query').events('keydown').filter(({ keyCode, ctrlKey }) => keyCode === ENTER_KEYCODE && ctrlKey === false);
    const update$ = xs.merge(click$, enter$)//.debug(log)

    // Set a default signature for demo purposes
    const setDefault$ = sources.DOM.select('.Default').events('click')
    const setDefaultReducer$ = setDefault$.map(events => prevState => {
        let newState = clone(prevState)
        newState.form.query = 'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2'
        newState.form.validated = false
        return newState
    })

    // Takes care of initialization
    const defaultReducer$ = xs.of(function defaultReducer(prevState) {
        // Signatureform -- defaultReducer
        if (typeof prevState === 'undefined') {
            // Settings are handled higher up, but in case we use this component standalone, ...
            return {
                form: {
                    query: '',
                    validated: false
                },
                settings: initSettings
            }
        } else {
            return ({
                ...prevState,
                form: {
                    query: '',
                    validated: false
                },
            })
        }
    });

    // Update the state when input changes
    const queryReducer$ = newQuery$.map(query => prevState => {
        // Signatureform -- queryReducer
        let newState = clone(prevState)
        newState.form.query = query
        return newState
    })

    // invalidates the query when input changes
    const invalidateReducer$ = newQuery$.map(query => prevState => {
        // Signatureform -- invalidateReducer
        let newState = clone(prevState)
        newState.form.validated = false
        return newState
    })

    // Validates the state when validated from check
    const validateReducer$ = signatureCheckSink.validated
        .map(signal => prevState => {
            // Signatureform -- validateReducer
            let newState = clone(prevState)
            newState.form.validated = true
            return newState
        })

    // When update is clicked, update the query. Onionify does the rest
    const childReducer$ = signatureCheckSink.onion

    // When GO clicked or enter -> send updated 'value' to sink
    // Maybe catch when no valid query?
    const query$ = xs.merge(
        update$,
        // Ghost mode
        sources.onion.state$.map(state => state.form.ghost).filter(ghost => ghost).compose(dropRepeats())
    )
        .compose(sampleCombine(state$))
        .map(([update, state]) => state.form.query)
        .remember()

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            signatureCheckSink.log
        ),
        DOM: vdom$,
        onion: xs.merge(
            defaultReducer$,
            setDefaultReducer$,
            queryReducer$,
            invalidateReducer$,
            childReducer$,
            validateReducer$,
        ),
        HTTP: signatureCheckHTTP$,
        output: query$
    };

}

export { SignatureForm, formLens };