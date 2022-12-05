import xs from 'xstream';
import { ul, li } from '@cycle/dom';
import { pick, mix } from "../../utils/pickmix"
import isolate from '@cycle/isolate'
import { SampleInfoHeader, SampleInfo } from './SampleInfo'

/**
 * @module components/SampleTable/SampleTable
 */

/**
 * Minimalistic lens that passes state.core.data as the state
 * @const samplTableLens
 */
const sampleTableLens = {
    get: state => state.core?.data,
    set: (state, _) => state
}

/**
 * Straight forward displaying of input data to vdom with header
 * Requires all data to be present and ready to be displayed
 * @function SampleTable
 * @param {*} sources 
 *          - state.state$: default state atom containing the input data
 *          - DOM: user click events
 *          - props: settings for e.g. background and foreground colors
 * @returns {object} - DOM: vdom stream
 */
function SampleTable(sources) {

  const array$ = sources.state.stream
  const props$ = sources.props

  // isolate each line so that it separates clicks
  const childrenSinks$ = array$.map(array => {
      return array.map((_, index) => isolate(SampleInfo, index)(sources))
  })

  const listStyle = {style : {'margin-top' : '0px', 'margin-bottom':'0px'}}

  /**
   * Get header line, only variable input is background and foreground colors, so map from props$
   * @const sampleInfoHeaers$
   * @type {Stream}
   */
  const sampleInfoHeader$ = props$.map(props => SampleInfoHeader(props.table.bgcolor, props.table.color))

  /**
   * Get all 'DOM' streams from all lines and convert to single stream of array of VNode
   * @const SampleTable/composedChildrenSinks$
   * @type {Stream}
   */
  const composedChildrenDOMSinks$ = childrenSinks$.compose(pick('DOM')).compose(mix(xs.combine))
  const composedChildrenHttpSinks$ = childrenSinks$.compose(pick('HTTP')).compose(mix(xs.merge))

  const vdom$ = xs.combine(sampleInfoHeader$, composedChildrenDOMSinks$)
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
    HTTP: composedChildrenHttpSinks$,
  };

}

export { SampleTable, sampleTableLens }
