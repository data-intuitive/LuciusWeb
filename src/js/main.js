import 'materialize-css/dist/css/materialize.css';
import 'materialize-css/extras/noUiSlider/nouislider.css'

require('../../public/favicon.ico')

import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { makeHistoryDriver, makeServerHistoryDriver, makeHashHistoryDriver, captureClicks } from '@cycle/history'
import storageDriver from '@cycle/storage';
// import { makeRouterDriver } from 'cyclic-router';
import {routerify} from 'cyclic-router'
import {withState} from '@cycle/state'
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
import { makeSliderDriver } from './drivers/makeSliderDriver'
import { makeFloatingActionButtonDriver } from './drivers/makeFloatingActionButtonDriver';
import { makeClipboardDriver } from './drivers/makeClipboardDriver'
import '../sass/main.scss'

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
    slider: makeSliderDriver(),
    fab: makeFloatingActionButtonDriver(),
    clipboard: makeClipboardDriver(),
    deployments: () => xs.fromPromise(fetch('/deployments.json').then(m => m.json()))
};

let StatifiedMain = withState(/*storageify(*/routerify(Index, switchPath, {omitHistory: false})/*, { key: 'ComPass' })*/);
run(StatifiedMain, drivers);
