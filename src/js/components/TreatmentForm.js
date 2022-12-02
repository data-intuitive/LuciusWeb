import isolate from "@cycle/isolate"
import { div } from "@cycle/dom"
import xs from "xstream"
import { TreatmentCheck, checkLens, treatmentLikeFilter } from "./TreatmentCheck"
import { SampleSelection, sampleSelectionLens } from "./SampleSelection"
import { SignatureGenerator, signatureLens } from "./SignatureGenerator"
import { loggerFactory } from "../utils/logger"

function TreatmentForm(sources) {
  const logger = loggerFactory(
    "treatmentForm",
    sources.state.stream,
    "settings.debug"
  )

  const state$ = sources.state.stream

  const TreatmentCheckSink = isolate(TreatmentCheck, { state: checkLens })(
    sources
  )
  const treatmentQuery$ = TreatmentCheckSink.output.remember()

  const SampleSelectionSink = isolate(SampleSelection, {
    state: sampleSelectionLens,
  })({ ...sources, input: treatmentQuery$ })
  const sampleSelection$ = SampleSelectionSink.output.remember()

  const SignatureGeneratorSink = isolate(SignatureGenerator, {
    state: signatureLens,
  })({ ...sources, input: sampleSelection$ })
  const signature$ = SignatureGeneratorSink.output.remember()

  const vdom$ = xs
    .combine(
      TreatmentCheckSink.DOM.startWith(div()),
      SampleSelectionSink.DOM,
      SignatureGeneratorSink.DOM
    )
    .map(([formDom, selectionDOM, signatureDOM]) =>
      div([
        formDom,
        selectionDOM,
        div(".col .s10 .offset-s1", [
          div(".row", [div(".col .s12", [signatureDOM])]),
        ]),
      ])
    )

  const defaultReducer$ = xs.of((prevState) => {
    // treatmentForm -- default Reducer
    return { ...prevState, check: {}, sampleSelection: {}, signature: {} }
  })

  return {
    log: xs.merge(
      logger(state$, "state$"),
      TreatmentCheckSink.log,
      SampleSelectionSink.log,
      SignatureGeneratorSink.log
    ),
    DOM: vdom$,
    state: xs.merge(
      defaultReducer$,
      TreatmentCheckSink.state,
      SampleSelectionSink.state,
      SignatureGeneratorSink.state
    ),
    HTTP: xs.merge(
      TreatmentCheckSink.HTTP,
      SampleSelectionSink.HTTP,
      SignatureGeneratorSink.HTTP
    ),
    output: signature$,
    modal: xs.merge(SignatureGeneratorSink.modal, SampleSelectionSink.modal),
    ac: TreatmentCheckSink.ac,
    slider: SampleSelectionSink.slider,
  }
}

export { TreatmentForm, treatmentLikeFilter }
