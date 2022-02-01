import xs from "xstream"
import { div, i, ul, li, p, input, button, span, a } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"
import sampleCombine from "xstream/extra/sampleCombine"
import { convertToCSV } from "../utils/export"

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

  function notEmpty(data) {
    return data != undefined && data != ""
  }

  const signaturePresent$ = state$.map((state) => notEmpty(state.form.signature.output)).startWith(false)
  const headTablePresent$ = state$.map((state) => notEmpty(state.headTable.data)).startWith(false)
  const tailTablePresent$ = state$.map((state) => notEmpty(state.tailTable.data)).startWith(false)

  const url$ = state$.map((state) => state.routerInformation.pageStateURL).startWith("")
  const signature$ = state$.map((state) => state.form.signature.output).startWith("")

  const headTableCsv$ = state$.map((state) => state.headTable.data)
    .filter((data) => notEmpty(data))
    .map((data) => convertToCSV(data))
    .startWith("")
  
  const tailTableCsv$ = state$.map((state) => state.tailTable.data)
    .filter((data) => notEmpty(data))
    .map((data) => convertToCSV(data))
    .startWith("")
  
  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
    clipboard$: xs.merge(clipboardLink$, clipboardSignature$),
    dataPresent: {
      signaturePresent$: signaturePresent$,
      headTablePresent$: headTablePresent$,
      tailTablePresent$: tailTablePresent$,
    },
    exportData: {
      url$: url$,
      signature$: signature$,
      headTableCsv$: headTableCsv$,
      tailTableCsv$: tailTableCsv$,
    }
  }
}

function view(state$, dataPresent, exportData) {

    const fab$ = dataPresent.signaturePresent$
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

    const modal$ = xs
      .combine(
        dataPresent.signaturePresent$,
        dataPresent.headTablePresent$,
        dataPresent.tailTablePresent$,
        exportData.url$,
        exportData.signature$,
        exportData.headTableCsv$,
        exportData.tailTableCsv$,
      )
      .map(([signaturePresent, headTablePresent, tailTablePresent, url, signature, headTableCsv, tailTableCsv]) => {
        const signatureAvailable = signaturePresent ? "" : " .disabled"
        const plotsAvailable = ""//" .disabled"
        const headTableAvailable = headTablePresent ? "" : " .disabled"
        const tailTableAvailable = tailTablePresent ? "" : " .disabled"
        const reportAvailable = " .disabled"

        const urlFile = "data:text/plain;charset=utf-8," + url
        const signatureFile = "data:text/plain;charset=utf-8," + signature
        const plotsFile = "data:image/png;base64,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"

        const headTableCsvFile = "data:text/tsv;charset=utf-8," + encodeURIComponent(headTableCsv)
        const tailTableCsvFile = "data:text/tsv;charset=utf-8," + encodeURIComponent(tailTableCsv)


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
                      href: urlFile,
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
                      href: signatureFile,
                      download: "signature.txt",
                    },
                  },
                  i(".material-icons", "file_download"),
                ),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy binned plots"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-plots" + plotsAvailable, i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-plots" + plotsAvailable, i(".material-icons", "file_download")),
                a(".btn .col .s1 .offset-s1" + plotsAvailable,
                  {
                    props: {
                      href: plotsFile,
                      download: "plot.png",
                    },
                  },
                  i(".material-icons", "file_download"),
                ),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy top table"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-toptable" + headTableAvailable, i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-toptable" + headTableAvailable, i(".material-icons", "file_download")),
                a(".btn .col .s1 .offset-s1" + headTableAvailable,
                  {
                    props: {
                      href: headTableCsvFile,
                      download: "table.tsv",
                    },
                  },
                  i(".material-icons", "file_download"),
                ),
              ]),
              div(".row", [
                span(".col .s6 .push-s1", "Copy bottom table"),
                span(".btn .col .s1 .offset-s1 .export-clipboard-bottomtable" + tailTableAvailable, i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-bottomtable" + bottomTableAvailable, i(".material-icons", "file_download")),
                a(".btn .col .s1 .offset-s1" + tailTableAvailable,
                  {
                    props: {
                      href: tailTableCsvFile,
                      download: "table.tsv",
                    },
                  },
                  i(".material-icons", "file_download"),
                ),
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
      .startWith(div("#modal-exporter.modal", "empty"))

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

  const model_ = model(actions, state$)

  const vdom$ = view(state$, model_.dataPresent, model_.exportData)

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