import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path } from '@cycle/dom';
import { merge, prop, equals } from 'ramda';
import BMI from '../../examples/bmi';
import Hello from '../../examples/hello-world';
import { HttpRequest } from "../../examples/http-request"
import SignatureWorkflow from '../../pages/signature'
import CompoundWorkflow from '../../pages/compound'
import StatisticsWorkflow from '../../pages/statistics'
import { Check } from '../Check'
import { IsolatedSettings } from '../../pages/settings'
import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from '../../pages/settings'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'

function TargetWorkflow(sources) {

  const vdom$ = xs.of(
    div([
      div('.row .red .darken-4', [
        h2('.col .s10 .s-offset-1 .red-text .text-lighten-4', ['This workflow is under construction']),
      ]),
      div('.row .red .lighten-5', { style: { height: '500px' } })
    ])
  )

  const router$ = sources.DOM.select('a').events('click')
    .debug(ev => ev.preventDefault())
    .map(ev => ev.target.pathname)
    .debug()

  return {
    DOM: vdom$,
    // router: router$
  };

}

function Home(sources) {

  const checkProps$ = sources.onion.state$
    .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
    .startWith({ settings: initSettings })
    .map(state => merge(state.settings.form, state.settings.api))
  const CheckSink = Check(merge(sources, { props: checkProps$ }))

  const vdom$ = xs.combine(CheckSink.DOM, xs.of(''))
    .map(([check, r]) => div('.row', [
      h2('.col .s6 offset-s3', ['Welcome to ComPass', check]),
      p('.col .s6 .offset-s3 .flow-text', [
        'This application is the interface with L1000 data. Currently, ',
        'there is support for working with disease profiles expressed using gene lists or signatures and compound similarity.'
      ]),
      div('.col .s6 .offset-s3', [
        div('.col .s12 .pink .darken-4', { style: { padding: '10px 10px 10px 10px' } },
          [
            i('.pink-text .text-lighten-1 .material-icons', 'play_arrow'),
            a('.pink-text .text-lighten-3', { props: { href: '/disease' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Disease Workflow')
          ]),
        div('.row', []),
        div('.col .s12 .orange .darken-4 .pink-text', { style: { padding: '10px 10px 10px 10px' } },
          [
            i('.orange-text .text-lighten-1 .material-icons', 'play_arrow'),
            a('.orange-text .text-lighten-3', { props: { href: '/compound' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Compound Workflow')
          ]),
        div('.row', []),
        div('.col .s12 .red .darken-4 .pink-text', { style: { padding: '10px 10px 10px 10px' } },
          [
            i('.red-text .text-lighten-1 .material-icons', 'play_arrow'),
            a('.red-text .text-lighten-4', { props: { href: '/target' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Target Workflow')
          ]),
      ]),
      p('.col .s6 .offset-s3 .flow-text', [
        'You can click on one of the workflows above to start it.'
      ]),
      // p('.col .s6 .offset-s3', [
      //   'Interface status: ', 
      //   check
      // ]),
    ]));

  const router$ = sources.DOM.select('a').events('click')
    .debug(ev => ev.preventDefault())
    .map(ev => ev.target.pathname)

  return {
    DOM: vdom$,
    router: router$,
    HTTP: CheckSink.HTTP,
    onion: CheckSink.onion
  };
}

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

  const makeLink = (path, label) => li([a({ props: { href: path } }, label)]);

  const nav$ = xs.of(header([nav('#navigation .grey .darken-4', [
    div('.nav-wrapper', [
      a('.brand-logo .right .grey-text', { props: { href: "/" } }, "ComPass"),
      ul('.left .hide-on-med-and-down', [
        // makeLink('/bmi', 'BMI'),
        // makeLink('/hello', 'Hello'),
        // makeLink('/http', 'Http'),
        makeLink('/disease', 'Disease'),
        makeLink('/compound', 'Compound'),
        makeLink('/target', 'Target'),
        // makeLink('/statistics', 'Statistics'),
        makeLink('/settings', 'Settings')
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