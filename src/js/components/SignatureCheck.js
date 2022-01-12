import xs from 'xstream';
import { p, div, br, label, input, code, table, tr, th, td, b, h2, button, thead, tbody, i, h, hr } from '@cycle/dom';
import { clone, equals } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine'
import {log, logThis} from '../utils/logger'
import {ENTER_KEYCODE} from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import { loggerFactory } from '../utils/logger'

import { check, flash, play_arrow } from 'webpack-material-design-icons'

const emptyData = {
  body: {
    result: {
      data : []
    }
  }
}

const stateTemplate = {
  query: 'The query to send to the checkSignature endpoint',
  settings: 'settings passed from root state'
}

const checkLens = { 
  get: state => ({query: state.form.query, settings: state.settings}),
  set: (state, childState) => ({...state, form : {...state.form, query: childState.query}})
};

const checkLens1 = { 
  get: state => ({query: state.form.query1, settings: state.settings}),
  set: (state, childState) => ({...state, form : {...state.form, query1: childState.query}})
};

const checkLens2 = { 
  get: state => ({query: state.form.query2, settings: state.settings}),
  set: (state, childState) => ({...state, form : {...state.form, query2: childState.query}})
};

function SignatureCheck(sources) {

  const logger = loggerFactory('signatureCheck', sources.onion.state$, 'settings.form.debug')

  const domSource$ = sources.DOM;
  const httpSource$ = sources.HTTP;
  const state$ = sources.onion.state$

  const request$ = state$
    .filter((state) => state.query !== '')
    .compose(debounce(200))
    .map(state =>  {
      return {
        url : state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.checkSignature',
        method : 'POST',
        send : {
          version : 'v2',
          query : state.query
        },
        'category' : 'checkSignature'
      }})
    .remember()

  // Catch the response in a stream
  // Handle errors by returning an empty object
  const response$ = httpSource$
    .select('checkSignature')
    .map((response$) =>
      response$.replaceError(() => xs.of(emptyData))
    )
    .flatten()
    .remember()

  const data$ = response$
    .map(res => res.body)
    .map(json => json.result.data)

  // Helper function for rendering the table, based on the state
  const makeTable = (data) => {
    // let visible = visible1 //state.ux.checkSignatureVisible;

    const entryToRow = (entry) => {
      const e =
        entry.hasOwnProperty("found") && entry.hasOwnProperty("dataType")
          ? entry
          : {
              ...entry,
              found: entry.inL1000,
              dataType: entry.inL1000 ? "found" : "",
            }

      return [ 
        (e.found) ? td([i('.small .material-icons', 'done')] ) : td('.red .lighten-4 .red-text .text-darken-4', [i('.small .material-icons', 'mode_edit')] ),
        (e.found) ? td(e.query) : td('.red .lighten-4 .red-text .text-darken-4', e.query),
        (e.found) ? td(e.symbol) : td('.red .lighten-4 .red-text .text-darken-4', e.symbol),
        (e.found) ? td(e.dataType) : td('.red .lighten-4 .red-text .text-darken-4', 'N/A'),
      ]
    }

    let rows = data.map(entry => entryToRow(entry));
    const header = tr([
      th('Found?'),
      th('Input'),
      th('Symbol'),
      th('Gene space')
    ]);

    let body = [];
    rows.map(row => body.push(tr(row)));
    const tableContent = [thead([header]), tbody(body)];

    return ( 
      div([
        div('.row', [
          div('.col .s6 .offset-s3', [table('.striped', tableContent)]),
          div('.row .s6 .offset-s3', [
            button('.collapseUpdate .btn .col .offset-s4 .s4 .pink .darken-2', 'Update/Validate'),
          ]),
        ])
      ])
    );
  }

  // vdom
  const vdom$ = data$
    .map((data) => makeTable(data))
    .startWith(div())

  // Update and Collapse button updates the query and collapses the window
  const collapseUpdate$ = domSource$.select('.collapseUpdate').events('click');
  const collapseUpdateReducer$ = collapseUpdate$.compose(sampleCombine(data$))
    .map(([collapse, data]) => prevState => {
      return ({...prevState, query : data.map(x => (x.found ?? x.inL1000) ? x.symbol : '').join(" ").replace(/\s\s+/g, ' ').trim()});
    });

  // The result of this component is an event when valid
  // XXX: stays true the whole cycle, so maybe tackle this as well!!!!
  const validated$ = collapseUpdate$.map(update => true)

  return { 
    log: xs.merge(
      logger(state$, 'state$'),
      logger(request$, 'request$'),
      logger(response$, 'response$')
    ),
    HTTP: request$,
    DOM: vdom$,
    onion: xs.merge(
      collapseUpdateReducer$, 
    ),
    validated : validated$
  }

};

export { SignatureCheck, checkLens, checkLens1, checkLens2 };
