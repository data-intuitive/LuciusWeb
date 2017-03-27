import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i,p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, select, option } from '@cycle/dom';
import { clone, equals, merge, mergeAll } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'

function Filter(sources) {

	console.log('Starting component: Filter...');

	const domSource$ = sources.DOM;

    const filterInput$ = xs.of({
        concentration : '',
        protocol : '',
        type : ''
    })

    const vdom$ = filterInput$.map( filter =>
        div([
                div('.input-field .concentration .col .s12 .l4', [
                    select('.browser-default',[
                        option('.disabled .selected', {props : {value : filter.concentration}}, 'Concentration'),
                        option({props : {value : '1'}}, 1),
                        option({props : {value : '10'}}, 10)
                    ]),
                ]),
                div('.input-field .protocol .col .s12 .l4', [
                    select('.browser-default',[
                        option('.disabled .selected', {props : {value : filter.protocol}}, 'Protocol'),
                        option({props : {value : 'MCF7'}}, 'MCF7'),
                        option({props : {value : 'PBMC'}}, 'PBMC')
                    ]),
                ]),
                div('.input-field .type .col .s12 .l4', [
                    select('.browser-default',[
                        option('.disabled .selected', {props : {value : filter.type}}, 'Type'),
                        option({props : {value : 'test'}}, 'test'),
                        option({props : {value : 'poscon'}}, 'poscon')
                    ]),
                ]),
        ])
    );

    const concentrationChanged$ = sources.DOM
                .select('.concentration')
                .events('input')
                .map(ev => ev.target.value)
                .map(value => ({concentration : value}))
                .debug(console.log)

    const typeChanged$ = sources.DOM
                .select('.type')
                .events('input')
                .map(ev => ev.target.value)
                .map(value => ({type : value}))
                .debug(console.log)

    const protocolChanged$ = sources.DOM
                .select('.protocol')
                .events('input')
                .map(ev => ev.target.value)
                .map(value => ({protocol : value}))
                .debug(console.log)

    const changes$ = xs.merge(
        concentrationChanged$,
        typeChanged$,
        protocolChanged$
    )

    // const filter$ = xs.combine(filterInput$, concentrationChanged$, typeChanged$, protocolChanged$)
    //     .map(([prevFilter, concentration, type, protocol]) => {
    //         let merged = mergeAll(concentration, type, protocol)
    //         console.log(merged)
    //         return merge(prevFilter, merged)
    //     })

    const filter$ = xs.combine(filterInput$, changes$)
        .map(([prevFilter, change]) => {
            return merge(prevFilter, change)
        })


  return { 
    	DOM: vdom$,
        filter: filter$
  };

}

export { Filter }