import xs from 'xstream';
import {div, nav, a, h3, p, ul, li, h2} from '@cycle/dom';
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
  const vdom$ = xs.of(div([
    h3('Landing page under construction...'),
    p('','... in the meantime, check out the examples above')
  ]));

const router = sources.DOM.select('a').events('click')
    .debug(ev => ev.preventDefault())
    .map(ev => ev.target.pathname)

  return {
    DOM: vdom$,
    router
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

  const nav$ = xs.of(nav('#navigation .grey .darken-4', [
      div('.nav-wrapper', [
        a('.brand-logo .right', {props: {href: "/"}}, "ComPass"),
        ul('.left .hide-on-med-and-down', [
            // makeLink('/bmi', 'BMI'),
            // makeLink('/hello', 'Hello'),
            // makeLink('/http', 'Http'),
            makeLink('/signature', 'Signature'),
            makeLink('/settings', 'Settings')
            ])
      ])
    ])
  );

  const view$ = page$.map(prop('DOM')).flatten();

  const vdom$ = xs.combine(nav$, view$)
    .map(([navDom, viewDom]) => div([navDom, viewDom]));

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
    router: page$.map(c => c.router || xs.never()).flatten().startWith('/signature'), //.debug(console.log), //.filter(Boolean)
    HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(),
    onion: xs.merge(defaultReducer$, page$.map(prop('onion')).flatten()), //.filter(Boolean).compose(flattenSequentially),
    vega: page$.map(prop('vega')).filter(Boolean).flatten(),
    }
}

// sources.DOM.select('a').events('click')
//                 .debug(ev => ev.preventDefault())
//                 .map(ev => ev.target.pathname),