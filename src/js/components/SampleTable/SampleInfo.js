import xs from 'xstream'
import { i, a, h, p, div, br, label, input, pre, code, table, tr, td, b, h2, button, svg, h1, th, thead, tbody, li, span, img, em } from '@cycle/dom'
import { merge } from 'ramda'
import { safeModelToUi } from '../../modelTranslations'

export function SampleInfo(sources) {

  const state$ = sources.onion.state$
  const props$ = sources.props

  const click$ = sources.DOM.select('.zoom').events('click').mapTo(1)
  const zoomed$ = click$
    .fold((x, y) => x + y, 0)
    .map(count => (count % 2 == 0) ? false : true)

  function entry(key, value) {
    return [
      span('.col .s4 .grey-text.text-darken-1', { style: { fontWeight: 'lighter' } }, key),
      span('.col .s8', { style : { overflow: 'hidden', 'text-overflow': 'ellipsis' }}, (value.length != 0) ? value : '')
    ]
  }

  function entrySmall(key, value) {
    return [
      span('.col .s6 .l2', { style: { fontWeight: 'lighter' } }, key),
      span('.col .s6 .l2', (value.length != 0) ? value : '')
    ]
  }

  const blur$ = props$
    .filter(props => props.common.blur != undefined)
    .filter(props => props.common.blur)
    .map(props => ({ filter: 'blur(' + props.common.amountBlur + 'px)' }))
    .startWith({ filter: 'blur(0px)' })

  function sourireUrl(base, smiles) {
    let url = base + encodeURIComponent(smiles).replace(/%20/g, '+')
    return url
  }

  const row = (sample, props, blur, zoom) => {
    let zhangRounded = (sample.zhang != null) ? parseFloat(sample.zhang).toFixed(3) : 'NA'
    return {
      trt_cp:
        div('.row', {style: {fontWeight: 'small'}}, [
          div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [zhangRounded]),
          div('.col .s2', {style: {overflow: 'hidden', 'text-overflow': 'ellipsis'}}, [sample.id]),
          div('.col .s1', [sample.cell]),
          div('.col .s2', {style: blur}, [(sample.trt_id != "NA") ? sample.trt_id : '']),
          div('.col .s3', {style: blur}, [sample.trt_name]),
          div('.col .s1', {style: blur}, [sample.trt]),
          div('.col .s2 .center-align', {style: blur}, [
            ((sample.smiles != null && sample.smiles != 'N/A' && sample.smiles != 'No Smiles') && zoom == false) ?
              img({props: {src: sourireUrl(props.sourire.url, sample.smiles), height: 50, 'object-fit': 'contain'}}) :
              ''
          ])
        ]),
      trt_sh:
        div('.row', {style: {fontWeight: 'small'}}, [
          div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [zhangRounded]),
          div('.col .s2', {style: {overflow: 'hidden', 'text-overflow': 'ellipsis'}}, [sample.id]),
          div('.col .s1', [sample.cell]),
          div('.col .s2', {style: blur}, [(sample.trt_id != "NA") ? sample.trt_id : '']),
          div('.col .s3', {style: blur}, [sample.trt_name]),
          div('.col .s1', {style: blur}, [sample.trt]),
          div('.col .s2 .center-align', {style: blur}, [
            ((sample.trt_name != null && sample.trt_name != 'N/A') && zoom == false) ?
              span({ style: { color: 'black', opacity: 0.4, "font-size": "clamp(16px, 5vw, 26px)", height: 50, display: "block", "font-family": 'Nova Mono', 'object-fit': 'contain', fontWeight: "bold" } }, [sample.trt_name]):
              ''
          ])
        ]),
      trt_lig:
        div('.row', {style: {fontWeight: 'small'}}, [
          div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [zhangRounded]),
          div('.col .s2', {style: {overflow: 'hidden', 'text-overflow': 'ellipsis'}}, [sample.id]),
          div('.col .s1', [sample.cell]),
          div('.col .s2', {style: blur}, [(sample.trt_id != "NA") ? sample.trt_id : '']),
          div('.col .s3', {style: blur}, [sample.trt_name]),
          div('.col .s1', {style: blur}, [sample.trt]),
          div('.col .s2 .center-align', {style: blur}, [
            ((sample.trt_name != null && sample.trt_name != 'N/A') && zoom == false) ?
              span({ style: { color: 'black', opacity: 0.4, "font-size": "clamp(16px, 5vw, 26px)", height: 50, display: "block", "font-family": 'Nova Mono', 'object-fit': 'contain', fontWeight: "bold" } }, [sample.trt_name]):
              ''
          ])
        ]),
      ctl_vector:
        div('.row', {style: {fontWeight: 'small'}}, [
          div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [zhangRounded]),
          div('.col .s2', {style: {overflow: 'hidden', 'text-overflow': 'ellipsis'}}, [sample.id]),
          div('.col .s1', [sample.cell]),
          div('.col .s2', {style: blur}, [(sample.trt_id != "NA") ? sample.trt_id : '']),
          div('.col .s3', {style: blur}, [sample.trt_name]),
          div('.col .s1', {style: blur}, [sample.trt]),
          div('.col .s2 .center-align', {style: blur}, [
            ((sample.trt_name != null && sample.trt_name != 'N/A') && zoom == false) ?
              span({ style: { color: 'black', opacity: 0.4, "font-size": "clamp(16px, 5vw, 26px)", height: 50, display: "block", "font-family": 'Nova Mono', 'object-fit': 'contain', fontWeight: "bold" } }, [sample.trt_name]):
              ''
          ])
        ]),
      _default:
        div('.row', {style: {fontWeight: 'small'}}, [
          div('.col .s1 .left-align', {style: {fontWeight: 'bold'}}, [zhangRounded]),
          div('.col .s2', {style: {overflow: 'hidden', 'text-overflow': 'ellipsis'}}, [sample.id]),
          div('.col .s9', ["Treatment type not yet implemented"]),
        ])
    }
  }

  const rowDetail = (sample, props, blur) => {
    let hStyle = { style: { margin: '0px', fontWeight: 'bold' } }
    let pStyle = { style: { margin: '0px' } }
    let pStylewBlur = { style: merge(blur, { margin: '0px' }) }
    const _filters = (sample.filters != undefined) ? sample.filters : []
    return {
      trt_cp:
        div('.col .s12', [
          div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
            p('.col .s12 .grey-text', hStyle, 'Sample Info:'),
            p(pStyle, entry('Sample ID: ', sample.id)),
            p(pStyle, entry('Cell: ', sample.cell)),
            p(pStyle, entry('Dose: ', sample.dose)),
            p(pStyle, entry('Time: ', sample.time)),
            p(pStyle, entry('Year: ', sample.year)),
            p(pStyle, entry('Plate: ', sample.plate)),
          ]),
          div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
            p('.col .s12 .grey-text', hStyle, 'Treatment Info:'),
            p(pStylewBlur, entry('Name: ', sample.trt_name)),
            p(pStylewBlur, entry(safeModelToUi('id', props.common.modelTranslations) + ": ", sample.trt_id)),
            p(pStyle, entry('Type: ', sample.trt)),
            p('.s12', entry('Targets: ', sample.targets.join(', '))),
          ]),
          div('.col .s12 .offset-s8 .l4', { style: merge(blur, { margin: '20px 0px 0px 0px' }) }, [
            (sample.smiles != null && sample.smiles != 'N/A' && sample.smiles != 'No Smiles') ?
            img('.col .s12 .valign', { props: { src: sourireUrl(props.sourire.url, sample.smiles) } }) :
            ''
          ]),
          div('.col .s12 .l12', { style: { margin: '15px 0px 0px 0px' } },
            [p('.col .s12.grey-text', hStyle, 'Filter Info:')]
            .concat(_filters.map( x => p(pStyle, entrySmall(x.key, x.value)) ))
          )
        ]),
      trt_sh:
        div([
          div('.row', [
            div('.col .s4 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
              p('.col .s12 .grey-text', hStyle, 'Sample Info:'),
              p(pStyle, entry('Sample ID: ', sample.id)),
              p(pStyle, entry('Cell: ', sample.cell)),
              p(pStyle, entry('Dose: ', sample.dose)),
              p(pStyle, entry('Time: ', sample.time)),
              p(pStyle, entry('Year: ', sample.year)),
              p(pStyle, entry('Plate: ', sample.plate)),
            ]),
            div('.col .s4 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
              p('.col .s12 .grey-text', hStyle, 'Treatment Info:'),
              p(pStylewBlur, entry('Name: ', sample.trt_name)),
              p(pStylewBlur, entry(safeModelToUi('id', props.common.modelTranslations) + ": ", sample.trt_id)),
              p(pStyle, entry('Type: ', sample.trt)),
              p('.s12', entry('Targets: ', sample.targets.join(', '))),
            ]),
            div('.col .s4 .l4', { style: merge(blur, { height: '100%', margin: '30px 0px 0px 0px' }) }, [
              ((sample.trt_name != null && sample.trt_name != 'N/A'))
                ? div('.col .s12', {style: {color: 'black', opacity: 0.4, "font-size": "clamp(16px, 5vw, 50px)", "font-family": 'Nova Mono', 'object-fit': 'contain', fontWeight: "bold"}}, [sample.trt_name])
                : div()
            ])
          ]),
          div('.row', { style: { margin: '15px 0px 0px 0px' } },
            [p('.col .s12.grey-text', hStyle, 'Filter Info:')]
            .concat(_filters.map( x => p(pStyle, entrySmall(x.key, x.value)) ))
          )
        ]),
      trt_lig:
        div([
          div('.row', [
            div('.col .s4 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
              p('.col .s12 .grey-text', hStyle, 'Sample Info:'),
              p(pStyle, entry('Sample ID: ', sample.id)),
              p(pStyle, entry('Cell: ', sample.cell)),
              p(pStyle, entry('Dose: ', sample.dose)),
              p(pStyle, entry('Time: ', sample.time)),
              p(pStyle, entry('Year: ', sample.year)),
              p(pStyle, entry('Plate: ', sample.plate)),
            ]),
            div('.col .s4 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
              p('.col .s12 .grey-text', hStyle, 'Treatment Info:'),
              p(pStylewBlur, entry('Name: ', sample.trt_name)),
              p(pStylewBlur, entry(safeModelToUi('id', props.common.modelTranslations) + ": ", sample.trt_id)),
              p(pStyle, entry('Type: ', sample.trt)),
              p('.s12', entry('Targets: ', sample.targets.join(', '))),
            ]),
            div('.col .s4 .l4', { style: merge(blur, { height: '100%', margin: '30px 0px 0px 0px' }) }, [
              ((sample.trt_name != null && sample.trt_name != 'N/A'))
                ? div('.col .s12', {style: {color: 'black', opacity: 0.4, "font-size": "clamp(16px, 5vw, 50px)", "font-family": 'Nova Mono', 'object-fit': 'contain', fontWeight: "bold"}}, [sample.trt_name])
                : div()
            ])
          ]),
          div('.row', { style: { margin: '15px 0px 0px 0px' } },
            [p('.col .s12.grey-text', hStyle, 'Filter Info:')]
            .concat(_filters.map( x => p(pStyle, entrySmall(x.key, x.value)) ))
          )
        ]),
      ctl_vector:
        div([
          div('.row', [
            div('.col .s4 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
              p('.col .s12 .grey-text', hStyle, 'Sample Info:'),
              p(pStyle, entry('Sample ID: ', sample.id)),
              p(pStyle, entry('Cell: ', sample.cell)),
              p(pStyle, entry('Dose: ', sample.dose)),
              p(pStyle, entry('Time: ', sample.time)),
              p(pStyle, entry('Year: ', sample.year)),
              p(pStyle, entry('Plate: ', sample.plate)),
            ]),
            div('.col .s4 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
              p('.col .s12 .grey-text', hStyle, 'Treatment Info:'),
              p(pStylewBlur, entry('Name: ', sample.trt_name)),
              p(pStylewBlur, entry(safeModelToUi('id', props.common.modelTranslations) + ": ", sample.trt_id)),
              p(pStyle, entry('Type: ', sample.trt)),
              p('.s12', entry('Targets: ', sample.targets.join(', '))),
            ]),
            div('.col .s4 .l4', { style: merge(blur, { height: '100%', margin: '30px 0px 0px 0px' }) }, [
              ((sample.trt_name != null && sample.trt_name != 'N/A'))
                ? div('.col .s12', {style: {color: 'black', opacity: 0.4, "font-size": "clamp(16px, 5vw, 50px)", "font-family": 'Nova Mono', 'object-fit': 'contain', fontWeight: "bold"}}, [sample.trt_name])
                : div()
            ])
          ]),
          div('.row', { style: { margin: '15px 0px 0px 0px' } },
            [p('.col .s12.grey-text', hStyle, 'Filter Info:')]
            .concat(_filters.map( x => p(pStyle, entrySmall(x.key, x.value)) ))
          )
        ]),
      _default:
        div('.row', {style: {fontWeight: 'small'}}, [
        div('.col .s12', [
          div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
            p('.col .s12 .grey-text', hStyle, 'Sample Info:'),
            p(pStyle, entry('Sample ID: ', sample.id)),
            p(pStyle, entry('Cell: ', sample.cell)),
            p(pStyle, entry('Dose: ', sample.dose)),
            p(pStyle, entry('Time: ', sample.time)),
            p(pStyle, entry('Year: ', sample.year)),
            p(pStyle, entry('Plate: ', sample.plate)),
          ]),
          div('.col .s6 .l4', { style: { margin: '15px 0px 0px 0px' } }, [
            p('.col .s12 .grey-text', hStyle, 'Treatment Info:'),
            p(pStylewBlur, entry('Name: ', sample.trt_name)),
            p(pStylewBlur, entry(safeModelToUi('id', props.common.modelTranslations) + ": ", sample.trt_id)),
            p(pStyle, entry('Type: ', sample.trt)),
            p('.s12', entry('Targets: ', sample.targets.join(', '))),
          ]),
          div('.col .s12 .offset-s8 .l4', { style: merge(blur, { margin: '20px 0px 0px 0px' }) }, [
            (sample.smiles != null && sample.smiles != 'N/A' && sample.smiles != 'No Smiles') ?
            img('.col .s12 .valign', { props: { src: sourireUrl(props.sourire.url, sample.smiles) } }) :
            ''
          ]),
          div('.col .s12 .l12', { style: { margin: '15px 0px 0px 0px' } },
            [p('.col .s12.grey-text', hStyle, 'Filter Info:')]
            .concat(_filters.map( x => p(pStyle, entrySmall(x.key, x.value)) ))
          )
        ])
      ])

    }
  }

  const vdom$ = xs.combine(state$, zoomed$, props$, blur$)
    .map(([sample, zoom, props, blur]) => {
      let bgcolor = (sample.zhang >= 0) ? 'rgba(44,123,182, 0.08)' : 'rgba(215,25,28, 0.08)'
      const updtProps = {...props, bgColor: bgcolor}

      const thisRow = row(sample, updtProps, blur, zoom)
      const thisRowDetail = rowDetail(sample, updtProps, blur)

      return li('.collection-item .zoom', {style: {'background-color': bgcolor}}, [
        thisRow[sample.trt] ? thisRow[sample.trt] : thisRow["_default"],
        (zoom) ? div('.row', [thisRowDetail[sample.trt] ? thisRowDetail[sample.trt] : thisRowDetail["_default"]]) : div()
      ])
    })
    .startWith(li('.collection-itm .zoom', [p('Just one item!!!')]))

  return {
    DOM: vdom$
  };

}
