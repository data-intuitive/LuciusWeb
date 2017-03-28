import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, ul, li } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../../utils/logger'
import { ENTER_KEYCODE } from '../../utils/keycodes.js'
import { keys, filter, head } from 'ramda'
import { pick, mix } from 'cycle-onionify';
import isolate from '@cycle/isolate'
import { SampleInfo } from './SampleInfo'

export function SampleTable(sources) {

	console.log('Starting component: SampleTable...');

    const state$ = sources.onion.state$
	const domSource$ = sources.DOM;

	// This component is active only when the signature is validated
	// const active$ = state$.map(state => state.validated).startWith(false).debug(log)

    // This will become an object representing the JSON table
    const array$ = sources.onion.state$//.debug(log); 

    const childrenSinks$ = array$.map(array => {
        return array.map((item, index) => isolate(SampleInfo, index)(sources))
    });

    const vdom$ = childrenSinks$
                    .compose(pick('DOM'))
                    .compose(mix(xs.combine))
                    .map(itemVNodes => {
                        return ul('.collection', {style : {'margin-top' : '0px', 'margin-bottom':'0px'}}, [
                                        // li('.collection-item .grey .darken-1 .white-text', 
                                        //     [
                                        //         div('.row', {style: {fontSize : 'normal', fontWeight : 500}}, [
                                        //             div('.col .s1', ['Zhang']),
                                        //             div('.col .s2', ['Sample ID']),
                                        //             div('.col .s1', ['Protocal']),
                                        //             div('.col .s2', ['JNJS']),
                                        //             div('.col .s3', ['Compound Name']),
                                        //             div('.col .s3 .center-align', ['Structure']),
                                        //         ])
                                        // ])
                                ].concat(itemVNodes))
                    })
                    .startWith(ul('.collection', [li('.collection-item .center-align .grey-text','no query yet...')]))


    return { 
            DOM: vdom$
    };

}