import xs from 'xstream'
import { i, a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span, img } from '@cycle/dom'
import { log } from '../../utils/logger'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'

export function SampleInfo(sources) {

    const state$ = sources.onion.state$.debug(log);
    const updatedState$ = state$
	const domSource$ = sources.DOM;

    const vdom$ = state$
       .map(sample => {
            let color = (sample.zhang >= 0) ? '.green .lighten-5' : '.orange .lighten-5'
            let url = 'http://localhost:9999/molecule/' + encodeURIComponent(sample.smiles).replace(/%20/g,'+')
            return li('.collection-item ' + color,   
                [
                    div('.row', {style: {fontSize : 'small'}}, [
                        div('.col .s1 .left-align', [sample.zhang.toFixed(3)]),
                        div('.col .s2', [sample.id]),
                        div('.col .s1', [sample.protocolname]),
                        div('.col .s2', [(sample.jnjs != "NA") ? sample.jnjs : '']),
                        div('.col .s3', [sample.compoundname]),
                        div([
                            (sample.smiles != null) 
                            ? img('.col .s3', {props: {src: url}})
                            : ''
                            ]),
                    ])
                ])
        })

    return { 
    	DOM: vdom$
  };

}