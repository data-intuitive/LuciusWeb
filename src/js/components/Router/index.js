import xs from 'xstream';
import {div, nav, a, h3, p, ul, li, h2} from '@cycle/dom';
import {merge, prop} from 'ramda';
import BMI from '../../examples/bmi';
import Hello from '../../examples/hello-world';
import {HttpRequest} from "../../examples/http-request";
import SignatureWorkflow from '../../pages/signature';

function NotFound(sources) {
  const vdom$ = xs.of(div([
    h3('Landing page under construction...'),
    p('','... in the meantime, check out the examples above')
  ]));

  return {
    DOM: vdom$,
  };
}

export default function Router(sources) {
  const {router} = sources;

  const match$ = router.define({
    '/bmi': BMI,
    '/hello': Hello,
    '/http': HttpRequest,
    '/signature': SignatureWorkflow,
    '*': NotFound
  });

  const page$ = match$.map(({path, value}) => value(merge(sources, {
    path: router.path(path)
  })));

  // const routed$ = match$.map(({path, value}) => path)

  const makeLink = (path, label) => li([a({props: {href: path}}, label)]);

  const nav$ = xs.of(nav('#navigation .grey .darken-3', [
    div('.nav-wrapper', [
      a('.brand-logo .right', {props: {href: "/"}}, "ComPass"),
      ul('.left .hide-on-med-and-down', [
          makeLink('/bmi', 'BMI'),
          makeLink('/hello', 'Hello'),
          makeLink('/http', 'Http'),
          makeLink('/signature', 'signature')
          ])
     ])
  ])
  );

  const view$ = page$.map(prop('DOM')).flatten();

  const vdom$ = xs.combine(nav$, view$)
    .map(([navDom, viewDom]) => div([navDom, viewDom]));

  return {
    DOM: vdom$,
    HTTP: page$.map(prop('HTTP')).filter(Boolean).flatten(),
    onion: page$.map(prop('onion')).flatten(),
    vega: page$.map(prop('vega')).filter(Boolean).flatten(),
    }
}
