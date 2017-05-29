import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3 } from '@cycle/dom';
import { clone, equals, merge } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}
function SignatureGenerator(sources) {

    const state$ = sources.onion.state$.debug()

    const samplesQuery$ = sources.query//.startWith(["GJA127_J10"])

    const request$ = xs.combine(samplesQuery$, sources.props)
        .map(([query, props]) => {
            return {
                url: props.url + '&classPath=com.dataintuitive.luciusapi.generateSignature',
                method: 'POST',
                send: {
                    version: 'v2',
                    samples: query.join(" ")
                },
                'category': 'generateSignature'
            }
        })

    const response$ = sources.HTTP
        .select('generateSignature')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()
        .debug()

    const signature$ = response$.map(r => r.body.result.join(" "))

    const geneStyle = {
        style : {
            'border-style': 'solid',
            'border-width': '1px',
            'margin' : '2px 2px 2px 2px'
        }
    }

    const vdom$ = signature$
        .map(s => div('.card .orange .lighten-3', [
            div('.card-content .orange-text .text-darken-4', [
                span('.card-title', 'Signature:'),
                div('.row', {style: {fontSize: "16px", fontStyle: 'bold'}}, s.split(" ").map(gene => div('.col .orange .lighten-4', geneStyle, gene)))
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))

    return {
        DOM: vdom$,
        signature: signature$.debug(),
        HTTP: request$,
    }

}

export { SignatureGenerator }