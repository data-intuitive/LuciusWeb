import 'materialize-css/bin/materialize.css';
import 'materialize-css/bin/materialize.js';
import './main.css'

import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import {makeHistoryDriver, makeServerHistoryDriver, makeHashHistoryDriver, captureClicks} from '@cycle/history'
import storageDriver from '@cycle/storage';
import {makeRouterDriver} from 'cyclic-router';
import onionify from 'cycle-onionify';
import storageify from "cycle-storageify";

import Router from './components/Router/index';
import {makeVegaDriver} from './makeVegaDriver';
import SignatureWorkflow from './pages/signature';
import switchPath from 'switch-path'

const drivers = {
  DOM: makeDOMDriver('#root'),
  log: logDriver,
  vega: makeVegaDriver(),
  HTTP: makeHTTPDriver(),
  router: makeRouterDriver(captureClicks(makeServerHistoryDriver()), switchPath),
  preventDefault: event$ => event$.subscribe({ next: e => e.preventDefault() }),
  storage: storageDriver,
};

// let StatifiedMain = onionify(SignatureWorkflow);
// run(StatifiedMain, drivers);

let StatifiedMain = onionify(storageify(Router, {key: 'ComPass'}));
// let StatifiedMain = onionify(Router);
run(StatifiedMain, drivers);


function logDriver(stream$) {
  stream$.addListener({
    next: message => message.map(m => console.log(m)),
    error: e => console.error(e),
    complete: () => {}
  })
}


// if (module.hot) {
// 		module.hot.accept(() => {
// 			main = require('./main').default;
// 			rerun(StateifiedMain, drivers);
// 		});
// 	}
