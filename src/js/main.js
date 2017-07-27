import 'materialize-css/bin/materialize.css';
import 'materialize-css/bin/materialize.js';
import './main.css'

import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import {makeHistoryDriver, makeServerHistoryDriver, makeHashHistoryDriver, captureClicks} from '@cycle/history'

import {makeRouterDriver} from 'cyclic-router';
import Router from './components/Router/index';
import onionify from 'cycle-onionify';
import {makeVegaDriver} from './makeVegaDriver';
import SignatureWorkflow from './pages/signature';
import switchPath from 'switch-path'

const drivers = {
  DOM: makeDOMDriver('#root'),
  vega: makeVegaDriver(),
  HTTP: makeHTTPDriver(),
  router: makeRouterDriver(captureClicks(makeServerHistoryDriver()), switchPath),
  preventDefault: event$ => event$.subscribe({ next: e => e.preventDefault() })
};

// let StatifiedMain = onionify(SignatureWorkflow);
// run(StatifiedMain, drivers);

let StatifiedMain = onionify(Router);
run(StatifiedMain, drivers);

if (module.hot) {
		module.hot.accept(() => {
			main = require('./main').default;
			rerun(StateifiedMain, drivers);
		});
	}
