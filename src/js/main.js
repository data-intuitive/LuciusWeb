import 'materialize-css/dist/css/materialize.css';
import 'materialize-css/dist/js/materialize.js';

import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { makeHistoryDriver, makeServerHistoryDriver, makeHashHistoryDriver, captureClicks } from '@cycle/history'
import storageDriver from '@cycle/storage';
import { makeRouterDriver } from 'cyclic-router';
import onionify from 'cycle-onionify';
import storageify from "cycle-storageify";

import Index from './index';
import { makeVegaDriver } from './drivers/makeVegaDriver';
import { logDriver } from './drivers/logDriver';
import { alertDriver } from './drivers/alertDriver';
import { popupDriver } from './drivers/popupDriver'
import { preventDefaultDriver } from './drivers/preventDefaultDriver';
import switchPath from 'switch-path'

import './main.scss'

import fromEvent from 'xstream/extra/fromEvent'
import xs from 'xstream'

const drivers = {
    DOM: makeDOMDriver('#root'),
    vega: makeVegaDriver(),
    HTTP: makeHTTPDriver(),
    router: makeRouterDriver(captureClicks(makeHistoryDriver()), switchPath),
    preventDefault: preventDefaultDriver,
    alert: alertDriver,
    storage: storageDriver,
    popup: popupDriver,
    resize: () => fromEvent(window, 'resize'),
    log: logDriver
};

let StatifiedMain = onionify(storageify(Index, { key: 'ComPass' }));
run(StatifiedMain, drivers);
