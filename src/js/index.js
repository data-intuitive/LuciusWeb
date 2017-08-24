import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats'

import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path } from '@cycle/dom';
import { merge, prop, equals } from 'ramda';

// Workflows
import DiseaseWorkflow from './pages/disease'
import CompoundWorkflow from './pages/compound'
import TargetWorkflow from './pages/target'

// Pages
import StatisticsWorkflow from './pages/statistics'
import Debug from './pages/debug'
import Home from './pages/home'
import { IsolatedSettings } from './pages/settings'

// Utilities
import { Check } from './components/Check'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from './configuration.js'
import { loggerFactory } from './utils/logger'

export default function Index(sources) {
    const { router } = sources;

    const logger = loggerFactory('index', sources.onion.state$, 'settings.common.debug')

    const state$ = sources.onion.state$

    const match$ = router.define({
        '/': Home,
        '/disease': DiseaseWorkflow,
        '/compound': CompoundWorkflow,
        '/target': TargetWorkflow,
        '/statistics': StatisticsWorkflow,
        '/settings': IsolatedSettings,
        '/debug': Debug,
        '*': Home
    })
        .remember();

    const page$ = match$.map(({ path, value }) => {
        return value(Object.assign({}, sources, {
            router: sources.router.path(path)
        }))
    })
        .remember()

    const makeLink = (path, label, options) => li([a(options, { props: { href: path } }, label)]);

    // TODO: Add a visual reference for ghost mode
    // const ghost$ = state$
    //     .filter(state => state.common.ghost)
    //     .compose(dropRepeats(equals))
    //     .mapTo(i('.small .material-icons', 'flight_takeoff'))
    //     .startWith(span())

    const nav$ = xs.of(header([nav('#navigation .grey .darken-4', [
        div('.nav-wrapper', [
            a('.brand-logo .right .grey-text', { props: { href: "/" } }, "ComPass"),
            ul('.left .hide-on-med-and-down', [
                makeLink('/compound', 'Compound', '.orange-text'),
                makeLink('/target', 'Target', '.red-text'),
                makeLink('/disease', 'Disease', '.pink-text'),
                makeLink('/settings', 'Settings', ''),
            ])
        ])
    ])
    ]));

    const footer$ = xs.of(
        footer('.page-footer .grey .darken-4 .grey-text', [
            div('.row', { style: { margin: '0px' } }, [
                div('.col .s12', { style: { margin: '0px' } }, [
                    p({ style: { margin: '0px' } }, ['Please use ', a({ props: { href: '/statistics' } }, 'the information'), ' provided in ComPass with care. ComPass does not make any claims.']),
                    p({ style: { margin: '0px' } }, ['In case of issues, please include the contents of ', a({ props: { href: '/debug' } }, 'this page'), ' in your bug report'])
                ])
            ]),
            div('.footer-copyright .row', { style: { margin: '0px' } }, [
                div('.col .s12 .right-align', ['© 2017 By Data intuitive']),
            ])
        ])
    )

    const view$ = page$.map(prop('DOM')).flatten().remember()

    const vdom$ = xs.combine(nav$, view$, footer$)
        .map(([navDom, viewDom, footerDom]) => div(
            [
                navDom,
                main([viewDom]),
                footerDom
            ]))
        .remember()

    // Initialize state
    // Storageify ensures the state of the application is constantly cached.
    // We only use the settings part of the stored state.
    const defaultReducer$ = xs.of(prevState => {
        // index -- defaultReducer$
        if (typeof prevState === 'undefined') {
            // No pre-existing state information, use default settings
            return ({
                settings: initSettings,
            })
        } else {
            // Pre-existing state information.
            // If default settings are newer, use those.
            return (prevState.settings.version == initSettings.version)
                ? ({ settings: prevState.settings })
                : ({ settings: initSettings })
        }
    })

    // Capture link targets and send to router driver
    const router$ = sources.DOM.select('a').events('click')
        .map(ev => ev.target.pathname)
        .remember()

    // All clicks on links should be sent to the preventDefault driver
    const prevent$ = sources.DOM.select('a').events('click').filter(ev => ev.target.pathname == '/debug');

    const history$ = sources.onion.state$.fold((acc, x) => acc.concat([x]), [{}])

    return {
        log: xs.merge(
            // logger(page$, 'page$', '>> ', ' > ', ''),
            logger(state$, 'state$'),
            logger(history$, 'history$'),
            // logger(prevent$, 'prevent$'),
            page$.map(prop('log')).filter(Boolean).flatten()
        ),
        onion: xs.merge(
            defaultReducer$,
            page$.map(prop('onion')).filter(Boolean).flatten()
        ),
        DOM: vdom$,
        router: router$,
        HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(),
        vega: page$.map(prop('vega')).filter(Boolean).flatten(),
        alert: page$.map(prop('alert')).filter(Boolean).flatten(),
        preventDefault: xs.merge(
            prevent$,
            page$.map(prop('preventDefault')).filter(Boolean).flatten()
        ),
        popup: page$.map(prop('popup')).filter(Boolean).flatten()
    }

}
