import xs from 'xstream';
import { ul, li } from '@cycle/dom';
import { pick, mix } from 'cycle-onionify';
import isolate from '@cycle/isolate'
import { SampleInfo } from './SampleInfo'

const sampleTableLens = {
    get: state => state.core.data,
    set: (state, _) => state
}

function SampleTable(sources) {

    const array$ = sources.onion.state$

    const childrenSinks$ = array$.map(array => {
        return array.map((_, index) => isolate(SampleInfo, index)(sources))
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
