import xs from "xstream"
import {
  p,
  div,
  li,
  span,
  img,
  i,
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
import { maxLengthValueUnit } from "../../utils/utils"
import { InformationDetails } from "../InformationDetails"

/**
 * @module components/SampleTable/SampleInfo
 */

/**
 * Create a header matching the data order of sample rows displayed in case of large displays
 * header hides itself in case of small and medium screens
 * @function SampleInfoHeader
 * @param {string} bgcolor color of the table background
 * @param {string} color color of the table foreground
 * @returns {VNode} li element with header data
 */
export function SampleInfoHeader(bgcolor, color) {
    return li(
    ".collection-item .hide-on-med-and-down .zoom",
    { style: { backgroundColor: bgcolor, borderBottom: "2px solid " + color} },
    [
      div(".row", { style: { fontWeight: "small", marginBottom: "5px" } }, [
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

/**
 * Create a single table row displaying sample information
 * Depending on the width displays basic information in one line or multiple lines
 * When clicked, adds more information in a separate div
 * @function SampleInfo
 * @param {stream} sources.onion.state$ stream of sample data to be displayed
 * @param sources.DOM user click events
 * @param sources.props semi-static settings
 * @returns {object} - DOM: VNode stream containing sample information
 */
export function SampleInfo(sources) {
  const state$ = sources.onion.state$
  const props$ = sources.props

  // don't accept clicks if they came from the click2$ source
  const click$ = sources.DOM.select(".zoom").events("click").debug("click$").filter(ev => !ev.srcElement.classList.contains("informationDetailsZoom"))
  const click2$ = sources.DOM.select(".informationDetailsZoom").events("click")
  const zoomed$ = click$
    .fold((acc, _) => !acc, false)
  
  // always close second level if primary level is closed
  const zoomed2$ = xs.combine(zoomed$.startWith(false), click2$.startWith(0))
    .fold(([prev_zoomed, acc], [zoomed, _]) => [zoomed, prev_zoomed && zoomed && !acc], [false, false])
    .map(([_, x]) => x)

  const informationDetailsQuery = InformationDetails({...sources, trigger: zoomed2$})
  const informationDetailsHTTP$ = informationDetailsQuery.HTTP
  const informationDetails$ = informationDetailsQuery.informationDetails.map(i => i.body.result.data).startWith({})

  function entry(key, value) {
    // Feature not found => LuciusCore doesn't have the value in the model, so this will never be available. Unlikely string to be present in the normal data.
    // !value?.trim() => Also don't show empty fields
    if (value == "Feature not found" || !value?.trim())
      return []
    else
      return [
        span(
          ".col .s4 .entryKey",
          { style: { fontWeight: "lighter", whiteSpace: "nowrap"} },
          key
        ),
        span(
          ".col .s8 .entryValue",
          { style: { overflow: "hidden", "text-overflow": "ellipsis" } },
          value?.length != 0 ? value : ""
        ),
      ]
  }

  function entrySmall(key, value) {
    return [
      span(".col .s4 .m2", { style: { fontWeight: "lighter" } }, key),
      span(".col .s8 .m4", value?.length != 0 ? value : ""),
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


  /**
   * Constant lambda function to create a data row for a sample
   * Uses materialize.css grid features to display basic sample data in a row
   * Depending on the width of the screen the content is either in one single line
   * or details get spread into multiple lines
   * @function SampleInfo/row
   * @param {object} sample the data to be displayed
   * @param {object} props semi-static settings for ie. sourire url or background colors
   * @param {style} blur component style to contain blur settings
   * @param {boolean} zoom boolean to alter component content depending if the rowDetails are expanded or not
   * @return {object} object with members for each treatment type, each has wrapping div with vdom elements
   */
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

    const _filters = sample.filters != undefined ? sample.filters : []
    const origCell = _filters.find(e => e.key == "orig_cell")?.value ?? "N/A"

    return {
      trt_cp: div(".row", { style: { fontWeight: "small" } }, [
        div(".valign-wrapper", [
          div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
            zhangRounded,
          ]),

          div(".col .l2 .hide-on-med-and-down .truncate", [sample.id]),
          div(".col .l1 .hide-on-med-and-down", [origCell]),
          div(".col .l2 .hide-on-med-and-down .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .l3 .hide-on-med-and-down", { style: blur }, [sample.trt_name]),

          div(".col .s2 .offset-s5 .l1", { style: blur }, imgForTrtPart),
          div(".col .s3 .l2 .center-align", { style: blur }, visualizeSmilesPart),
        ]),
        div(".hide-on-large-only", {style: {paddingTop: "10px"}}, [
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
          div(".col .s8 .truncate", [sample.id]),
          div(".col .s4 .m3 .offset-m1", ["Cell"]),
          div(".col .s8", [origCell]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
          div(".col .s8 .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
          div(".col .s8", { style: blur }, [sample.trt_name])
        ])
      ]),
      trt_sh: div(".row", { style: { fontWeight: "small" } }, [
        div(".valign-wrapper", [
          div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
            zhangRounded,
          ]),

          div(".col .l2 .hide-on-med-and-down .truncate", [sample.id]),
          div(".col .l1 .hide-on-med-and-down", [origCell]),
          div(".col .l2 .hide-on-med-and-down .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .l3 .hide-on-med-and-down", { style: blur }, [sample.trt_name]),

          div(".col .s2 .offset-s5 .l1", { style: blur }, imgForTrtPart),
          div(".col .s3 .l2 .center-align", { style: blur }, visualizeTextPart),
        ]),
        div(".hide-on-large-only", {style: {paddingTop: "10px"}}, [
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
          div(".col .s8 .truncate", [sample.id]),
          div(".col .s4 .m3 .offset-m1", ["Cell"]),
          div(".col .s8", [origCell]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
          div(".col .s8 .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
          div(".col .s8", { style: blur }, [sample.trt_name])
        ])
      ]),
      trt_oe: div(".row", { style: { fontWeight: "small" } }, [
        div(".valign-wrapper", [
          div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
            zhangRounded,
          ]),

          div(".col .l2 .hide-on-med-and-down .truncate", [sample.id]),
          div(".col .l1 .hide-on-med-and-down", [origCell]),
          div(".col .l2 .hide-on-med-and-down .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .l3 .hide-on-med-and-down", { style: blur }, [sample.trt_name]),

          div(".col .s2 .offset-s5 .l1", { style: blur }, imgForTrtPart),
          div(".col .s3 .l2 .center-align", { style: blur }, visualizeTextPart),
        ]),
        div(".hide-on-large-only", {style: {paddingTop: "10px"}}, [
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
          div(".col .s8 .truncate", [sample.id]),
          div(".col .s4 .m3 .offset-m1", ["Cell"]),
          div(".col .s8", [origCell]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
          div(".col .s8 .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
          div(".col .s8", { style: blur }, [sample.trt_name])
        ])
      ]),
      trt_lig: div(".row", { style: { fontWeight: "small" } }, [
        div(".valign-wrapper", [
          div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
            zhangRounded,
          ]),

          div(".col .l2 .hide-on-med-and-down .truncate", [sample.id]),
          div(".col .l1 .hide-on-med-and-down", [origCell]),
          div(".col .l2 .hide-on-med-and-down .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .l3 .hide-on-med-and-down", { style: blur }, [sample.trt_name]),

          div(".col .s2 .offset-s5 .l1", { style: blur }, imgForTrtPart),
          div(".col .s3 .l2 .center-align", { style: blur }, visualizeTextPart),
        ]),
        div(".hide-on-large-only", {style: {paddingTop: "10px"}}, [
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
          div(".col .s8 .truncate", [sample.id]),
          div(".col .s4 .m3 .offset-m1", ["Cell"]),
          div(".col .s8", [origCell]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
          div(".col .s8 .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
          div(".col .s8", { style: blur }, [sample.trt_name])
        ])
      ]),
      ctl_vector: div(".row", { style: { fontWeight: "small" } }, [
        div(".valign-wrapper", [
          div(".col .s2 .l1 .left-align", { style: { fontWeight: "bold" } }, [
            zhangRounded,
          ]),

          div(".col .l2 .hide-on-med-and-down .truncate", [sample.id]),
          div(".col .l1 .hide-on-med-and-down", [origCell]),
          div(".col .l2 .hide-on-med-and-down .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .l3 .hide-on-med-and-down", { style: blur }, [sample.trt_name]),

          div(".col .s2 .offset-s5 .l1", { style: blur }, imgForTrtPart),
          div(".col .s3 .l2 .center-align", { style: blur }, visualizeTextPart),
        ]),
        div(".hide-on-large-only", {style: {paddingTop: "10px"}}, [
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Sample ID"]),
          div(".col .s8 .truncate", [sample.id]),
          div(".col .s4 .m3 .offset-m1", ["Cell"]),
          div(".col .s8", [origCell]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment ID"]),
          div(".col .s8 .truncate", { style: blur }, [ sample.trt_id != "NA" ? sample.trt_id : "" ]),
          div(".col .s4 .m3 .offset-m1", {style: {whiteSpace: "nowrap"}}, ["Treatment Name"]),
          div(".col .s8", { style: blur }, [sample.trt_name])
        ])
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

  /**
   * Constant lambda function to create a data row details for a sample
   * @function SampleInfo/rowDetails
   * @param {object} sample the data to be displayed
   * @param {object} props static settings for ie. sourire url or background colors
   * @param {style} blur component style to contain blur settings
   * @return {object} object with members for each treatment type, each has wrapping div with vdom elements
   */
  const rowDetail = (sample, props, blur) => {
    let hStyle = { style: { margin: "0px", fontWeight: "bold" } }
    let pStyle = { style: { margin: "0px" } }
    let pStylewBlur = { style: merge(blur, { margin: "0px" }) }
    const _filters = sample.filters != undefined ? sample.filters : []

    const origDose = _filters.find(e => e.key == "orig_dose")?.value ?? "N/A"
    const origCell = _filters.find(e => e.key == "orig_cell")?.value ?? "N/A"

    const samplePart =
      [
        p(".col .s12 .sampleHeader", hStyle, "Sample Info:"),
        p(".row", pStyle, entry("Sample ID: ", sample.id)),
        p(".row", pStyle, entry("Cell: ", origCell)),
        p(".row", pStyle, entry("Dose: ", maxLengthValueUnit(origDose, sample?.dose_unit ?? "?", 7))),
        p(".row", pStyle, entry("Log(dose): ", maxLengthValueUnit(sample.dose, "", 7))),
        p(".row", pStyle, entry("Time: ", maxLengthValueUnit(sample.time, sample?.time_unit ?? "?", 7))),
        p(".row", pStyle, entry("Year: ", sample.year)),
        p(".row", pStyle, entry("Plate: ", sample.plate)),
      ]

    const treatmentPart =
      [
        p(".col .s12 .treatmentHeader", hStyle, "Treatment Info:"),
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
          [p(".col .s12 .filterHeader", hStyle, "Filter Info:")].concat(
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
          [p(".col .s12.filterHeader", hStyle, "Filter Info:")].concat(
            _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
          )
        ),
      ]),
      trt_oe: div([
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
          [p(".col .s12.filterHeader", hStyle, "Filter Info:")].concat(
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
          [p(".col .s12 .filterHeader", hStyle, "Filter Info:")].concat(
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
          [p(".col .s12 .filterHeader", hStyle, "Filter Info:")].concat(
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
            [p(".col .s12 .filterHeader", hStyle, "Filter Info:")].concat(
              _filters.map((x) => p(pStyle, entrySmall(x.key, x.value)))
            )
          ),
        ]),
      ]),
    }
  }

  const vdom$ = xs
    .combine(state$, zoomed$, zoomed2$, props$, blur$, informationDetails$)
    .map(([sample, zoom, zoom2, props, blur, informationDetails]) => {
      let bgcolor =
        sample.zhang >= 0 ? "rgba(44,123,182, 0.08)" : "rgba(215,25,28, 0.08)"
      const updtProps = { ...props, bgColor: bgcolor }

      const thisRow = row(sample, updtProps, blur, zoom)
      const thisRowDetail = rowDetail(sample, updtProps, blur)
      const thisRowReplicationDetails = [
        div(".col .s12", [
          div(".row", i(".btn-flat .material-icons  .informationDetailsZoom", "info_outline")),
          div(".row", [ div(".col .s2", "processing level"), div(".col", informationDetails?.processing_level) ]),
          div(".row", [ div(".col .s2", "replicates"), div(".col", informationDetails?.number_of_replicates) ]),
          div(".row", [ div(".col .s2", "cell"), div(informationDetails?.cell_details?.map(c => div(".col", c))) ]),
          div(".row", [ div(".col .s2", "plate"), div(informationDetails?.plate_details?.map(c => div(".col", c))) ]),
          div(".row", [ div(".col .s2", "well"), div(informationDetails?.well_details?.map(c => div(".col", c))) ]),
          div(".row", [ div(".col .s2", "batch"), div(informationDetails?.batch_details?.map(c => div(".col", c))) ]),
          div(".row", [ div(".col .s2", "year"), div(informationDetails?.year_details?.map(c => div(".col", c))) ]),
          div(".row", [ div(".col .s2", "extra"), div(informationDetails?.extra_details?.map(c => div(".col", c))) ]),
        ])
      ]
      const thisRowNoReplicationDetails = [
        div(".col .s12", [
          div(".row", i(".btn-flat .material-icons .informationDetailsZoom", "info_outline")),
        ])
      ]

      return li(
        ".collection-item .zoom .sampleInfo",
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
          zoom
            ? zoom2
              ? div(".row", thisRowReplicationDetails)
              : div(".row", thisRowNoReplicationDetails)
            : div(),
        ]
      )
    })
    .startWith(li(".collection-itm .zoom", [p("Just one item!!!")]))

  return {
    DOM: vdom$,
    HTTP: informationDetailsHTTP$,
  }
}
