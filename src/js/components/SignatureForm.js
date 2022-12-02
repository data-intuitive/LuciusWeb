import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a } from '@cycle/dom';
import { clone, equals } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { SignatureCheck, checkLens } from '../components/SignatureCheck'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '../utils/logger'
import { dirtyUiReducer } from '../utils/ui'
import { typer } from '../utils/searchUtils'

// Granular access to global state and parts of settings
const formLens = {
  get: (state) => ({
    core: state.form,
    settings: {
      form: state.settings.form,
      api: state.settings.api,
      common: state.settings.common,
    },
    ui: state.ui?.form ?? {},
    search: state.routerInformation.params?.signature,
    searchAutoRun: state.routerInformation.params?.autorun,
    searchTyper: state.routerInformation.params?.typer,
  }),
  set: (state, childState) => ({
    ...state,
    form: {...childState.core },
    routerInformation: {
      ...state.routerInformation,
      pageState: {
        ...state.routerInformation.pageState,
        signature: childState.core.query,
      }
    }
  }),
}

function model(newQuery$, state$, sources, signatureCheckSink, actions$) {
  
  // Set a default signature for demo purposes
  const setDefault$ = sources.DOM.select('.Default').events('click')
  const setDefaultReducer$ =
    setDefault$
    .compose(sampleCombine(state$))
    .map(([_, state]) => prevState => {
      let newState = clone(prevState)
      newState.core.query = state.settings.common.example.signature //'ENSG00000012048 -WRONG HSPA1A DNAJB1 DDIT4 -TSEN2'
      newState.core.validated = false
      return newState
    })

  // Takes care of initialization
  const defaultReducer$ = xs.of(function defaultReducer(prevState) {
    // Signatureform -- defaultReducer
    if (typeof prevState === 'undefined') {
      // Settings are handled higher up, but in case we use this component standalone, ...
      return {
        core: {
          query: '',
          validated: false
        },
        settings: initSettings
      }
    } else {
      return ({
        ...prevState,
        core: {
          query: '',
          validated: false
        },
      })
    }
  })

  // Update the state when input changes
  const queryReducer$ = newQuery$.map(query => prevState => {
    // Signatureform -- queryReducer
    let newState = clone(prevState)
    newState.core.query = query
    return newState
  })

  // invalidates the query when input changes
  const invalidateReducer$ = newQuery$.map(_ => prevState => {
    // Signatureform -- invalidateReducer
    let newState = clone(prevState)
    newState.core.validated = false
    return newState
  })

  // Validates the state when validated from check
  const validateReducer$ = signatureCheckSink.validated
    .map(_ => prevState => {
      // Signatureform -- validateReducer
      let newState = clone(prevState)
      newState.core.validated = true
      return newState
    })

  // When update is clicked, update the query. Onionify does the rest
  const childReducer$ = signatureCheckSink.state

  // Auto start query
  // Only run once, even if query is changed and then reverted to original value
  const searchAutoRun$ = state$
    .filter(
      (state) => state.searchAutoRun == "" || state.searchAutoRun == "yes"
    )
    .filter((state) => state.search == state.core.query)
    .filter((state) => state.core.validated == true)
    .mapTo(true)
    .compose(dropRepeats(equals))

  // When GO clicked or enter -> send updated 'value' to sink
  // Maybe catch when no valid query?
  const query$ = xs.merge(
    actions$.update$,
    searchAutoRun$,
    // Ghost mode
    sources.state.stream.map(state => state.core.ghost).filter(ghost => ghost).compose(dropRepeats())
    )
    .compose(sampleCombine(state$))
    .map(([_, state]) => state.core.query)
    .remember()

  // Compare current query with committed query output to see if this component is currently in a dirty state
  const dirtyUiReducer$ = dirtyUiReducer(query$, newQuery$)

  return [
    xs.merge(
        defaultReducer$,
        setDefaultReducer$,
        queryReducer$,
        invalidateReducer$,
        childReducer$,
        validateReducer$,
        dirtyUiReducer$,
      ),
    query$
  ]
}

function view(state$, signatureCheckDom$) {

  // Valid query?
  const validated$ = state$.map(state => state.core.validated)

  var result$ = xs.combine(state$, signatureCheckDom$, validated$)
  .map(
    ([state, checkdom, validated]) => {
      const query = state.core.query
      return div(
        [
          div('.row .WF-header .white-text', { style: { padding: '20px 10px 10px 10px' } }, [
            // label('Query: '),
            div('.Default .waves-effect .col .s1 .center-align', [
              i('.large  .center-align .material-icons', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
            ]),
            input('.Query .col s10 .white-text', { style: { fontSize: '20px' }, props: { type: 'text', value: query }, value: query }),
            (validated)
            ? div('.SignatureCheck .waves-effect .col .s1 .center-align', [
              i('.large .material-icons .validated', { style: { fontSize: '45px', fontColor: 'grey' } }, ['play_arrow'])])
            : div('.SignatureCheck .col .s1 .center-align', [
              i('.large .material-icons', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')])
            // ])
          ]),
          div([
            (!validated || query == '') ? div(".validation", [checkdom]) : div()
          ])
        ])
    })
    return result$;
}

function intent(domSource$) {
    // Updated state is propagated and picked up by the necessary components
    const click$ = domSource$.select('.SignatureCheck').events('click')
    const enter$ = domSource$.select('.Query').events('keydown').filter(({ keyCode, ctrlKey }) => keyCode === ENTER_KEYCODE && ctrlKey === false);
    const update$ = xs.merge(click$, enter$)//.debug(log)

    return {
      update$: update$
    }
}

function SignatureForm(sources) {

  const logger = loggerFactory('signatureForm', sources.state.stream, 'settings.form.debug')

  const state$ = sources.state.stream
  const domSource$ = sources.DOM;
  const props$ = sources.props;

  // Check Signature subcomponent, via isolation
  const signatureCheckSink = isolate(SignatureCheck, { state: checkLens })(sources)
  const signatureCheckDom$ = signatureCheckSink.DOM;
  const signatureCheckHTTP$ = signatureCheckSink.HTTP;
  const signatureCheckReducer$ = signatureCheckSink.state;

  const typer$ = typer(state$, 'search', 'searchTyper')

  // Update in query, or simply ENTER
  const newQuery$ = xs.merge(
    domSource$.select('.Query').events('input').map(ev => ev.target.value),
    // Ghost
    state$.map(state => state.core.query).compose(dropRepeats()),
    typer$,
  )

  const actions$ = intent(domSource$)

  const [reducers$, query$] = model(newQuery$, state$, sources, signatureCheckSink, actions$)

  const vdom$ = view(state$, signatureCheckDom$)

  return {
    log: xs.merge(
      logger(state$, 'state$'),
      signatureCheckSink.log
    ),
    DOM: vdom$,
    state: reducers$,
    HTTP: signatureCheckHTTP$,
    output: query$
  };

}

export { SignatureForm, formLens };
