import xs from "xstream"
import {
  p,
  div,
  li,
  span,
  img,
} from "@cycle/dom"
import { merge } from "ramda"
import { safeModelToUi } from "../../modelTranslations"

import img_trt_cp          from "/images/treatmentTypes/TRT_CP.png"
import img_trt_lig         from "/images/treatmentTypes/TRT_LIG.png"
import img_trt_sh          from "/images/treatmentTypes/TRT_SH.png"
import img_trt_sh_cgs      from "/images/treatmentTypes/TRT_SH.CGS.png"
import img_trt_oe          from "/images/treatmentTypes/TRT_OE.png"
import img_trt_oe_mut      from "/images/treatmentTypes/TRT_OE.MUT.png"
import img_trt_xpr         from "/images/treatmentTypes/TRT_XPR.png"
import img_ctl_vehicle     from "/images/treatmentTypes/CTL_VEHICLE.png"
import img_ctl_vector      from "/images/treatmentTypes/CTL_VECTOR.png"
//import img_trt_sh_css      from "/images/treatmentTypes/TRT_SH.CSS.png" // MISSING!
import img_ctl_vehicle_cns from "/images/treatmentTypes/CTL_VEHICLE.CNS.png"
import img_ctl_vector_cns  from "/images/treatmentTypes/CTL_VECTOR.png"
import img_ctl_untrt_cns   from "/images/treatmentTypes/CTL_UNTRT.CNS.png"
import img_ctl_untrt       from "/images/treatmentTypes/CTL_UNTRT.png"

export function SampleInfoHeader(bgcolor, color) {
    return li(
    ".collection-item .hide-on-med-and-down .zoom",
    { style: { backgroundColor: bgcolor, borderBottom: "2px solid " + color} },
    [
      div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s1 .left-align", { style: { fontWeight: "bold" } }, ["Zhang Score"]),
        div(".col .s2", { style: { fontWeight: "bold" } }, ["Sample ID"]),
        div(".col .s1", { style: { fontWeight: "bold" } }, ["Cell"]),
        div(".col .s2", { style: { fontWeight: "bold" } }, ["Treatment ID"]),
        div(".col .s3", { style: { fontWeight: "bold" } }, ["Treatment Name"]),
        div(".col .s1", { style: { fontWeight: "bold" } }, ["Treatment Type"]),
        div(".col .s2 .center-align", { style: { fontWeight: "bold" } }, ["Visualization"]),
      ])
  ])
}

export function SampleInfo(sources) {
  const state$ = sources.onion.state$
  const props$ = sources.props

  const click$ = sources.DOM.select(".zoom").events("click").mapTo(1)
  const zoomed$ = click$
    .fold((x, y) => x + y, 0)
    .map((count) => (count % 2 == 0 ? false : true))

  function entry(key, value) {
    return [
      span(
        ".col .s4 .grey-text.text-darken-1",
        { style: { fontWeight: "lighter", whiteSpace: "nowrap"} },
        key
      ),
      span(
        ".col .s8",
        { style: { overflow: "hidden", "text-overflow": "ellipsis" } },
        value.length != 0 ? value : ""
      ),
    ]
  }

  function entrySmall(key, value) {
    return [
      span(".col .s4 .m2", { style: { fontWeight: "lighter" } }, key),
      span(".col .s8 .m4", value.length != 0 ? value : ""),
    ]
  }

  const blur$ = props$
    .filter((props) => props.common.blur != undefined)
    .filter((props) => props.common.blur)
    .map((props) => ({ filter: "blur(" + props.common.amountBlur + "px)" }))
    .startWith({ filter: "blur(0px)" })

  function sourireUrl(base, smiles) {
    let url = base + encodeURIComponent(smiles).replace(/%20/g, "+")
    return url
  }



  const row = (sample, props, blur, zoom) => {
    let zhangRounded =
      sample.zhang != null ? parseFloat(sample.zhang).toFixed(3) : "NA"

      const imgForTrt= (trt) => {
        let knownTrt = {
          "trt_cp":          img(".trt_img", { props: { alt: trt, src: img_trt_cp }}),
          "trt_lig":         img(".trt_img", { props: { alt: trt, src: img_trt_lig }}),
          "trt_sh":          img(".trt_img", { props: { alt: trt, src: img_trt_sh }}),
          "trt_sh.cgs":      img(".trt_img", { props: { alt: trt, src: img_trt_sh_cgs }}),
          "trt_oe":          img(".trt_img", { props: { alt: trt, src: img_trt_oe }}),
          "trt_oe.mut":      img(".trt_img", { props: { alt: trt, src: img_trt_oe_mut }}),
          "trt_xpr":         img(".trt_img", { props: { alt: trt, src: img_trt_xpr }}),
          "ctl_vehicle":     img(".trt_img", { props: { alt: trt, src: img_ctl_vehicle }}),
          "ctl_vector":      img(".trt_img", { props: { alt: trt, src: img_ctl_vector }}),
          //"trt_sh.css":      img(".trt_img", { props: { alt: trt, src: img_trt_sh_css }}), // MISSING!
          "ctl_vehicle.cns": img(".trt_img", { props: { alt: trt, src: img_ctl_vehicle_cns }}),
          "ctl_vector.cns":  img(".trt_img", { props: { alt: trt, src: img_ctl_vector_cns }}),
          "ctl_untrt.cns":   img(".trt_img", { props: { alt: trt, src: img_ctl_untrt_cns }}),
          "ctl_untrt":       img(".trt_img", { props: { alt: trt, src: img_ctl_untrt }}),
          "_default":        p([trt])
        }

        return knownTrt[trt] ?? knownTrt["_default"]
      }

      const imgForTrtPart = [ imgForTrt(sample.trt) ]

      const visualizeTextPart = [
        sample.trt_name != null && sample.trt_name != "N/A" && zoom == false
          ? span(
              {
                style: {
                  color: "black",
                  opacity: 0.4,
                  "font-size": "clamp(16px, 5vw, 26px)",
                  height: 50,
                  display: "block",
                  "font-family": "Nova Mono",
                  "object-fit": "contain",
                  fontWeight: "bold",
                },
              },
              [sample.trt_name]
            )
          : "",
      ]

      const visualizeSmilesPart = [
        sample.smiles != null &&
        sample.smiles != "N/A" &&
        sample.smiles != "No Smiles" &&
        zoom == false
          ? img({
              props: {
                src: sourireUrl(props.sourire.url, sample.smiles),
                height: 50,
                "object-fit": "contain",
              },
            })
          : "",
      ]

    return {
      trt_cp: div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
          zhangRounded,
        ]),
        // pull info to here on large displays
        div(".col .s2 .offset-s5 .l1 .push-l8", { style: blur }, imgForTrtPart),
        div(".col .s3 .l2 .push-l8 .center-align", { style: blur }, visualizeSmilesPart),
        // info below being pulled, otherwise wrapped on new lines
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
        div(".col .s8 .l2 .pull-l3 .truncate", [sample.id]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", ["Cell"]),
        div(".col .s8 .l1 .pull-l3", [sample.cell]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
        div(".col .s8 .l2 .pull-l3", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
        div(".col .s8 .l3 .pull-l3", { style: blur }, [sample.trt_name]),
      ]),
      trt_sh: div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
          zhangRounded,
        ]),
        // pull info to here on large displays
        div(".col .s2 .offset-s5 .l1 .push-l8", { style: blur }, imgForTrtPart),
        div(".col .s3 .l2 .push-l8 .center-align", { style: blur }, visualizeTextPart),
        // info below being pulled, otherwise wrapped on new lines
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
        div(".col .s8 .l2 .pull-l3 .truncate", [sample.id]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", ["Cell"]),
        div(".col .s8 .l1 .pull-l3", [sample.cell]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
        div(".col .s8 .l2 .pull-l3", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
        div(".col .s8 .l3 .pull-l3", { style: blur }, [sample.trt_name]),
      ]),
      trt_lig: div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
          zhangRounded,
        ]),
        // pull info to here on large displays
        div(".col .s2 .offset-s5 .l1 .push-l8", { style: blur }, imgForTrtPart),
        div(".col .s3 .l2 .push-l8 .center-align", { style: blur }, visualizeTextPart),
        // info below being pulled, otherwise wrapped on new lines
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
        div(".col .s8 .l2 .pull-l3 .truncate", [sample.id]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", ["Cell"]),
        div(".col .s8 .l1 .pull-l3", [sample.cell]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
        div(".col .s8 .l2 .pull-l3", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
        div(".col .s8 .l3 .pull-l3", { style: blur }, [sample.trt_name]),
      ]),
      ctl_vector: div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
          zhangRounded,
        ]),
        // pull info to here on large displays
        div(".col .s2 .offset-s5 .l1 .push-l8", { style: blur }, imgForTrtPart),
        div(".col .s3 .l2 .push-l8 .center-align", { style: blur }, visualizeTextPart),
        // info below being pulled, otherwise wrapped on new lines
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
        div(".col .s8 .l2 .pull-l3 .truncate", [sample.id]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", ["Cell"]),
        div(".col .s8 .l1 .pull-l3", [sample.cell]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
        div(".col .s8 .l2 .pull-l3", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
        div(".col .s4 .m3 .offset-m1 .hide-on-large-only", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
        div(".col .s8 .l3 .pull-l3", { style: blur }, [sample.trt_name]),
      ]),
      _default: div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s1 .left-align", { style: { fontWeight: "bold" } }, [
          zhangRounded,
        ]),
        div(
          ".col .s2",
          { style: { overflow: "hidden", "text-overflow": "ellipsis" } },
          [sample.id]
        ),
        div(".col .s9", ["Treatment type not yet implemented"]),
      ]),
    }
  }

  const rowDetail = (sample, props, blur) => {
    let hStyle = { style: { margin: "0px", fontWeight: "bold" } }
    let pStyle = { style: { margin: "0px" } }
    let pStylewBlur = { style: merge(blur, { margin: "0px" }) }
    const _filters = sample.filters != undefined ? sample.filters : []

    const samplePart =
      [
        p(".col .s12 .grey-text", hStyle, "Sample Info:"),
        p(pStyle, entry("Sample ID: ", sample.id)),
        p(pStyle, entry("Cell: ", sample.cell)),
        p(pStyle, entry("Dose: ", sample.dose)),
        p(pStyle, entry("Time: ", sample.time)),
        p(pStyle, entry("Year: ", sample.year)),
        p(pStyle, entry("Plate: ", sample.plate)),
      ]

    const treatmentPart =
      [
        p(".col .s12 .grey-text", hStyle, "Treatment Info:"),
        p(pStylewBlur, entry("Name: ", sample.trt_name)),
        p(
          pStylewBlur,
          entry(
            safeModelToUi("id", props.common.modelTranslations) + ": ",
            sample.trt_id
          )
        ),
        p(pStyle, entry("Type: ", sample.trt)),
        p(".s12", entry("Targets: ", sample.targets.join(", "))),
      ]

    const visualizeTextPart =
      [
        sample.trt_name != null && sample.trt_name != "N/A"
          ? div(
              ".col .s12",
              {
                style: {
                  color: "black",
                  opacity: 0.4,
                  "font-size": "clamp(16px, 5vw, 26px)",
                  "font-family": "Nova Mono",
                  "object-fit": "contain",
                  fontWeight: "bold",
                },
              },
              [sample.trt_name]
            )
          : div(),
      ]

    const visualizeSmilesPart =
      [
        sample.smiles != null &&
        sample.smiles != "N/A" &&
        sample.smiles != "No Smiles"
          ? img(".col .s12 .valign", {
              props: { src: sourireUrl(props.sourire.url, sample.smiles) },
            })
          : "",
      ]

    return {
      trt_cp: div(".col .s12", [
        div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, samplePart),
        div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, treatmentPart),
        div(".col .s12 .offset-s8 .offset-m8 .l4",
          {style: merge(blur, { margin: "20px 0px 0px 0px" }) },
          visualizeSmilesPart
        ),
        div(
          ".col .s12 .l12",
          { style: { margin: "15px 0px 0px 0px" } },
          [p(".col .s12.grey-text", hStyle, "Filter Info:")].concat(
            _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
          )
        ),
      ]),
      trt_sh: div([
        div(".row", [
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, samplePart),
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, treatmentPart),
          div(".col .s12 .m12 .l2 .push-l2 .hide-on-med-and-down .center-align",
          { style: merge(blur, { height: "100%", "margin-top": "30px"}) },
          visualizeTextPart
        ),
        ]),
        div(
          ".row",
          { style: { margin: "15px 0px 0px 0px" } },
          [p(".col .s12.grey-text", hStyle, "Filter Info:")].concat(
            _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
          )
        ),
      ]),
      trt_lig: div([
        div(".row", [
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, samplePart),
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, treatmentPart),
          div(".col .s12 .m12 .l2 .push-l2 .hide-on-med-and-down .center-align",
          { style: merge(blur, { height: "100%", "margin-top": "30px"}) },
          visualizeTextPart
        ),
        ]),
        div(
          ".row",
          { style: { margin: "15px 0px 0px 0px" } },
          [p(".col .s12.grey-text", hStyle, "Filter Info:")].concat(
            _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
          )
        ),
      ]),
      ctl_vector: div([
        div(".row", [
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, samplePart),
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, treatmentPart),
          div(".col .s12 .m12 .l2 .push-l2 .hide-on-med-and-down .center-align",
            { style: merge(blur, { height: "100%", "margin-top": "30px"}) },
            visualizeTextPart
          ),
        ]),
        div(
          ".row",
          { style: { margin: "15px 0px 0px 0px" } },
          [p(".col .s12.grey-text", hStyle, "Filter Info:")].concat(
            _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
          )
        ),
      ]),
      _default: div(".row", { style: { fontWeight: "small" } }, [
        div(".col .s12", [
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, samplePart),
          div(".col .s12 .m6 .l4", { style: { margin: "15px 0px 0px 0px" } }, treatmentPart),
          div(".col .s12 .offset-s8 .offset-m8 .l4",
            { style: merge(blur, { margin: "20px 0px 0px 0px" }) },
            visualizeSmilesPart
          ),
          div(
            ".col .s12 .l12",
            { style: { margin: "15px 0px 0px 0px" } },
            [p(".col .s12.grey-text", hStyle, "Filter Info:")].concat(
              _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
            )
          ),
        ]),
      ]),
    }
  }

  const vdom$ = xs
    .combine(state$, zoomed$, props$, blur$)
    .map(([sample, zoom, props, blur]) => {
      let bgcolor =
        sample.zhang >= 0 ? "rgba(44,123,182, 0.08)" : "rgba(215,25,28, 0.08)"
      const updtProps = { ...props, bgColor: bgcolor }

      const thisRow = row(sample, updtProps, blur, zoom)
      const thisRowDetail = rowDetail(sample, updtProps, blur)

      return li(
        ".collection-item .zoom",
        { style: { "background-color": bgcolor } },
        [
          thisRow[sample.trt] ? thisRow[sample.trt] : thisRow["_default"],
          zoom
            ? div(".row", [
                thisRowDetail[sample.trt]
                  ? thisRowDetail[sample.trt]
                  : thisRowDetail["_default"],
              ])
            : div(),
        ]
      )
    })
    .startWith(li(".collection-itm .zoom", [p("Just one item!!!")]))

  return {
    DOM: vdom$,
  }
}
