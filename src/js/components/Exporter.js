import xs from "xstream"
import { div, i, ul, li, p, input, button, span } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"

function intent(domSource$) {
  const exportLinkTrigger$ = domSource$.select(".export-link").events("click")
  const exportSignatureTrigger$ = domSource$.select(".export-signature").events("click")
  const exportPdfTrigger$ = domSource$.select(".export-pdf").events("click")

  const modalTrigger$ = domSource$.select(".modal-open-btn").events("click")
  const modalCloseTrigger$ = domSource$.select(".export-close").events("click")

  return {
    exportLinkTrigger$: exportLinkTrigger$,
    exportSignatureTrigger$: exportSignatureTrigger$,
    exportPdfTrigger$: exportPdfTrigger$,
    modalTrigger$: modalTrigger$,
    modalCloseTrigger$: modalCloseTrigger$,
  }
}

function model(actions) {
  
  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' }))

  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
  }
}

function view(state$) {

    const fab = div(".fixed-action-btn", [
        span(".btn-floating .btn-large", i(".large .material-icons", "share")),
        ul([
            li(span(".btn-floating .export-link", i(".material-icons", "link"))),
            li(span(".btn-floating .export-signature", i(".material-icons", "content_copy"))),
            li(span(".btn-floating .export-pdf", i(".material-icons", "picture_as_pdf"))),
            li(span(".btn-floating .modal-open-btn", i(".material-icons", "open_with"))),
        ])
    ])

    const modal$ = state$
      .map((state) =>
        div([
          div("#modal-exporter.modal", [
            div(".modal-content", [
              div(".row", 
                p(".col .s12", "Export to clipboard or file")
              ),
              div(".row", [
                span(".col .s4", "Create link to this page's state"),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s4", "Copy signature"),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s4", "Copy binned plots"),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s4", "Copy top table"),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s4", "Copy bottom table"),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1", i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s4", "Export report"),
                // span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s3 .disabled", i(".material-icons", "file_download")),
              ]),
            ]),
            div(".modal-footer", [
              button(".export-close .col .s8 .push-s2 .btn", "Close"),
            ]),
          ]),
        ])
      )
      .startWith(div())

    const vdom$ = xs.combine(
      xs.of(fab),
      modal$
    )
    .map(([fab, modal]) => (div([fab, modal])))

    return vdom$
}



function Exporter(sources) {


  const logger = loggerFactory(
    "exporter",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

  const actions = intent(sources.DOM)

  const vdom$ = view(state$)

  const model_ = model(actions)

  const fabInit$ = xs.of({
      state: "init",
      element: ".fixed-action-btn",
      options: {
          direction: "top",
        //   hoverEnabled: false,
      }
  }).compose(delay(1000)).remember()

  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: model_.reducers$,
    fab: fabInit$,
    modal: model_.modal$,
  }
}

export {Exporter}