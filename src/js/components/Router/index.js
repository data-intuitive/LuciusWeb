import xs from 'xstream';
import {div, nav, a, h3, p, ul, li, h2, i, footer, header, main, svg, g, path} from '@cycle/dom';
import {merge, prop} from 'ramda';
import BMI from '../../examples/bmi';
import Hello from '../../examples/hello-world';
import {HttpRequest} from "../../examples/http-request";
import SignatureWorkflow from '../../pages/signature';
import { IsolatedSettings } from '../../pages/settings'
import flattenSequentially from 'xstream/extra/flattenSequentially'
import {pick, mix} from 'cycle-onionify';
import { initSettings } from '../../pages/settings'

function Home(sources) {
  const vdom$ = xs.of(div('.row', [
    h2('.col .s6 .offset-s3', 'Welcome to ComPass !'),
    p('.col .s6 .offset-s3 .flow-text', [
      'This application is the interface with L1000 data. Currently, ',
      'there is support for working with disease profiles expressed using gene lists or signatures.'
    ]),
    div('.col .s6 .offset-s3', [
      div('.col .s12 .green .darken-2 ',  {style : {padding : '10px 10px 10px 10px'}},
      [
        i('.green-text .text-lighten-1 .material-icons', 'play_arrow'),
        a('.green-text .text-lighten-3', {props: {href: '/signature'}, style : {fontWeight : 'bolder', 'font-size' : '32px'}} , ' Disease Workflow')
      ]),
      div('.col .s12 .pink .darken-2 .pink-text', {style : {padding : '10px 10px 10px 10px'}},
      [
        i('.pink-text .text-lighten-1 .material-icons', 'play_arrow'),
        a('.pink-text .text-lighten-3',{props: {href: '/signature'}, style : {fontWeight : 'bolder', 'font-size' : '32px'}} , ' Compound Workflow')
      ]),
    ]),
    p('.col .s6 .offset-s3 .flow-text', [
      'You can click on one of the workflows above to start it.'
    ]),
  ]));

  // const router = sources.DOM.select('a').events('click')
  //   .debug(ev => ev.preventDefault())
  //   .map(ev => ev.target.pathname)

  return {
    DOM: vdom$,
    // router
  };
}

export default function Router(sources) {
  const {router} = sources;

  const state$ = sources.onion.state$.debug(state => {
		console.log('== State in index =================')
		console.log(state)
	});

  const match$ = router.define({
    '/': Home,
    '/bmi': BMI,
    '/hello': Hello,
    '/http': HttpRequest,
    '/signature': SignatureWorkflow,
    '/settings': IsolatedSettings,
    '*': SignatureWorkflow
  });

  const page$ = match$.map(({path, value}) => value(merge(sources, {
    router: router.path(path)
  })))

  const makeLink = (path, label) => li([a({props: {href: path}}, label)]);

  // const nav$ = xs.of(div([
  //     ul('.slide-out .side-nav', [
  //       li(['First Header']),
  //       li(['Second Header'])
  //     ]),
  //     a('.button-collapse', {props: { href : "/", 'data-activates': "slide-out"}}, [i(".material-icons", 'menu'), 'menu'])
  //   ])
  // );

  // const toggle$ = sources.DOM.select('.button-collapse').elements().filter(els => els.length === 1).debug().map(els => els[0].sideNav('show')).startWith(null)

  const nav$ = xs.of(header([nav('#navigation .grey .darken-4', [
      div('.nav-wrapper', [
        a('.brand-logo .right', {props: {href: "/"}}, "ComPass"),
        ul('.left .hide-on-med-and-down', [
            // makeLink('/bmi', 'BMI'),
            // makeLink('/hello', 'Hello'),
            // makeLink('/http', 'Http'),
            makeLink('/signature', 'Disease'),
            makeLink('/signature', 'Compound'),
            makeLink('/settings', 'Settings')
            ])
      ])
    ])
  ]));

  const footer$ = xs.of(
    footer('.page-footer .grey .darken-4 .grey-text', [
        div('.row', [
          div('.col .s12', [
            p(['Please use the information provided in ComPass with care. ComPass does not make any claims.'])
          ]),
        ]),
        div('.footer-copyright .row', [        
          div('.col .s12', ['© 2017 By Data intuitive'])
        ]),
    ])
  )

  const view$ = page$.map(prop('DOM')).flatten();

  const vdom$ = xs.combine(nav$, view$, footer$)
    .map(([navDom, viewDom, footerDom]) => div([navDom, main([viewDom]), footerDom]));

	const defaultReducer$ = xs.of(prevState => {
		console.log("index -- defaultReducer")
		if (typeof prevState === 'undefined') {
			return (
				{
					settings : initSettings,
					query : 'HSPA1A DNAJB1 DDIT4 -TSEN2',
				})
		} else {
			return prevState
		}
	})

  return {
    DOM: vdom$,
    router: page$.map(c => c.router || xs.never()).flatten(), //.startWith('/signature'), //.debug(console.log), //.filter(Boolean)
    HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(),
    onion: xs.merge(defaultReducer$, page$.map(prop('onion')).flatten()), //.filter(Boolean).compose(flattenSequentially),
    vega: page$.map(prop('vega')).filter(Boolean).flatten(),
    }
}

// sources.DOM.select('a').events('click')
//                 .debug(ev => ev.preventDefault())
//                 .map(ev => ev.target.pathname),