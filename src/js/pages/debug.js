import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, code, pre } from '@cycle/dom';
import { merge, prop, equals } from 'ramda';
import BMI from '../examples/bmi';
import Hello from '../examples/hello-world';
import { HttpRequest } from "../examples/http-request"

import SignatureWorkflow from './signature'
import CompoundWorkflow from './compound'
import StatisticsWorkflow from './statistics'
import { Check } from '../components/Check'
import { IsolatedSettings } from './settings'

import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from './settings'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'

function Debug(sources) {

    const stringData$ = sources.onion.state$.map(state => {
        return "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state))
    })

    const stringDataLogger$ = stringData$.map(str => [str])

    const vdom$ = xs.combine(sources.onion.state$, stringData$) 
        .map(([state, mime]) => div('.row', [
                            div('.col .s10 .offset-s1',[
                                div('.card .grey .lighten-4 .z-shadow-4', [
                                    div('.card-content', [
                                        div('.row', {style: {fontSize: "12px"}}, [
                                            pre('.col .s10 .offset-s1', JSON.stringify(state, null, 2))
                                        ])
                                    ])
                                ]),
                                a('.col .s6 .offset-s3 .btn .center .grey', { props: { href: 'data:' + mime, download: 'compass-state.json' } }, 'download')
                            ])
       ]));

    return {
        DOM: vdom$,
        log: stringDataLogger$
    };
}

export default Debug