import { div } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'

import { initSettings } from '../configuration.js'

// Components
import { Statistics, statisticsLens } from '../components/Statistics'

function StatisticsWorkflow(sources) {

  const state$ = sources.onion.state$

  // Initialize if not yet done in parent (i.e. router) component (useful for testing)
  const defaultReducer$ = xs.of(prevState => {
    if (typeof prevState === 'undefined') {
      return { settings: initSettings }
    } else {
      return prevState
    }
  })

  const statsSinks = isolate(Statistics, { onion: statisticsLens })(sources);

  const pageStyle = {
    style:
    {
      fontSize: '14px',
      opacity: '0',
      transition: 'opacity 1s',
      delayed: { opacity: '1' },
      destroy: { opacity: '0' }
    }
  }

  const vdom$ = xs.combine(
    statsSinks.DOM,
  )
    .map(([
      stats
    ]) =>
      div('.row .grey .lighten-5  ', [
        div('.col .s10 .offset-s1', pageStyle,
          [
            div('.col .s12', [stats]),
          ])
      ])
    );

  return {
    DOM: vdom$,
    onion: xs.merge(
      defaultReducer$,
      statsSinks.onion,
    ),
    HTTP: xs.merge(
      statsSinks.HTTP,
    ),
  };
}

export default StatisticsWorkflow;
