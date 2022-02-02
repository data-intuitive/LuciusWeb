import xs from "xstream"
import { div, i, ul, li, p, input, button, span, a } from "@cycle/dom"
import { isEmpty } from "ramda"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"
import sampleCombine from "xstream/extra/sampleCombine"
import { convertToCSV } from "../utils/export"

function intent(domSource$) {
  const exportLinkTrigger$ = domSource$.select(".export-clipboard-link").events("click")
  const exportSignatureTrigger$ = domSource$.select(".export-clipboard-signature").events("click")
  const exportPlotsTrigger$ = domSource$.select(".export-clipboard-plots").events("click")
  const exportHeadTableTrigger$ = domSource$.select(".export-clipboard-headTable").events("click")
  const exportTailTableTrigger$ = domSource$.select(".export-clipboard-tailTable").events("click")

  const modalTrigger$ = domSource$.select(".modal-open-btn").events("click")
  const modalCloseTrigger$ = domSource$.select(".export-close").events("click")

  const testTrigger$ = domSource$.select(".test-btn").events("click")

  return {
    exportLinkTrigger$: exportLinkTrigger$,
    exportSignatureTrigger$: exportSignatureTrigger$,
    exportPlotsTrigger$: exportPlotsTrigger$,
    exportHeadTableTrigger$: exportHeadTableTrigger$,
    exportTailTableTrigger$: exportTailTableTrigger$,
    modalTrigger$: modalTrigger$,
    modalCloseTrigger$: modalCloseTrigger$,
    testTrigger$: testTrigger$,
  }
}

function model(actions, state$, vega$) {
  
  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' }))
  
  function notEmptyOrUndefined(data) {
    return data != undefined && !isEmpty(data)
  }

  const signaturePresent$ = state$.map((state) => notEmptyOrUndefined(state.form.signature.output)).startWith(false)
  const plotsPresent$ = state$.map((state) => notEmptyOrUndefined(state.plots.data)).startWith(false)
  const headTablePresent$ = state$.map((state) => notEmptyOrUndefined(state.headTable.data)).startWith(false)
  const tailTablePresent$ = state$.map((state) => notEmptyOrUndefined(state.tailTable.data)).startWith(false)

  const url$ = state$.map((state) => state.routerInformation.pageStateURL).startWith("")
  const signature$ = state$.map((state) => state.form.signature.output).startWith("")
  const similarityPlot$ = vega$
    .filter(vega => vega.el == '#simplot')
    .map((vega) => xs.fromPromise(vega.view.toImageURL('png')))
    .flatten()
    .startWith("")

  const headTableCsv$ = state$.map((state) => state.headTable.data)
    .filter((data) => notEmptyOrUndefined(data))
    .map((data) => convertToCSV(data))
    .startWith("")
  
  const tailTableCsv$ = state$.map((state) => state.tailTable.data)
    .filter((data) => notEmptyOrUndefined(data))
    .map((data) => convertToCSV(data))
    .startWith("")

  const clipboardLink$ = actions.exportLinkTrigger$
    .compose(sampleCombine(url$))
    .map(([_, url]) => url)
    .remember()

  const clipboardSignature$ = actions.exportSignatureTrigger$
    .compose(sampleCombine(signature$))
    .map(([_, signature]) => signature)
    .remember()

  const clipboardPlots$ = actions.exportPlotsTrigger$
    .compose(sampleCombine(similarityPlot$))
    .map(([_, data]) => {
      // input data is "data:image/png;base64,abcdef0123456789..."
      const parts = data.split(';base64,');
      const imageType = parts[0].split(':')[1];
      const decodedData = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        uInt8Array[i] = decodedData.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: imageType })
      return {
        type: imageType,
        data: blob,
      }
    })
    .remember()

  const clipboardHeadTable$ = actions.exportHeadTableTrigger$
    .compose(sampleCombine(headTableCsv$))
    .map(([_, table]) => table)
    .remember()

  const clipboardTailTable$ = actions.exportTailTableTrigger$
    .compose(sampleCombine(tailTableCsv$))
    .map(([_, table]) => table)
    .remember()

  const testAction$ = actions.testTrigger$
    .compose(sampleCombine(similarityPlot$))
    .map(([_, data]) => {
      // input data is "data:image/png;base64,abcdef0123456789..."
      const parts = data.split(';base64,');
      const imageType = parts[0].split(':')[1];
      const decodedData = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        uInt8Array[i] = decodedData.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: imageType })
      return {
        type: imageType,
        data: blob,
      }
    })
    .remember()

  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
    clipboard$: xs.merge(clipboardLink$, clipboardSignature$, clipboardPlots$, clipboardHeadTable$, clipboardTailTable$, testAction$),
    dataPresent: {
      signaturePresent$: signaturePresent$,
      plotsPresent$: plotsPresent$,
      headTablePresent$: headTablePresent$,
      tailTablePresent$: tailTablePresent$,
    },
    exportData: {
      url$: url$,
      signature$: signature$,
      similarityPlot$: similarityPlot$,
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
                li(span(".btn-floating .test-btn", i(".material-icons", "star"))),
            ])
        ]))
        .startWith(div())

    const modal$ = xs
      .combine(
        dataPresent.signaturePresent$,
        dataPresent.plotsPresent$,
        dataPresent.headTablePresent$,
        dataPresent.tailTablePresent$,
        exportData.url$,
        exportData.signature$,
        exportData.similarityPlot$,
        exportData.headTableCsv$,
        exportData.tailTableCsv$,
      )
      .map(([signaturePresent, plotsPresent, headTablePresent, tailTablePresent, url, signature, similarityPlot, headTableCsv, tailTableCsv]) => {
        const signatureAvailable = signaturePresent ? "" : " .disabled"
        const plotsAvailable = plotsPresent ? "" : " .disabled"
        const headTableAvailable = headTablePresent ? "" : " .disabled"
        const tailTableAvailable = tailTablePresent ? "" : " .disabled"
        const reportAvailable = " .disabled"

        const urlFile = "data:text/plain;charset=utf-8," + url
        const signatureFile = "data:text/plain;charset=utf-8," + signature
        const plotsFile = similarityPlot
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
                span(".btn .col .s1 .offset-s1 .export-clipboard-headTable" + headTableAvailable, i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-headTable" + headTableAvailable, i(".material-icons", "file_download")),
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
                span(".btn .col .s1 .offset-s1 .export-clipboard-tailTable" + tailTableAvailable, i(".material-icons", "content_copy")),
                // span(".btn .col .s1 .offset-s1 .export-file-tailTable" + bottomTableAvailable, i(".material-icons", "file_download")),
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

  const model_ = model(actions, state$, sources.vega)

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