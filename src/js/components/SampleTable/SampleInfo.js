import xs from 'xstream'
import { i, a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span, img, em } from '@cycle/dom'
import { log } from '../../utils/logger'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'

export function SampleInfo(sources) {

    const state$ = sources.onion.state$.debug(log);

    const click$ = sources.DOM.select('.zoom').events('click').mapTo(1)
    const zoomed$ = click$
                        .fold((x,y) => x + y, 0)
                        .map(count => (count % 2 == 0) ? false : true)

    function entry(key, value) {
        return [
            span('.col .s4', {style : { fontWeight: 'lighter'}}, key), 
            span('.col .s8', value)
            ]
    }

    const detail = sample => {
        let hStyle = {style : { margin: '0px', fontWeight: 'bold'}}
        let pStyle = {style : { margin: '0px'}}
        let url = 'http://localhost:9999/molecule/' + encodeURIComponent(sample.smiles).replace(/%20/g,'+')
        return div('.valign-wrapper', [
            div('.col .s4', [ 
                p('.grey-text', hStyle, 'Sample Info:'),
                p(pStyle, entry('Sample ID: ', sample.id)), 
                p(pStyle, entry('protocolname: ', sample.protocolname)),                
                p(pStyle, entry('Concentration: ', sample.concentration)),
                p(pStyle, entry('Year: ', sample.year)),
                p(pStyle, entry('Plate ID: ', sample.plateid)),
            ]),
            div('.col .s4', [ 
                p('.grey-text', hStyle, 'Compound Info:'),
                p(pStyle, entry('Name: ', sample.compoundname)), 
                p(pStyle, entry('JNJS: ', sample.jnjs)), 
                p(pStyle, entry('JNJB: ', sample.jnjb)), 
                p(pStyle, entry('Type: ', sample.Type)), 
                p('.s12', pStyle, entry('Targets: ', sample.targets.join(', '))), 
            ]),            
            div('.col .s4', [ 
                (sample.smiles != null)
                ? img('.col .s12 .valign', {props: {src: url}})
                : ''
            ]),            
        ])
    }

    const vdom$ = xs.combine(state$, zoomed$)
       .map(([sample, zoom]) => {
            let color = (sample.zhang >= 0) ? '.green .lighten-5' : '.orange .lighten-5'
            let url = 'http://localhost:9999/molecule/' + encodeURIComponent(sample.smiles).replace(/%20/g,'+')
            return li('.collection-item  .zoom' + color,   
                [
                    div('.row', {style: {fontss : 'small'}}, [
                        div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [sample.zhang.toFixed(3)]),
                        div('.col .s2', [sample.id]),
                        div('.col .s1', [sample.protocolname]),
                        div('.col .s2', [(sample.jnjs != "NA") ? sample.jnjs : '']),
                        div('.col .s3', [sample.compoundname]),
                        div('.col .s3 .center-align',  [
                            (sample.smiles != null && zoom == false)
                            ? img({props: {src: url, height:50, 'object-fit': 'contain'}})
                            : ''
                            ]),
                    ]),
                    (zoom) ? div('.row', [ detail(sample) ]) : div()
                ])
        })

    return { 
    	DOM: vdom$
  };

}