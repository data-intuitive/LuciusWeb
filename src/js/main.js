import 'materialize-css/bin/materialize.css';
import 'materialize-css/bin/materialize.js';

import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { makeHistoryDriver, makeServerHistoryDriver, makeHashHistoryDriver, captureClicks } from '@cycle/history'
import storageDriver from '@cycle/storage';
import { makeRouterDriver } from 'cyclic-router';
import onionify from 'cycle-onionify';
import storageify from "cycle-storageify";

import Router from './components/Router/index';
import { makeVegaDriver } from './drivers/makeVegaDriver';
import { logDriver } from './drivers/logDriver';
import { alertDriver } from './drivers/alertDriver';
import { popupDriver } from './drivers/popupDriver'
import { preventDefaultDriver } from './drivers/preventDefaultDriver';
import switchPath from 'switch-path'

import './main.scss'

const drivers = {
    DOM: makeDOMDriver('#root'),
    vega: makeVegaDriver(),
    HTTP: makeHTTPDriver(),
    router: makeRouterDriver(captureClicks(makeServerHistoryDriver()), switchPath),
    preventDefault: preventDefaultDriver,
    alert: alertDriver,
    storage: storageDriver,
    popup: popupDriver,
    log: logDriver
};

// let StatifiedMain = onionify(SignatureWorkflow);
// run(StatifiedMain, drivers);

let StatifiedMain = onionify(storageify(Router, { key: 'ComPass' }));
// let StatifiedMain = onionify(Router);
run(StatifiedMain, drivers);

// if (module.hot) {
// 		module.hot.accept(() => {
// 			main = require('./main').default;
// 			rerun(StateifiedMain, drivers);
// 		});
// 	}

