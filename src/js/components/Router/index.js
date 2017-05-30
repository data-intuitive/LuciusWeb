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
      div('.row', [
        div('.col .s12', [
          p(['Please use ', a({ props: { href: '/statistics' } }, 'the information'), ' provided in ComPass with care. ComPass does not make any claims.']),
        ]),
      ]),
      div('.footer-copyright .row', [
        div('.col .s12', ['© 2017 By Data intuitive'])
      ]),
    ])
  );

  const view$ = page$.map(prop('DOM')).flatten()

  const vdom$ = xs.combine(nav$, view$, footer$)
    .map(([navDom, viewDom, footerDom]) => div(
      [
        navDom,
        main([viewDom]),
        footerDom
      ]));

  // Initialize state
  const defaultReducer$ = xs.of(prevState => {
    console.log("index -- defaultReducer")
    if (typeof prevState === 'undefined') {
      return (
        {
          settings: initSettings,
        })
    } else {
      return clone(prevState)
    }
  });

  return {
    DOM: vdom$,
    router: page$.map(c => c.router || xs.never()).flatten(),
    HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(),
    onion: xs.merge(
      defaultReducer$,
      page$.map(prop('onion')).filter(Boolean).flatten()
    ),
    vega: page$.map(prop('vega')).filter(Boolean).flatten(),
  }

}

// sources.DOM.select('a').events('click')
//                 .debug(ev => ev.preventDefault())
//                 .map(ev => ev.target.pathname),