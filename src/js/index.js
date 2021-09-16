import xs from 'xstream'

import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, span } from '@cycle/dom'
import { merge, prop, mergeDeepRight } from 'ramda'
import * as R from 'ramda'

// Workflows
import DiseaseWorkflow from './pages/disease'
import CompoundWorkflow from './pages/compound'
import TargetWorkflow from './pages/target'
import CorrelationWorkflow from './pages/correlation'

// Pages
import StatisticsWorkflow from './pages/statistics'
import Debug from './pages/debug'
import Home from './pages/home'
import { IsolatedSettings } from './pages/settings'
import { IsolatedAdminSettings } from './pages/adminSettings'

// Utilities
import { initSettings } from './configuration.js'
import initDeployments from '../../deployments.json'
import { loggerFactory } from './utils/logger'

export default function Index(sources) {
  const {router} = sources;

  const logger = loggerFactory('index', sources.onion.state$, 'settings.common.debug')

  const state$ = sources.onion.state$

  const page$ = router.routedComponent({
    '/': Home,
    '/disease' : DiseaseWorkflow,
    // '/disease': {
    //   '/': DiseaseWorkflow,
    //   // '/:id': id => sources => DiseaseWorkflow({props$: id, ...sources})
    // },
    '/compound': CompoundWorkflow,
    '/target': TargetWorkflow,
    '/statistics': StatisticsWorkflow,
    '/settings': IsolatedSettings,
    '/correlation': CorrelationWorkflow,
    '/debug': Debug,
    '/admin': IsolatedAdminSettings,
    '*': Home
  })(sources)

    const makeLink = (path, label, options) => li([a(options, { props: { href: path } }, label)]);

    // TODO: Add a visual reference for ghost mode
    // const ghost$ = state$
    //     .filter(state => state.common.ghost)
    //     .compose(dropRepeats(equals))
    //     .mapTo(i('.small .material-icons', 'flight_takeoff'))
    //     .startWith(span())

    const compoundSVG = svg({ attrs: { height: '16pt', viewBox: '0 0 20 30' } }, [
        svg.g([
            svg.path({ attrs: { d: 'M17,2L17,2c-2.1,0-3,0.5-3,3v7h-4V5c0-2.5-0.9-3-3-3l0,0L6,2v2h1c0.7,0,1,0.4,1,1v12c0,5.2,4,5,4,5s4,0.2,4-5V5c0-0.6,0.3-1,1-1h1V2L17,2z', stroke: '#ff9800' } })
        ])
    ])

    const targetSVG = svg({ attrs: { height: '18pt', viewBox: '0 0 20 30' } }, [
        svg.g([
            svg.path({ attrs: { stroke: '#f44335', d: 'M22.7,9.7l-1.4-1.4c-0.4,0.4-0.8,0.8-1.2,1.1l-5.4-5.4c0.3-0.4,0.7-0.8,1.1-1.2l-1.4-1.4c-3.4,3.4-3.6,6.7-3.4,9.6c-3-0.2-6.3,0-9.6,3.4l1.4,1.4c0.4-0.4,0.8-0.8,1.2-1.1l5.4,5.4c-0.3,0.4-0.7,0.8-1.1,1.2l1.4,1.4c3.4-3.4,3.5-6.6,3.4-9.6C16,13.3,19.3,13.1,22.7,9.7z M19.2,9.9c-0.9,0.5-1.7,0.8-2.6,1l-3.6-3.6c0.2-0.9,0.5-1.7,1-2.6L19.2,9.9z M11.1,12.9c0.1,0.8,0.1,1.6,0,2.4l-2.5-2.5C9.4,12.9,10.2,12.9,11.1,12.9z M4.8,14.1c0.9-0.5,1.7-0.8,2.6-1l3.6,3.6c-0.2,0.9-0.5,1.7-1,2.6L4.8,14.1z M12.9,11.1c-0.1-0.8-0.1-1.7,0-2.5l2.5,2.5C14.6,11.2,13.8,11.1,12.9,11.1z' } })
        ])
    ])

    const diseaseSVG = svg({ attrs: { height: '16pt', viewBox: "0 0 13.421 13.421" } }, [
        svg.g([
            svg.path({ attrs: { stroke: '#e91e63', d: 'M12.843,8.669c-0.907-0.542-2.619-0.031-4.944,1.476c-1.507,0.977-2.618,1.269-3.215,0.846c-0.871-0.616-0.709-2.674-0.498-3.862h0.179c0.122,0,0.222-0.099,0.222-0.223V6.467C5.192,6,7.47,4.183,7.786,3.013c0.361-1.327-1.672-2.181-2.264-2.399c0.01-0.127-0.061-0.249-0.188-0.29l-0.22-0.072C4.967,0.204,4.809,0.285,4.76,0.433L4.63,0.831C4.582,0.978,4.663,1.138,4.811,1.185l0.222,0.072c0.08,0.026,0.161,0.011,0.228-0.028c0.742,0.266,2.06,0.957,1.884,1.609C6.907,3.713,4.932,5.367,4.121,5.984H3.71C2.9,5.366,0.924,3.713,0.687,2.838c-0.175-0.645,1.116-1.329,1.86-1.602c0.069,0.056,0.159,0.084,0.25,0.058l0.225-0.061c0.149-0.041,0.237-0.195,0.195-0.345l-0.11-0.404c-0.042-0.15-0.196-0.238-0.346-0.196l-0.225,0.06C2.416,0.381,2.34,0.487,2.333,0.604c-0.553,0.2-2.657,1.06-2.291,2.409C0.348,4.14,2.475,5.869,3.17,6.411v0.495c0,0.124,0.099,0.223,0.222,0.223h0.116c-0.205,1.189-0.429,3.543,0.79,4.406c0.296,0.212,0.646,0.316,1.051,0.316c0.767,0,1.731-0.381,2.913-1.146c2.975-1.928,3.998-1.606,4.241-1.462c0.187,0.11,0.27,0.305,0.249,0.576c-0.03,0.38-0.284,0.863-0.708,1.177c-0.249-0.324-0.641-0.535-1.08-0.535c-0.751,0-1.36,0.611-1.36,1.361s0.609,1.361,1.36,1.361s1.361-0.611,1.361-1.361c0-0.067-0.007-0.133-0.016-0.198c0.608-0.394,1.053-1.076,1.106-1.753C13.456,9.348,13.247,8.909,12.843,8.669z M10.963,12.517c-0.383,0-0.694-0.313-0.694-0.695s0.312-0.694,0.694-0.694c0.216,0,0.405,0.101,0.533,0.255c0.14,0.115,0.106,0.252,0.159,0.431c0,0.003,0.003,0.005,0.003,0.009C11.659,12.204,11.347,12.517,10.963,12.517z' } })
        ])
    ])
    const settingsSVG = svg({ attrs: { height: '18pt', viewBox: "10 5 34 34" } }, [
        svg.g([
            svg.path({ attrs: { stroke: 'grey', d: 'M31.92529,22.74756l-2.11786-0.23932c-0.13806-0.56036-0.35303-1.08813-0.6424-1.5777    l1.31934-1.65271c0.31543-0.39502,0.28467-0.96387-0.07129-1.32324l-0.3667-0.36963    c-0.3584-0.36084-0.92773-0.39746-1.32764-0.0791l-1.64514,1.30609c-0.51428-0.31042-1.04895-0.55225-1.60339-0.68939    l-0.22852-2.04688c-0.05615-0.50488-0.48193-0.88574-0.99023-0.88574H23.7373c-0.50781,0-0.93359,0.38037-0.98975,0.88477    l-0.22705,2.01465c-0.60547,0.14062-1.16748,0.36572-1.67676,0.67139l-1.56299-1.25195    c-0.39795-0.31836-0.96826-0.28662-1.32764,0.07275l-0.37207,0.37207c-0.35889,0.35938-0.39062,0.9292-0.07373,1.32617    l1.23047,1.54004c-0.3335,0.53223-0.57666,1.10547-0.7251,1.71045l-1.93848,0.21729    c-0.50391,0.05713-0.88428,0.48291-0.88428,0.99023v0.51416c0,0.50732,0.38037,0.93311,0.88477,0.99023l1.9375,0.21729    c0.15039,0.62012,0.39062,1.19727,0.71631,1.72021l-1.22314,1.53955c-0.31543,0.39844-0.28174,0.96875,0.0791,1.32666    l0.37012,0.36719c0.19336,0.19141,0.44727,0.28906,0.70166,0.28906c0.21924,0,0.43896-0.07227,0.62158-0.21826l1.54688-1.23584    c0.52277,0.31171,1.09503,0.52338,1.69385,0.66364l0.22852,2.0141c0.05713,0.50391,0.48291,0.88428,0.98975,0.88428h0.51514    c0.50732,0,0.93311-0.38037,0.99023-0.88525l0.2301-2.05066c0.57428-0.14661,1.1181-0.3772,1.62494-0.6897l1.6225,1.29749    c0.18311,0.14648,0.40283,0.21826,0.62207,0.21826c0.25586,0,0.51074-0.09814,0.70459-0.29199l0.36377-0.36377    c0.35742-0.35791,0.39014-0.92725,0.0752-1.32373l-1.31097-1.65137c0.29071-0.49188,0.50586-1.02307,0.64325-1.58789    l2.10815-0.23877c0.50391-0.05713,0.88428-0.48291,0.88428-0.98975V23.7373    C32.81006,23.22949,32.42969,22.80371,31.92529,22.74756z M27.03174,24.00879c0,1.71094-1.39209,3.10303-3.10303,3.10303    c-1.71533,0-3.11084-1.39209-3.11084-3.10303c0-1.71533,1.39551-3.11084,3.11084-3.11084    C25.63965,20.89795,27.03174,22.29346,27.03174,24.00879z' } })
        ])
    ])

    const nav$ = xs.of(header([nav('#navigation .grey .darken-4', [
        div('.nav-wrapper', [
            a('.brand-logo .right .grey-text', { props: { href: "/" } },
                div({ style: { width: '140px' } }, logoSVG),
                // span('.gradient', 'ComPass')
            ),
            ul('.left .hide-on-med-and-down', [
                makeLink('/compound', span(['Compound', ' ', compoundSVG]), '.orange-text'),
                makeLink('/target', span(['Target', ' ', targetSVG]), '.red-text'),
                makeLink('/disease', span(['Disease', ' ', diseaseSVG]), '.pink-text'),
                makeLink('/settings', span(['Settings', ' ', settingsSVG]), '.grey-text'),
                // makeLink('/admin', span(['Admin']), '.blue-text'),
                makeLink('/correlation', span('.grey-text .text-darken-3','', ["v", VERSION]), ''),
            ])
        ])
    ])]));

    // We combine with state in order to read the customizations
    // This works because the defaultReducer runs before anything else
    const footer$ = state$
          .map(state =>
              footer('.page-footer .grey .darken-4 .grey-text', [
                  div('.row', { style: { margin: '0px' } }, [
                      div('.col .s12', { style: { margin: '0px' } }, [
                          p({ style: { margin: '0px' } }, [
                              'Please use ',
                              a({ props: { href: '/statistics' } },
                                  'the information'),
                              ' provided in ComPass with care. ',
                              'Work instructions can be found via this link: ',
                              a({ props: { href: state.settings.deployment.customizations.wi } }, 'Work Instructions.')
                          ]),
                          p({ style: { margin: '0px' } }, [
                              'ComPass does not make any claims. ',
                              'In case of issues, please include the contents of ', a({ props: { href: '/debug' } }, 'this page'), ' in your bug report'
                          ]),
                      ])
                  ]),
                  div('.footer-copyright .row', { style: { margin: '0px' } }, [
                      div('.col .s12 .right-align', ['© 2020 By Data intuitive']),
                  ])
              ])
            )

    const view$ = page$.map(prop('DOM')).flatten().remember()

    const vdom$ = xs.combine(nav$, view$, footer$)
        .map(([navDom, viewDom, footerDom]) => div({
            style: {
                display: 'flex',
                'min-height': '100vh',
                'flex-direction': 'column',
                'height': '100%'
            }
        }, [
            navDom,
            main([viewDom]),
            footerDom
        ]))
        .remember()

    // Initialize state
    // Storageify ensures the state of the application is constantly cached.
    // We only use the settings part of the stored state.
    // Please note: with the addition of 'deployments', the requested deployment is added to the settings
    // Overwrite recursively with the values from `deployments.json` using Ramda's `mergeDeepRight`
    // The wanted deployment is contained in initSettings.deployment already without further details
    // When it comes to component isolation, having the admin and user configuration together under the
    // related key in settings makes sense. So we add the respective entries from deployment to where they should appear
    const defaultReducer$ = xs.of(prevState => {
        // Which deployment to use?
        const desiredDeploymentName = initSettings.deployment.name
        // Fetch the deployment
        const desiredDeployment = R.head(initDeployments.filter(x => x.name == desiredDeploymentName))
        // Merge the deployment in settings.deployment
        const updatedDeployment = mergeDeepRight(initSettings.deployment, desiredDeployment)
        // Merge the updated deployment with the settings, by key.
        const updatedSettings = merge(initSettings, { deployment : updatedDeployment})
        // Do the same with the administrative settings
        const distributedAdminSettings = mergeDeepRight(updatedSettings, updatedSettings.deployment.services)
        if (typeof prevState === 'undefined') {
            // No pre-existing state information, use default settings
            return ({
                settings: distributedAdminSettings,
            })
        } else {
            // Pre-existing state information.
            // If default settings are newer, use those.
            return (prevState.settings.version == initSettings.version) ?
                ({ settings: prevState.settings }) :
                ({ settings: distributedAdminSettings })
        }
    })

    const deploymentsReducer$ = sources.deployments.map(deployments => prevState => {
        // Which deployment to use?
        const desiredDeploymentName = prevState.settings.deployment.name
        // Fetch the deployment
        const desiredDeployment = R.head(deployments.filter(x => x.name == desiredDeploymentName))
        // Merge the deployment in settings.deployment
        const updatedDeployment = mergeDeepRight(prevState.settings.deployment, desiredDeployment)
        // Merge the updated deployment with the settings, by key.
        const updatedSettings = merge(prevState.settings, { deployment : updatedDeployment})
        // Do the same with the administrative settings
        const distributedAdminSettings = mergeDeepRight(updatedSettings, updatedSettings.deployment.services)
        return ({...prevState, settings: distributedAdminSettings })
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
            deploymentsReducer$,
            page$.map(prop('onion')).filter(Boolean).flatten()
        ),
        DOM: vdom$,
        router: xs.merge(router$, page$.map(prop('router')).filter(Boolean).flatten()).remember(),
        HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(),
        vega: page$.map(prop('vega')).filter(Boolean).flatten(),
        alert: page$.map(prop('alert')).filter(Boolean).flatten(),
        preventDefault: xs.merge(
            prevent$,
            page$.map(prop('preventDefault')).filter(Boolean).flatten()
        ),
        popup: page$.map(prop('popup')).filter(Boolean).flatten(),
        modal: page$.map(prop('modal')).filter(Boolean).flatten(),
        ac: page$.map(prop('ac')).filter(Boolean).flatten(),
        storage: page$.map(prop('storage')).filter(Boolean).flatten(),
        deployments: page$.map(prop('deployments')).filter(Boolean).flatten()
    }

}

export const logoSVG = svg({ id: 'logo', attrs: { viewBox: "159 26 1060 460" } }, [
    svg.defs([
        svg.linearGradient({ attrs: { id: 'gradient', x1: '0%', y1: '0%', x2: '100%', y2: '100%', gradientUnits: "userSpaceOnUse" } }, [
            svg.stop({ attrs: { offset: "0%" }, style: { "stop-color": "#ff9800", "stop-opacity": "1" } }),
            svg.stop({ attrs: { offset: "50%" }, style: { "stop-color": "#f44336", "stop-opacity": "1" } }),
            svg.stop({ attrs: { offset: "100%" }, style: { "stop-color": "#e91e63", "stop-opacity": "1" } })
        ])
    ]),
    svg.g({ attrs: { fill: "url(#gradient)" } }, [
        svg.path({ attrs: { d: 'M 389 256 L 389 26 L 342 201 Z', } }),
        svg.path({ attrs: { d: 'M 389 256 L 159 256 L 334 303 Z' } }),
        svg.path({ attrs: { d: 'M 389 256 L 389 486 L 436 311 Z' } }),
        svg.path({ attrs: { d: 'M 389 256 L 619 256 L 444 209 Z' } }),
        svg.text({ attrs: { 'font-family': "Calibri", 'font-size': "160", 'font-weight': "bold", x: "450", y: "398" } }, 'COMPASS'),
        svg.rect({ attrs: { x: "466", y: "240.5", width: "800", height: "15.5" } }),
        // svg.text({ attrs: { 'font-family': "Calibri", 'font-size': "40", 'font-weight': "bold", x: "497", y: "450" } }, 'COMPUTATIONAL SCIENCES'),
        // svg.path({ attrs: { d: "M 1111.1316 329.63885 C 1111.7629 340.6366 1119.8291 350.53146 1131.0461 350.7098 C 1142.2632 350.8882 1154.6805 342.4446 1153.2188 331.05904 C 1151.7572 319.67348 1142.7102 319.24054 1132.1177 316.17612 C 1121.5253 313.11165 1130.3999 308.0055 1130.3999 308.0055 C 1130.3999 308.0055 1134.739 305.7016 1139.3956 304.96687 C 1144.0522 304.23215 1147.434 306.17886 1149.1073 306.1567 C 1150.7806 306.13453 1150.2077 300.1209 1149.0792 298.99964 C 1147.9508 297.87838 1138.8401 295.20424 1130.1026 299.3452 C 1121.365 303.48615 1118.0291 308.5461 1118.0291 308.5461 C 1118.0291 308.5461 1110.5002 318.6411 1111.1316 329.63885 Z" } }),
        // svg.path({ attrs: { d: "M 1123.1925 334.362 C 1124.9592 338.72802 1129.5795 341.5972 1134.138 340.08526 C 1138.6965 338.57332 1142.5552 333.3991 1140.3996 328.99328 C 1138.244 324.58742 1134.0469 325.6506 1129.3442 325.9052 C 1124.6415 326.1598 1122.6041 322.6 1122.6041 322.6 L 1122.3587 325.91298 C 1122.3587 325.91298 1121.4258 329.996 1123.1925 334.362 Z", fill: "white" } }),
        // svg.ellipse({ attrs: { cx: "1130.6581", cy: "328.0728", rx: "5.658064", ry: "6.727217" } }),
        // svg.ellipse({ attrs: { cx: "1130.6581", cy: "329.1", rx: "2.554036", ry: "2.1000034", fill: "white" } }),

    ])
])


const homeSVG = svg({ attrs: { 'vertical-align': 'baseline', height: '30pt', width: '30pt', viewBox: '1020 -226 972 972' } }, [
    svg.a({ attrs: { 'xlink:href': "/target" } }, [
        // TARGET
        svg.path({
            attrs: {
                id: "target",
                d: "M 1506.0454 -136.98166 L 1506.0454 -225 C 1420.9163 -225 1337.2871 -202.5916 1263.5632 -160.02709 C 1031.6083 -26.107868 952.1347 270.4917 1086.0539 502.4466 L 1162.28 458.43743 C 1052.6664 268.58106 1117.716 25.81266 1307.5724 -83.80097 C 1367.9158 -118.64026 1436.3668 -136.98165 1506.0454 -136.98166 Z",
                fill: "#f44335"
            }
        }),
        svg.text([
            svg.textPath({ attrs: { 'xlink:href': "#target", startOffset: "80%" } }, [
                svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'text-anchor': "middle", 'letter-spacing': 15, 'font-weight': "bold", fill: "#ebebeb", dy: "-20" } }, "TARGET")
            ])
        ]),
        svg.path({
            attrs: {
                d: "M 1506.0454 -136.98166 L 1506.0454 -225 C 1420.9163 -225 1337.2871 -202.5916 1263.5632 -160.02709 C 1031.6083 -26.107868 952.1347 270.4917 1086.0539 502.4466 L 1162.28 458.43743 C 1052.6664 268.58106 1117.716 25.81266 1307.5724 -83.80097 C 1367.9158 -118.64026 1436.3668 -136.98165 1506.0454 -136.98166 Z",
                stroke: "white",
                'fill-opacity': '0',
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'stroke-width': "6"
            }
        })
    ]),
    // DISEASE
    svg.a({ attrs: { 'xlink:href': "/disease" } }, [
        svg.path({
            attrs: {
                id: "disease",
                d: "M 1849.8108 458.43743 L 1926.0369 502.4466 C 1968.6014 428.7227 1991.0098 345.09344 1991.0098 259.9644 C 1991.0098 -7.8740405 1773.8838 -225 1506.0454 -225 L 1506.0454 -136.98166 C 1725.2726 -136.98166 1902.9914 40.73715 1902.9914 259.9644 C 1902.9914 329.643 1884.65 398.094 1849.8108 458.4374 Z",
                fill: "#e91e63"
            }
        }),
        svg.text([
            svg.textPath({ attrs: { 'xlink:href': "#disease", startOffset: "80%" } }, [
                svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'text-anchor': "middle", 'letter-spacing': 15, 'font-weight': "bold", fill: "#ebebeb", dy: "-20" } }, "DISEASE")
            ])
        ]),
        svg.path({
            attrs: {
                d: "M 1849.8108 458.43743 L 1926.0369 502.4466 C 1968.6014 428.7227 1991.0098 345.09344 1991.0098 259.9644 C 1991.0098 -7.8740405 1773.8838 -225 1506.0454 -225 L 1506.0454 -136.98166 C 1725.2726 -136.98166 1902.9914 40.73715 1902.9914 259.9644 C 1902.9914 329.643 1884.65 398.094 1849.8108 458.4374 Z",
                stroke: "white",
                'fill-opacity': '0',
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'stroke-width': "6"
            }
        })
    ]),
    // COMPOUND
    svg.a({ attrs: { 'xlink:href': "/compound" } }, [
        svg.path({
            attrs: {
                id: "compound",
                d: "M 1162.28 458.43743 L 1086.0539 502.4466 C 1128.6184 576.1705 1189.8393 637.3914 1263.5632 679.9559 C 1495.518 813.8751 1792.1177 734.4015 1926.0369 502.4466 L 1849.8108 458.43743 C 1740.1971 648.2938 1497.4287 713.3434 1307.5724 603.7298 C 1247.229 568.8905 1197.1193 518.7809 1162.28 458.43745 Z",
                fill: "#ff9800"
            }
        }),
        svg.text([
            svg.textPath({ attrs: { 'xlink:href': "#compound", startOffset: "29%" } }, [
                svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'text-anchor': "middle", 'letter-spacing': 15, 'font-weight': "bold", fill: "#ebebeb", dy: "-20" } }, "COMPOUND")
            ])
        ]),
        svg.path({
            attrs: {
                d: "M 1162.28 458.43743 L 1086.0539 502.4466 C 1128.6184 576.1705 1189.8393 637.3914 1263.5632 679.9559 C 1495.518 813.8751 1792.1177 734.4015 1926.0369 502.4466 L 1849.8108 458.43743 C 1740.1971 648.2938 1497.4287 713.3434 1307.5724 603.7298 C 1247.229 568.8905 1197.1193 518.7809 1162.28 458.43745 Z",
                stroke: "white",
                'fill-opacity': '0',
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'stroke-width': "6"
            }
        })
    ]),
    svg.g([
        // DISEASE - PHENO
        svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1506.0454 -.035595944 C 1645.2211 -.035595944 1758.0454 112.78865 1758.0454 251.9644 C 1758.0454 296.19964 1746.4014 339.65556 1724.2838 377.9644 Z", fill: "#e92363", 'fill-opacity': ".5" } }),
        svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1506.0454 -.035595944 C 1645.2211 -.035595944 1758.0454 112.78865 1758.0454 251.9644 C 1758.0454 296.19964 1746.4014 339.65556 1724.2838 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6", 'fill-opacity': '0' } }),
        svg.text({ attrs: { transform: "translate(1529.807 150.726)", fill: "white" } }, [
            svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'font-weight': "bold", fill: "white", x: ".18359375", y: "56", textLength: "198.63281" } }, 'PHENO')
        ]),

        svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", fill: "#fe9801", 'fill-opacity': ".5" } }),
        svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6", 'fill-opacity': '0' } }),
        // svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6" } }),


        svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1287.807 377.9644 C 1218.2191 257.43466 1259.5156 103.31388 1380.0454 33.726002 C 1418.3542 11.608383 1461.8101 -.035595944 1506.0454 -.035595944 Z", fill: "#f44335", 'fill-opacity': ".5" } }),
        svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1287.807 377.9644 C 1218.2191 257.43466 1259.5156 103.31388 1380.0454 33.726002 C 1418.3542 11.608383 1461.8101 -.035595944 1506.0454 -.035595944 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6", 'fill-opacity': '0' } }),

        svg.text({ attrs: { transform: "translate(1309.807 150.726)", fill: "white" } }, [
            svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'font-weight': "bold", fill: "white", x: ".29589844", y: "56", textLength: "158.4082" } }, 'GENO')
        ]),


        svg.text({ attrs: { transform: "translate(1406.807 358.726)", fill: "white" } }, [
            svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'font-weight': "bold", fill: "white", x: ".3076172", y: "56", textLength: "209.38477" } }, 'CHEMO')
        ]),


    ])
])
