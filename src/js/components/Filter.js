import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, h5, button, textarea, a, select, option, span } from '@cycle/dom';
import { clone, equals, merge, mergeAll } from 'ramda';
import xs from 'xstream';
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'

function Filter(sources) {

    console.log('Starting component: Filter...');

    const domSource$ = sources.DOM;

    // Make sure the input is generated only when some state is active.
    const filterInput$ = sources.onion.state$.mapTo(x => ({
        concentration: '',
        protocol: '',
        type: ''
    }))

    const vdom$ = filterInput$.map(filter =>
        div([
           div('.input-field .concentration .col .s12 .l4', [
                 span('.blue-grey-text',  ['Concentration']),
                 select('.browser-default', [
                    option('.selected', { props: { value: '' } }, ''),
                    option({ props: { value: '0.1' } }, 0.1),
                    option({ props: { value: '1' } }, 1),
                    option({ props: { value: '10' } }, 10),
                    option({ props: { value: '30' } }, 30)
                ]),
            ]),
            div('.input-field .protocol .col .s12 .l4', [
                span('.blue-grey-text',  ['Protocol']),
                select('.browser-default', [
                    option('.selected', { props: { value: '' } }, ''),
                    option({ props: { value: 'MCF7' } }, 'MCF7'),
                    option({ props: { value: 'PBMC' } }, 'PBMC')
                ]),
            ]),
            div('.input-field .type .col .s12 .l4', [
                span('.blue-grey-text',  ['Type']),
                select('.browser-default', [
                    option('.selected', { props: { value: '' } }, ''),
                    option({ props: { value: 'test' } }, 'test'),
                    option({ props: { value: 'poscon' } }, 'poscon')
                ]),
            ]),
        ])
    )
        .startWith(div([]))

    const concentrationChanged$ = sources.DOM
        .select('.concentration')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ concentration: value }))
        .startWith('')

    const typeChanged$ = sources.DOM
        .select('.type')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ type: value }))
        .startWith('')

    const protocolChanged$ = sources.DOM
        .select('.protocol')
        .events('input')
        .map(ev => ev.target.value)
        .map(value => ({ protocol: value }))
        .startWith('')

    const changes$ = xs.combine(
        concentrationChanged$,
        typeChanged$,
        protocolChanged$
    ).map((filters) => mergeAll(filters))

    // const filter$ = xs.combine(filterInput$, concentrationChanged$, typeChanged$, protocolChanged$)
    //     .map(([prevFilter, concentration, type, protocol]) => {
    //         let merged = mergeAll(concentration, type, protocol)
    //         console.log(merged)
    //         return merge(prevFilter, merged)
    //     })

    const filter$ = changes$
    // .map(([prevFilter, change]) => {
    //     return merge(prevFilter, change)
    // })


    return {
        DOM: vdom$,
        filter: filter$
    };

}

export { Filter }