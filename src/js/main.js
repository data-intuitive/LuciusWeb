import {run} from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import {createHistory} from 'history';
import {makeRouterDriver} from 'cyclic-router';
import Router from './components/Router/index';
import onionify from 'cycle-onionify';
import {makeVegaDriver} from './makeVegaDriver';
import SignatureWorkflow from './pages/signature';
// import switchPath from 'switch-path';

import 'materialize-css/bin/materialize.css';
import 'materialize-css/bin/materialize.js';
// import 'material-design-icons/iconfont/MaterialIcons-Regular.woff2';

const drivers = {
  DOM: makeDOMDriver('#root'),
  vega: makeVegaDriver(),
  HTTP: makeHTTPDriver(),
  router: makeRouterDriver(createHistory(), {capture: true}),
};

let StatifiedMain = onionify(SignatureWorkflow);
run(StatifiedMain, drivers);

// let StatifiedMain = onionify(Router);
// run(StatifiedMain, drivers);