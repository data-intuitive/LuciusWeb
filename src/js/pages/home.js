import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, img, map, area, use, span } from '@cycle/dom'
import { merge, prop, equals } from 'ramda';

import { Check } from '../components/Check'
import dropRepeats from 'xstream/extra/dropRepeats'
import { logoSVG } from '../index'
import { compoundSVG, targetSVG, ligandSVG, diseaseSVG, correlationSVG, settingsSVG } from '../svg'

const appear = {
    style: {
        opacity: '0',
        transition: 'opacity 4s',
        delayed: { opacity: '1' },
        destroy: { opacity: '0' }
    }
}

function Home(sources) {

    const checkProps$ = sources.onion.state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .map(state => merge(state.settings.form, state.settings.api))
    const CheckSink = Check(merge(sources, { props: checkProps$ }))

    const makeLink = (path, label, options) => {
        return li([a(options, { props: { href: path } }, label)])
    }

    const vdom$ = xs.combine(CheckSink.DOM)
        .map(([check]) => div([
            div({ style: { 'z-index': -1, height: '100%', overflow: 'hidden', position: 'absolute', opacity: 0.08, 'text-align': 'center', width: '100%' } },
                Array(60).fill().map(_ => div({ style: { width: '25%', display: 'inline-block' } }, [logoSVG]))),
            div('.row .transparent', [
                h2('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1', { style: { 'vertical-align': 'top' } }, [
                    'Welcome to ComPass',
                    // div({ style: { display: 'inline-block', width: '200px', 'vertical-align': '-40%' } }, [logoSVG]),
                    ' ',
                    check
                ]),
                p('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1  .flow-text', [
                    'This application is the interface with L1000 data.'
                ]),
                div('.row', []),
                div('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1 .center-align', appear, [
                    ul('.left', [
                        makeLink('/compound', span({ style: { fontSize: "2rem" } }, ['Compound', ' ', compoundSVG]), '.orange-text .left'),
                        // makeLink('/target', span(['Target', ' ', targetSVG]), '.red-text'),
                        makeLink('/genetic', span({ style: { fontSize: "2rem" } }, ['Genetic', ' ', targetSVG]), '.red-text .left'),
                        //makeLink('/generic', span({ style: { fontSize: "2rem" } }, ['Ligand', ' ', ligandSVG]), '.purple-text .left'),
                        makeLink('/disease', span({ style: { fontSize: "2rem" } }, ['Disease', ' ', diseaseSVG]), '.pink-text .left'),
                        makeLink('/correlation', span({ style: { fontSize: "2rem" } }, ['Correlation', ' ', correlationSVG]), '.blue-text .left'),
                        makeLink('/settings', span({ style: { fontSize: "2rem" } }, ['Settings', ' ', settingsSVG]), '.grey-text .left'),
                        // makeLink('/admin', span(['Admin']), '.blue-text'),
                    ]),
                ]),
                div('.row', []),
                p('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1  .flow-text', [
                    'You can click on one of the workflows above to start it.',
                    ' Alternatively, you can initiate ghost mode in the settings.'
                ]),
            ])
        ]));

    return {
        DOM: vdom$,
        HTTP: CheckSink.HTTP,
        onion: CheckSink.onion,
        alert: CheckSink.alert,
        popup: CheckSink.popup
    };
}

export default Home
