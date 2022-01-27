import 'materialize-css/dist/css/materialize.css';

require('../../favicon.ico')

import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { makeHistoryDriver, makeServerHistoryDriver, makeHashHistoryDriver, captureClicks } from '@cycle/history'
import storageDriver from '@cycle/storage';
// import { makeRouterDriver } from 'cyclic-router';
import {routerify} from 'cyclic-router'
import onionify from 'cycle-onionify';
import storageify from "cycle-storageify";
import delay from 'xstream/extra/delay'

import Index from './index';

import { makeVegaDriver } from './drivers/makeVegaDriver';
import { logDriver } from './drivers/logDriver';
import { alertDriver } from './drivers/alertDriver';
import { popupDriver } from './drivers/popupDriver'
import { preventDefaultDriver } from './drivers/preventDefaultDriver';
import switchPath from 'switch-path'
import { makeModalDriver } from './drivers/makeModalDriver'
import { makeAutocompleteDriver } from './drivers/makeAutocompleteDriver';
import { makeSidenavDriver } from './drivers/makeSidenavDriver';
import { clipboardDriver } from './drivers/clipboardDriver';
import './main.scss'

import fromEvent from 'xstream/extra/fromEvent'
import xs from 'xstream'

console.log(VERSION)

const drivers = {
    DOM: makeDOMDriver('#root'),
    vega: makeVegaDriver(),
    HTTP: makeHTTPDriver(),
    // router: makeRouterDriver(captureClicks(makeHistoryDriver()), switchPath),
    history: makeHistoryDriver({forceRefresh: false}),
    preventDefault: preventDefaultDriver,
    alert: alertDriver,
    storage: storageDriver,
    popup: popupDriver,
    resize: () => fromEvent(window, 'resize'),
    log: logDriver,
    modal: makeModalDriver(),
    ac: makeAutocompleteDriver(),
    sidenav: makeSidenavDriver(),
    clipboard: clipboardDriver,
    deployments: () => xs.fromPromise(fetch('/deployments.json').then(m => m.json()))
};

const customSwitchPath = (sourcePath, routes) => {

    console.log("sourcePath: " + sourcePath)
    console.log("routes:")
    console.log(routes)
    return switchPath(sourcePath, routes)
}

let StatifiedMain = onionify(storageify(routerify(Index, customSwitchPath, {omitHistory: false}), { key: 'ComPass' }));
run(StatifiedMain, drivers);
