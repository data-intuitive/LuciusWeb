import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, input } from '@cycle/dom';
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

function TargetWorkflow(sources) {

    //   const vdom$ = xs.of(
    //     div([
    //       div('.row .red .darken-4', [
    //         h2('.col .s10 .s-offset-1 .red-text .text-lighten-4', ['This workflow is under construction']),
    //       ]),
    //       div('.row .red .lighten-5', { style: { height: '500px' } })
    //     ])
    //   )

    const vdom$ = xs.of(
        div(
            [
                div('.row  .red .darken-4 .red-text .text-lighten-4', { style: { padding: '20px 10px 10px 10px' } }, [
                    div('.Default .waves-effect .col .s1 .center-align', [
                        i('.large  .center-align .material-icons .red-text', { style: { fontSize: '45px', fontColor: 'gray' } }, 'search'),
                    ]),
                    div('.col .s10 .input-field', { style: { margin: '0px 0px 0px 0px' } }, [
                        input('.col .s12 .autocomplete-input', { style: { fontSize: '20px' }, props: { type: 'text', value: 'This workflow is under construction...' }, value: 'This workflow is under construction' }),
                    ]),
                    div('.CompoundCheck .col .s1 .center-align', [
                        i('.large .material-icons .red-text', { style: { fontSize: '45px', fontColor: 'grey' } }, 'play_arrow')]),
                ]),
                div( { style: { height: '500px' } })
            ])
    )

    // const router$ = sources.DOM.select('a').events('click')
    //     .debug(ev => ev.preventDefault())
    //     .map(ev => ev.target.pathname)
    //     .debug()

    return {
        DOM: vdom$.remember(),
        // router: router$
    };

}

export default TargetWorkflow