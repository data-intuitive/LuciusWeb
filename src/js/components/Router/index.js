import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path } from '@cycle/dom';
import { merge, prop, equals } from 'ramda';
import BMI from '../../examples/bmi';
import Hello from '../../examples/hello-world';
import { HttpRequest } from "../../examples/http-request"
import SignatureWorkflow from '../../pages/signature'
import CompoundWorkflow from '../../pages/compound'
import StatisticsWorkflow from '../../pages/statistics'
import TargetWorkflow from '../../pages/target'
import Debug from '../../pages/debug'
import Home from '../../pages/home'
import { Check } from '../Check'
import { IsolatedSettings } from '../../pages/settings'
import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from '../../pages/settings'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'

export default function Router(sources) {
  const { router } = sources;

  const state$ = sources.onion.state$.debug(state => {
    console.log('== State in index =================')
    console.log(state)
  });

  const match$ = router.define({
    '/': Home,
    '/disease': SignatureWorkflow,
    '/compound': CompoundWorkflow,
    '/target': TargetWorkflow,
    '/statistics': StatisticsWorkflow,
    '/settings': IsolatedSettings,
    '/debug': Debug,
    '*': Home
    // '/bmi': BMI,
    // '/hello': Hello,
    // '/http': HttpRequest,
  })
    .remember();

  const page$ = match$.map(({ path, value }) => {
    return value(Object.assign({}, sources, {
      router: sources.router.path(path)
    }))
  })
    // .compose(dropRepeats((x,y) => equal(x,y)))
    .debug('-------------PAGE-----------')
    .remember()

  const makeLink = (path, label, options) => li([a(options, { props: { href: path } }, label)]);

  const nav$ = xs.of(header([nav('#navigation .grey .darken-4', [
    div('.nav-wrapper', [
      a('.brand-logo .right .grey-text', { props: { href: "/" } }, "ComPass"),
      ul('.left .hide-on-med-and-down', [
        // makeLink('/bmi', 'BMI'),
        // makeLink('/hello', 'Hello'),
        // makeLink('/http', 'Http'),
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
      div('.row', {style : {margin: '0px'}}, [
        div('.col .s12', {style : {margin: '0px'}}, [
          p( {style : {margin: '0px'}}, ['Please use ', a({ props: { href: '/statistics' } }, 'the information'), ' provided in ComPass with care. ComPass does not make any claims.']),
          p( {style : {margin: '0px'}}, ['In case of issues, please include the contents of ', a({ props: { href: '/debug' } }, 'this page'), ' in your bug report'])
        ])
      ]),
      div('.footer-copyright .row', {style : {margin: '0px'}}, [
        div('.col .s12 .right-align', ['© 2017 By Data intuitive']),
      ]),
      // div('.row .grey-text', {style : {margin: '0px'}}, [
      //   p('.col .s12', {style : {margin: '0px'}}, ['Debug link:', a({ props: { href: '/debug' } }, 'debug')]),
      // ]),
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
  // Since we use storageify, we only keep the settings
  const defaultReducer$ = xs.of(prevState => {
    console.log("index -- defaultReducer")
    if (typeof prevState === 'undefined') {
      return ({
          settings: initSettings,
        })
    } else {
      // return prevState
      return ({
        settings: prevState.settings
      })
    }
  })
  .debug()

  // Capture link targets and send to router driver
  const router$ = sources.DOM.select('a').events('click')
      .map(ev => ev.target.pathname)

  // All clicks on links should be sent to the preventDefault driver
  const prevent$ = sources.DOM.select('a').events('click').filter(ev => ev.target.pathname == '/debug');

  const preventLogger$ = prevent$.map(c => (['prevent$ triggered', c]))

  const logger$ = xs.merge(
    // stateLogger$,
    preventLogger$
  )

  return {
   DOM: vdom$,
    router: router$,
    HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(), 
    onion: xs.merge(
      defaultReducer$,
      page$.map(prop('onion')).filter(Boolean).flatten()
    ),
    vega: page$.map(prop('vega')).filter(Boolean).flatten(),
    log: xs.merge(logger$, page$.map(prop('log')).filter(Boolean).flatten()),
    preventDefault: prevent$,
   }

}
