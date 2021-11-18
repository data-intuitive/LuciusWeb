import xs from 'xstream';
import { ul, li } from '@cycle/dom';
import { pick, mix } from 'cycle-onionify';
import isolate from '@cycle/isolate'
import { SampleInfoHeader, SampleInfo } from './SampleInfo'

const sampleTableLens = {
    get: state => state.core.data,
    set: (state, _) => state
}

function SampleTable(sources) {

  const array$ = sources.onion.state$
  const props$ = sources.props

  const childrenSinks$ = array$.map(array => {
      return array.map((_, index) => isolate(SampleInfo, index)(sources))
  });

  const listStyle = {style : {'margin-top' : '0px', 'margin-bottom':'0px'}}

  const sampleInfoHeader$ = props$.map(props => SampleInfoHeader(props.table.bgcolor))

  const composedChildrenSinks$ = childrenSinks$.compose(pick('DOM')).compose(mix(xs.combine))
  const vdom$ = xs.combine(sampleInfoHeader$, composedChildrenSinks$)
                  .map(([header, itemVNodes]) => 
                    ul(
                      '.collection',
                      listStyle,
                      [].concat(header).concat(itemVNodes)
                    )
                  )
                  .startWith(
                    ul(
                      '.collection',
                      [ li('.collection-item .center-align .grey-text','no query yet...') ]
                    )
                  )

  return {
    DOM: vdom$,
  };

}

export { SampleTable, sampleTableLens }
