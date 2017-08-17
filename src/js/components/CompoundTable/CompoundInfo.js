import xs from 'xstream'
import { i, a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span, img, em } from '@cycle/dom'
import { log } from '../../utils/logger'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
import { stateDebug } from '../../utils/utils'

export function CompoundInfo(sources) {

    const state$ = sources.onion.state$
    const props$ = sources.props

    const click$ = sources.DOM.select('.zoom').events('click').mapTo(1)
    const zoomed$ = click$
        .fold((x, y) => x + y, 0)
        .map(count => (count % 2 == 0) ? false : true)

    function entry(key, value) {
        return [
            span('.col .s4', { style: { fontWeight: 'lighter' } }, key),
            span('.col .s8', (value.length != 0) ? value : '')
        ]
    }

    const blur$ = props$
        .filter(props => props.common.blur != undefined)
        .map(props => ({ filter: 'blur(' + props.common.blur + 'px)' }))
        .startWith({ filter: 'blur(0px)' })

    const detail = (sample, props, blur) => {
        let hStyle = { style: { margin: '0px', fontWeight: 'bold' } }
        let pStyle = { style: { margin: '0px' } }
        let hStylewBlur = { style: merge(blur, { margin: '0px', fontWeight: 'bold' }) }
        let pStylewBlur = { style: merge(blur, { margin: '0px' }) }
        let urlSourire = props.sourire.url
        let url = urlSourire + encodeURIComponent(sample.smiles).replace(/%20/g, '+')
        return div('.col .s12', [
            div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
                p(pStylewBlur, entry('Name: ', sample.compoundname)),
                p(pStyle, entry('JNJS: ', sample.jnjs)),
                p(pStyle, entry('JNJB: ', sample.jnjb)),
                p(pStyle, entry('Type: ', sample.Type)),
            ]),
            div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
                p('.s12', pStylewBlur, entry('InchiKey: ', sample.inchikey)),
                p('.s12', pStyle, entry('Targets: ', sample.targets.join(', ')))
            ]),
            div('.col .s4 .offset-s8 .l4', { style: merge(blur, { margin: '20px 0px 0px 0px' }) }, [
                (sample.smiles != null && sample.smiles != 'NA' && sample.smiles != 'No Smiles')
                    ? img('.col .s12 .valign', { props: { src: url } })
                    : ''
            ]),
        ])
    }

    const vdom$ = xs.combine(state$, zoomed$, props$, blur$)
        .map(([sample, zoom, props, blur]) => {
            let urlSourire = props.sourire.url
            let bgcolor = props.table.bgcolor //'rgba(20,20,20,0.08 )' //(sample.zhang >= 0) ? 'rgba(44,123,182, 0.08)' : 'rgba(215,25,28, 0.08)'
            let url = urlSourire + encodeURIComponent(sample.smiles).replace(/%20/g, '+')
            let zhangRounded = (sample.zhang != null) ? sample.zhang.toFixed(3) : 'NA'

            return li('.collection-item  .zoom', { style: { 'background-color': bgcolor } },
                [
                    div('.row', { style: { fontWeight: 'small' } }, [
                        div('.col .s1 .left-align', { style: { fontWeight: 'bold' } }, [sample.targets.length]),
                        div('.col .s2', { style: blur }, [(sample.jnjs != "NA") ? sample.jnjs : '']),
                        div('.col .s3', { style: blur }, [sample.compoundname]),
                        div('.col .s3 .truncate', [sample.targets.join(", ")]),
                        div('.col .s3 .center-align', { style: blur }, [
                            ((sample.smiles != null && sample.smiles != 'NA' && sample.smiles != 'No Smiles') && zoom == false)
                                ? img({ props: { src: url, height: 50, 'object-fit': 'contain' } })
                                : ''
                        ]),
                    ]),
                    (zoom) ? div('.row', [detail(sample, props, blur)]) : div()
                ])
        })
        .startWith(li('.collection-itm .zoom', [p('Just one item!!!')]))

    return {
        DOM: vdom$
    };

}