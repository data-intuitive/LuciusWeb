import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, ul, li } from '@cycle/dom';
import { clone, equals } from 'ramda';
import { log } from '../../utils/logger'
import { ENTER_KEYCODE } from '../../utils/keycodes.js'
import { keys, filter, head } from 'ramda'
import { pick, mix } from 'cycle-onionify';
import isolate from '@cycle/isolate'
import { SampleInfo } from './SampleInfo'
import dropRepeats from 'xstream/extra/dropRepeats'

const sampleTableLens = {
    get: state => (state.core.data),
    set: (state, childState) => state
}

function SampleTable(sources) {

    const array$ = sources.onion.state$

    const childrenSinks$ = array$.map(array => {
        return array.map((item, index) => isolate(SampleInfo, index)(sources))
    });

    const vdom$ = childrenSinks$
                    .compose(pick('DOM'))
                    .compose(mix(xs.combine))
                    .map(itemVNodes => {
                        return ul('.collection', {style : {'margin-top' : '0px', 'margin-bottom':'0px'}}, [
                                ].concat(itemVNodes))
                    })
                    .startWith(ul('.collection', [li('.collection-item .center-align .grey-text','no query yet...')]))

    return { 
            DOM: vdom$,
    };

}

export { SampleTable, sampleTableLens }