import xs from "xstream"
import { div, i, ul, li, p, input, button, span, a } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"
import sampleCombine from "xstream/extra/sampleCombine"

function intent(domSource$) {
  const exportLinkTrigger$ = domSource$.select(".export-clipboard-link").events("click")
  const exportSignatureTrigger$ = domSource$.select(".export-clipboard-signature").events("click")
  // const exportPdfTrigger$ = domSource$.select(".export-pdf").events("click")

  const modalTrigger$ = domSource$.select(".modal-open-btn").events("click")
  const modalCloseTrigger$ = domSource$.select(".export-close").events("click")

  return {
    exportLinkTrigger$: exportLinkTrigger$,
    exportSignatureTrigger$: exportSignatureTrigger$,
    // exportPdfTrigger$: exportPdfTrigger$,
    modalTrigger$: modalTrigger$,
    modalCloseTrigger$: modalCloseTrigger$,
  }
}

function model(actions, state$) {
  
  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' }))
  
  const clipboardLink$ = actions.exportLinkTrigger$
    .compose(sampleCombine(state$.map((state) => state.routerInformation.pageStateURL)))
    .map(([_, url]) => url)
    .remember()

  const clipboardSignature$ = actions.exportSignatureTrigger$
    .compose(sampleCombine(state$.map((state) => state.form.signature.output)))
    .map(([_, signature]) => signature)
    .remember()

  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
    clipboard$: xs.merge(clipboardLink$, clipboardSignature$),
  }
}

function view(state$) {

    const signaturePresent$ = state$.map((state) => state.form.signature.output != undefined && state.form.signature.output != "")

    const fab$ = signaturePresent$
      .map((signature) =>
        div(".fixed-action-btn", [
            span(".btn-floating .btn-large", i(".large .material-icons", "share")),
            ul([
                li(span(".btn-floating .export-clipboard-link", i(".material-icons", "link"))),
                li(span(".btn-floating .export-clipboard-signature", i(".material-icons", "content_copy"))),
                // li(span(".btn-floating .export-file-report", i(".material-icons", "picture_as_pdf"))),
                li(span(".btn-floating .modal-open-btn", i(".material-icons", "open_with"))),
            ])
        ]))
        .startWith(div())

    const url$ = state$.map((state) => state.routerInformation.pageStateURL)
    const signature$ = state$.map((state) => state.form.signature.output)

    const modal$ = xs
      .combine(
        signaturePresent$,
        url$,
        signature$,
      )
      .map(([signaturePresent, url, signature]) => {
        const signatureAvailable = signaturePresent ? "" : " .disabled"
        const plotsAvailable = " .disabled"
        const topTableAvailable = " .disabled"
        const bottomTableAvailable = " .disabled"
        const reportAvailable = " .disabled"

        const urlFile = "text/plain;charset=utf-8," + url
        const signatureFile = "text/plain;charset=utf-8," + signature

        return div([
          div("#modal-exporter.modal", [
            div(".modal-content", [
              div(".row .title", 
                p(".col .s12", "Export to clipboard or file")
              ),
              div(".row", [
                span(".col .s6 .push-s1", "Create link to this page's state"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-link", i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-link", i(".material-icons", "file_download")),
                a(".btn .col .s1 .offset-s1",
                  {
                    props: {
                      href: "data:" + urlFile,
                      download: "url.txt",
                    },
                  },
                  i(".material-icons", "file_download"),
                ),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy signature"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-signature" + signatureAvailable, i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-signature" + signatureAvailable, i(".material-icons", "file_download")),
                a(".btn .col .s1 .offset-s1" + signatureAvailable,
                  {
                    props: {
                      href: "data:" + signatureFile,
                      download: "signature.txt",
                    },
                  },
                  i(".material-icons", "file_download"),
                ),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy binned plots"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-plots" + plotsAvailable, i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1 .export-file-plots" + plotsAvailable, i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy top table"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-toptable" + topTableAvailable, i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1 .export-file-toptable" + topTableAvailable, i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy bottom table"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-bottomtable" + bottomTableAvailable, i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s1 .export-file-bottomtable" + bottomTableAvailable, i(".material-icons", "file_download")),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Export report"),
                // span(".btn .col .s1 .offset-s1", i(".material-icons", "content_copy")),
                span(".btn .col .s1 .offset-s3 .export-file-report" + reportAvailable, i(".material-icons", "file_download")),
              ]),
            ]),
            div(".modal-footer", [
              button(".export-close .col .s8 .push-s2 .btn", "Close"),
              div(".col .s12 .blue.lighten-3", {style: {wordWrap: "break-word"}}, url),
            ]),
          ]),
        ])
      })
      .startWith(div())

    const vdom$ = xs.combine(
      fab$,
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

  const model_ = model(actions, state$)

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
    clipboard: model_.clipboard$,
  }
}

export {Exporter}