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
    sources.onion.state$,
    "settings.debug"
  )

  const state$ = sources.onion.state$

  const TreatmentCheckSink = isolate(TreatmentCheck, { onion: checkLens })(
    sources
  )
  const treatmentQuery$ = TreatmentCheckSink.output.remember()

  const SampleSelectionSink = isolate(SampleSelection, {
    onion: sampleSelectionLens,
  })({ ...sources, input: treatmentQuery$ })
  const sampleSelection$ = SampleSelectionSink.output.remember()

  const SignatureGeneratorSink = isolate(SignatureGenerator, {
    onion: signatureLens,
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
    return { ...prevState, form: {}, sampleSelection: {}, signature: {} }
  })

  return {
    log: xs.merge(
      logger(state$, "state$"),
      TreatmentCheckSink.log,
      SampleSelectionSink.log,
      SignatureGeneratorSink.log
    ),
    DOM: vdom$,
    onion: xs.merge(
      defaultReducer$,
      TreatmentCheckSink.onion,
      SampleSelectionSink.onion,
      SignatureGeneratorSink.onion
    ),
    HTTP: xs.merge(
      TreatmentCheckSink.HTTP,
      SampleSelectionSink.HTTP,
      SignatureGeneratorSink.HTTP
    ),
    output: signature$,
    modal: xs.merge(SignatureGeneratorSink.modal, SampleSelectionSink.modal),
    ac: TreatmentCheckSink.ac,
  }
}

export { TreatmentForm, treatmentLikeFilter }
