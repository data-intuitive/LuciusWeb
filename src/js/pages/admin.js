import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, img, map, area, use, span } from '@cycle/dom'
import { merge, prop, equals } from 'ramda';

import { Check } from '../components/Check'
import { IsolatedSettings } from './settings'

import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from '../configuration'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'

const defaultState = {
    green : {
      url: "http://localhost:8090"
    },
    blue : {
        url: "localhost:8081"
    }
}

function Admin(sources) {

    const state$ = sources.onion.state$
        .compose(dropRepeats((x,y) => equals(x.core, y.core)))
        .startWith({ core: defaultState, settings: initSettings })
        // .map(state => merge(state, state.settings.admin, state.settings.api))
        .debug()

    const request$ = state$.map(state => ({
            url: state.core.green.url + '/jobs',
            method: 'GET',
            send: {},
            'category': 'status'
        })
    )
    .debug()

    const response$$ = sources.HTTP
        .select('status')
        // .debug()

    const invalidResponse$ = response$$
        .map(response$ =>
            response$
            .filter(response => false) // ignore regular events
            .replaceError(error => xs.of(error)) // emit error
        )
        .flatten()
        // .debug()

    /**
     * Parse the successful results only.
     *
     * We add a little wait time (`debounce`) in order for the jobserver
     * to be up-to-date with the actual jobs. Otherwize, we measure the
     * wrong job times.
     */
    const validResponse$ = response$$
        .map(response$ =>
            response$
            .replaceError(error => xs.empty())
        )
        .flatten()
        .compose(debounce(500))
        // .map(response => response.body)
        .debug()

    const vdom$ = state$.map( state =>
        div('.container', [
          div([p("Green - Alright, let's get rolling..." + state.extra)]),
          div([p("Blue - Alright, let's get rolling...")])
        ]));

    // This is needed in order to get the onion stream active!
    const defaultReducer$ = xs.of(prevState => {
        if (typeof prevState === 'undefined') {
            return defaultState
        } else {
            return prevState
        }
    });

    const responseReducer$ = validResponse$.map(response => prevState => ({...prevState, core: {...state.core, state: 1}}))

    return {
        DOM: vdom$,
        HTTP: request$,
        onion: xs.merge(defaultReducer$, responseReducer$),
        // alert: CheckSink.alert,
        // popup: CheckSink.popup
    };
}

export default Admin