import sampleCombine from 'xstream/extra/sampleCombine'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span } from '@cycle/dom';
import { clone, equals, mergeAll } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { titleCase } from '../utils/utils'

const checkLens = {
  get: state => ({ core: (typeof state.form !== 'undefined') ? state.form.check : {}, settings: state.settings }),
  set: (state, childState) => ({ ...state, form: { ...state.form, check: childState.core } })
}

/**
 * Form for entering compounds with autocomplete.
 *
 * Input: Form input
 * Output: compound (string)
 */
function CompoundCheck(sources) {
  // States of autosuggestion field:
  // - Less than N characters -> no query, no suggestions
  // - N or more -> with every character a query is done (after 500ms). suggestions are shown
  // - Clicking on a suggestion activates it in the search field and sets validated to true
  // - At that point, the dropdown should dissapear!!!
  // - The suggestions appear again whenever something changes in the input...

  const logger = loggerFactory('compoundCheck', sources.onion.state$, 'settings.form.debug')

  const state$ = sources.onion.state$

  const acInput$ = sources.ac

  const input$ = xs.merge(
    sources.DOM
    .select('.compoundQuery')
    .events('input')
    .map(ev => ev.target.value)
    .startWith(''),
    // This for ghost mode, inject changes via external state updates...
    state$.filter(state => typeof state.core.ghostinput !== 'undefined').map(state => state.core.input).compose(dropRepeats())
  )

  // When the component should not be shown, including empty signature
  const isEmptyState = (state) => {
    if (typeof state.core === 'undefined') {
      return true
    } else {
      if (typeof state.core.input === 'undefined') {
        return true
      } else {
        return false
      }
    }
  }

  const emptyState$ = state$
    .filter(state => isEmptyState(state))
    .compose(dropRepeats(equals))

  // When the state is cycled because of an internal update
  const modifiedState$ = state$
    .filter(state => !isEmptyState(state))
    .compose(dropRepeats((x, y) => equals(x, y)))
    .remember()

  // An update to the input$, join it with state$
  const newInput$ = xs.combine(
    input$,
    modifiedState$
  )
    .map(([newinput, state]) => ({ ...state, core: { ...state.core, input: newinput } }))
    .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

  const triggerRequest$ = newInput$
    .filter(state => state.core.input.length >= 2)
    .filter(state => state.core.showSuggestions)
    .compose(debounce(500))

  const request$ = triggerRequest$
    .map(state => {
      return {
        url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.compounds',
        method: 'POST',
        send: {
          version: 'v2',
          query: state.core.input
        },
        'category': 'compounds'
      }
    })

  const response$ = sources.HTTP
    .select('compounds')
    .map((response$) =>
      response$.replaceError(() => xs.of([]))
    )
    .flatten()

  const data$ = response$
    .map(res => res.body.result.data)
    .remember()

  const initVdom$ = emptyState$
    .mapTo(div())

  const loadedVdom$ = modifiedState$
    .map(state => {
      const query = state.core.input
      const validated = state.core.validated
      return div(
        [
          div('.row  .orange .darken-4 .white-text', { style: { padding: '20px 10px 10px 10px' } }, [
            div('.Default .waves-effect .col .s1 .center-align', [
              i('.large  .center-align .material-icons .orange-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
            ]),
            div('.col .s10 .input-field', { style: { margin: '0px 0px 0px 0px' } }, [
              input('.compoundQuery.col .s12 .autocomplete-input .white-text',
                { style: { fontSize: '20px' }, props: { type: 'text', value: query }, value: query }),
            ]),
            (validated)
            ? div('.CompoundCheck .waves-effect .col .s1 .center-align', [
              i('.large .material-icons', { style: { fontSize: '45px', fontColor: 'grey' } }, ['play_arrow'])])
            : div('.CompoundCheck .col .s1 .center-align', [
              i('.large .material-icons .orange-text', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')]),
          ]),
        ])
    })

  const vdom$ = xs.merge(initVdom$, loadedVdom$).startWith(div())

  // Set a initial reducer, showing suggestions
  const defaultReducer$ = xs.of(prevState => {
    // CompoundCheck -- defaultReducer$')
    let newState = {
      ...prevState,
      core: {
        ...prevState.core,
        showSuggestions: true,
        validated: false,
        input: '',
        data: [],
      }
    }
    return newState
  })

  // Reducer for showing suggestions again after an input event
  const inputReducer$ = input$.map(value => prevState =>
    ({
      ...prevState,
      core: {
        ...prevState.core,
        showSuggestions: true,
        validated: false,
        input: value,
      }
    })
  )

  // Set a default signature for demo purposes
  const setDefault$ = sources.DOM.select('.Default').events('click')
  const setDefaultReducer$ =
    setDefault$
    .compose(sampleCombine(state$))
    .map(([_, state]) => prevState =>
      ({
        ...prevState, core: {
          ...prevState.core,
          showSuggestions: false,
          validated: true,
          input: state.settings.common.hourglass.compound,
        }
      })
    )

  // Add request body to state
  const requestReducer$ = request$.map(req => prevState =>
    ({ ...prevState, core: { ...prevState.core, request: req } })
  )

  // Add data from API to state, update output key when relevant
  const dataReducer$ = data$.map(newData => prevState =>
    ({ ...prevState, core: { ...prevState.core, data: newData } })
  )

  // Whenever more than 1 option is available per our compound query, we list the options.
  const ac$ = data$
    .filter(data => data.length > 1)
    .map(data => ({
      el: '.compoundQuery',
      data: data,
      render: function (data) { return mergeAll(data.map(d => ({ [d.compound_id + ' - ' + d.name]: null }))) },
      strip: function (str) {
        return str; //.split(" - ")[0];
      }
    }))

  // Trigger an update when only one result is left so we can handle that in the AutoComplete driver
  const acOneSolution$ = data$
    .filter(data => data.length == 1)
    .map(data => ({
      el: '.compoundQuery',
      data: data,
      render: function (data) { return mergeAll(data.map(d => ({ [d.compound_id + ' - ' + d.name]: null }))) },
      strip: function (str) {
        return str; //.split(" - ")[0];
      }
    }))

  // When a suggestion is clicked, update the state so the query becomes this
  const autocompleteReducer$ = xs.merge(
    // input from autocomplete (clicking an option)
    acInput$,
    // input from having one solution left in the autocomplete, extract the remaning target
    acOneSolution$.map(info => info.data[0].compound_id)
  )
    .map(input => prevState => {
      const newInput = input
      return ({
        ...prevState, core: {
          ...prevState.core,
          input: newInput,
          showSuggestions: false,
          validated: true,
          output: newInput,
        }
      })
    })

  // GO!!!
  const run$ = sources.DOM
    .select('.CompoundCheck')
    .events('click')

  const query$ = xs.merge(
    run$,
    // Ghost mode
    sources.onion.state$.map(state => state.core.ghostoutput).filter(ghost => ghost).compose(dropRepeats())
    )
    .compose(sampleCombine(state$))
    .map(([_, state]) => state.core.input)
    .remember()

  // const history$ = sources.onion.state$.fold((acc, x) => acc.concat([x]), [{}])

  return {
    log: xs.merge(
      logger(state$, 'state$')
      // logger(history$, 'history$'),
    ),
    HTTP: request$,
    DOM: vdom$,
    onion: xs.merge(
      defaultReducer$,
      inputReducer$,
      dataReducer$,
      requestReducer$,
      setDefaultReducer$,
      autocompleteReducer$
    ),
    output: query$,
    ac: xs.merge(ac$, acOneSolution$)
  };
}

export { CompoundCheck, checkLens }
