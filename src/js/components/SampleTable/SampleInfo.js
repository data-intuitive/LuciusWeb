import xs from 'xstream'
import { i, a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span, img, em } from '@cycle/dom'
import { log } from '../../utils/logger'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'

export function SampleInfo(sources) {

    const state$ = sources.onion.state$//.debug(log);
    const props$ = sources.props.debug()

    const click$ = sources.DOM.select('.zoom').events('click').mapTo(1)
    const zoomed$ = click$
                        .fold((x,y) => x + y, 0)
                        .map(count => (count % 2 == 0) ? false : true)

    function entry(key, value) {
        return [
            span('.col .s4', {style : { fontWeight: 'lighter'}}, key), 
            span('.col .s8', (value.length != 0) ? value : '')
            ]
    }

    const detail = (sample, props) => {
        let hStyle = {style : { margin: '0px', fontWeight: 'bold'}}
        let pStyle = {style : { margin: '0px'}}
        let url = props.urlSourire + encodeURIComponent(sample.smiles).replace(/%20/g,'+')
        return div('', [
            div('.col .s12 .l4', {style : {margin : '15px 0px 0px 0px'}}, [ 
                p('.col .s12 .grey-text', hStyle, 'Sample Info:'),
                p(pStyle, entry('Sample ID: ', sample.id)), 
                p(pStyle, entry('protocolname: ', sample.protocolname)),                
                p(pStyle, entry('Concentration: ', sample.concentration)),
                p(pStyle, entry('Year: ', sample.year)),
                p(pStyle, entry('Plate ID: ', sample.plateid)),
            ]),
            div('.col .s12 .l4', {style : {margin : '15px 0px 0px 0px'}}, [ 
                p('.col .s12 .grey-text', hStyle, 'Compound Info:'),
                p(pStyle, entry('Name: ', sample.compoundname)), 
                p(pStyle, entry('JNJS: ', sample.jnjs)), 
                p(pStyle, entry('JNJB: ', sample.jnjb)), 
                p(pStyle, entry('Type: ', sample.Type)), 
                p('.s12', pStyle, entry('Targets: ', sample.targets.join(', '))), 
            ]),            
            div('.col .s6 .l4', {style : {margin : '20px 0px 0px 0px'}}, [ 
                (sample.smiles != null && sample.smiles != 'NA')
                ? img('.col .s12 .valign', {props: {src: url}})
                : ''
            ]),            
        ])
    }

    const vdom$ = xs.combine(state$, zoomed$, props$)
       .map(([sample, zoom, props]) => {
            let bgcolor = (sample.zhang >= 0) ? 'rgba(44,123,182, 0.08)' : 'rgba(215,25,28, 0.08)'
            let url = props.urlSourire + encodeURIComponent(sample.smiles).replace(/%20/g,'+')
            let zhangRounded = (sample.zhang != null) ? sample.zhang.toFixed(3) : 'NA'

            return li('.collection-item  .zoom', {style : {'background-color' : bgcolor}},    
                [
                    div('.row', {style: {fontWeight : 'small'}}, [
                        div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [zhangRounded]),
                        div('.col .s2', [sample.id]),
                        div('.col .s1', [sample.protocolname]),
                        div('.col .s2', [(sample.jnjs != "NA") ? sample.jnjs : '']),
                        div('.col .s3', [sample.compoundname]),
                        div('.col .s3 .center-align',  [
                            ((sample.smiles != null && sample.smiles != 'NA') && zoom == false)
                            ? img({props: {src: url, height:50, 'object-fit': 'contain'}})
                            : ''
                            ]),
                    ]),
                    (zoom) ? div('.row', [ detail(sample, props) ]) : div()
                ])
        })

    return { 
    	DOM: vdom$
  };

}