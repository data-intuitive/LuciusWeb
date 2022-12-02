import xs from 'xstream'
import { i, a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span, img, em } from '@cycle/dom'
import { mergeRight } from 'ramda'
import { safeModelToUi } from '../../modelTranslations'

export function CompoundInfo(sources) {

    const state$ = sources.state.stream
    const props$ = sources.props

    const click$ = sources.DOM.select('.zoom').events('click').mapTo(1)
    const zoomed$ = click$
        .fold((x, y) => x + y, 0)
        .map(count => (count % 2 == 0) ? false : true)

    function entry(key, value) {
        return [
            span('.col .s4 .grey-text.text-darken-1', { style: { 'font-weight': 'lighter' } }, key),
            span('.col .s8', (value.length != 0) ? value : '')
        ]
    }

    const blur$ = props$
        .filter(props => props.common.blur != undefined)
        .filter(props => props.common.blur)
        .map(props => ({ filter: 'blur(' + props.common.amountBlur + 'px)' }))
        .startWith({ filter: 'blur(0px)' })

    const detail = (sample, props, blur) => {
        let hStyle = { style: { margin: '0px', fontWeight: 'bold' } }
        let pStyle = { style: { margin: '0px' } }
        let hStylewBlur = { style: mergeRight(blur, { margin: '0px', fontWeight: 'bold' }) }
        let pStylewBlur = { style: mergeRight(blur, { margin: '0px' }) }
        let urlSourire = props.sourire.url
        let url = urlSourire + encodeURIComponent(sample.compound_smiles).replace(/%20/g, '+')
        return div('.col .s12', [
            div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
                p(pStylewBlur, entry('Name: ', sample.compound_name)),
                p(pStylewBlur, entry(safeModelToUi('id', props.common.modelTranslations) + ": ", sample.compound_id)),
                p(pStyle, entry('Type: ', sample.compound_type)),
            ]),
            div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
                p('.s12', pStylewBlur, entry('InchiKey: ', sample.compound_inchikey)),
                p('.s12', pStylewBlur, entry('Targets: ', sample.compound_targets.join(', ')))
            ]),
            div('.col .s4 .offset-s8 .l4', { style: mergeRight(blur, { margin: '20px 0px 0px 0px' }) }, [
                (sample.compound_smiles != null && sample.compound_smiles != 'NA' && sample.compound_smiles != 'No Smiles') ?
                img('.col .s12 .valign', { props: { src: url } }) :
                ''
            ]),
        ])
    }

    const vdom$ = xs.combine(state$, zoomed$, props$, blur$)
        .map(([sample, zoom, props, blur]) => {
            let urlSourire = props.sourire.url
            let bgcolor = props.table.bgcolor //'rgba(20,20,20,0.08 )' //(sample.zhang >= 0) ? 'rgba(44,123,182, 0.08)' : 'rgba(215,25,28, 0.08)'
            let url = urlSourire + encodeURIComponent(sample.compound_smiles).replace(/%20/g, '+')

            return li('.collection-item  .zoom', { style: { 'background-color': bgcolor } }, [
                div('.row', { style: { fontWeight: 'small' } }, [
                    div('.col .s1 .left-align', { style: { fontWeight: 'bold' } }, [sample.compound_targets.length]),
                    div('.col .s2', { style: blur }, [(sample.compound_id != "NA") ? sample.compound_id : '']),
                    div('.col .s3', { style: blur }, [sample.compound_name]),
                    div('.col .s3 .truncate', { style: blur }, [sample.compound_targets.join(", ")]),
                    div('.col .s3 .center-align', { style: blur }, [
                        ((sample.compound_smiles != null && sample.compound_smiles != 'NA' && sample.compound_smiles != 'No Smiles') && zoom == false) ?
                        img({ props: { src: url, height: 50, 'object-fit': 'contain' } }) :
                        ''
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
