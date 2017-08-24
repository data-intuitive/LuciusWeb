import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path } from '@cycle/dom';
import { merge, prop, equals } from 'ramda';

import { Check } from '../components/Check'
import { IsolatedSettings } from './settings'

import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from '../configuration'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'

function Home(sources) {

    const checkProps$ = sources.onion.state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .startWith({ settings: initSettings })
        .map(state => merge(state.settings.form, state.settings.api))
    const CheckSink = Check(merge(sources, { props: checkProps$ }))

    const vdom$ = xs.combine(CheckSink.DOM, xs.of(''))
        .map(([check, r]) => div('.row', [
            h2('.col .s6 offset-s3', ['Welcome to ComPass', check]),
            p('.col .s6 .offset-s3 .flow-text', [
                'This application is the interface with L1000 data. Currently, ',
                'there is support for working with disease profiles expressed using gene lists or signatures and compound similarity.'
            ]),
            div('.col .s6 .offset-s3', [
                div('.col .s12 .orange .darken-4 .pink-text', { style: { padding: '10px 10px 10px 10px' } },
                    [
                        i('.orange-text .text-lighten-1 .material-icons', 'play_arrow'),
                        a('.orange-text .text-lighten-3', { props: { href: '/compound' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Compound Workflow')
                    ]),
                div('.row', []),
                div('.col .s12 .red .darken-4 .pink-text', { style: { padding: '10px 10px 10px 10px' } },
                    [
                        i('.red-text .text-lighten-1 .material-icons', 'play_arrow'),
                        a('.red-text .text-lighten-4', { props: { href: '/target' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Target Workflow')
                    ]),
                div('.row', []),
                div('.col .s12 .pink .darken-4', { style: { padding: '10px 10px 10px 10px' } },
                    [
                        i('.pink-text .text-lighten-1 .material-icons', 'play_arrow'),
                        a('.pink-text .text-lighten-3', { props: { href: '/disease' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Disease Workflow')
                    ]),
            ]),
            p('.col .s6 .offset-s3 .flow-text', [
                'You can click on one of the workflows above to start it.'
            ]),
       ]));

    return {
        DOM: vdom$,
        HTTP: CheckSink.HTTP,
        onion: CheckSink.onion,
        alert: CheckSink.alert
    };
}

export default Home