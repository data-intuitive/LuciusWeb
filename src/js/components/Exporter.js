import xs from "xstream"
import { div, i, ul, li, p, input, button, span, a } from "@cycle/dom"
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

  return {
    exportLinkTrigger$: exportLinkTrigger$,
    exportSignatureTrigger$: exportSignatureTrigger$,
    exportPlotsTrigger$: exportPlotsTrigger$,
    exportHeadTableTrigger$: exportHeadTableTrigger$,
    exportTailTableTrigger$: exportTailTableTrigger$,
    modalTrigger$: modalTrigger$,
    modalCloseTrigger$: modalCloseTrigger$,
  }
}

function model(actions, state$) {
  
  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' }))
  
  function notEmpty(data) {
    return data != undefined && data != ""
  }

  const signaturePresent$ = state$.map((state) => notEmpty(state.form.signature.output)).startWith(false)
  const plotsPresent$ = xs.of(true)
  const headTablePresent$ = state$.map((state) => notEmpty(state.headTable.data)).startWith(false)
  const tailTablePresent$ = state$.map((state) => notEmpty(state.tailTable.data)).startWith(false)

  const url$ = state$.map((state) => state.routerInformation.pageStateURL).startWith("")
  const signature$ = state$.map((state) => state.form.signature.output).startWith("")
  const plots$ = xs.of("iVBORw0KGgoAAAANSUhEUgAAAV0AAAFDCAMAAACuii1uAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAuIwAALiMBeKU/dgAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgSW1hZ2VSZWFkeTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KKS7NPQAAADNQTFRFAAAA////////////////////////////////////////////////////////////////t5XiggAAABB0Uk5TABAgMEBQYHCAkKCwwNDg8FTgqMgAABBNSURBVHja7Z3bgqQqDEVFEAER+P+vPS9nZlQIBBXLS/I43VOtq2IuO4Bd99eUD7G5odsaM+HW5qy1So1CdDcyiJncwp3DU8zbSQ38DnAleI097lu4r81m/LUfW/DixvUvhmfarGX/O7oevC61+j0enmvOSPYbujOSLgvPtlnxGyW1KK258HTzZriabg+Fhnnzi0N4gV0OeEjjnRm+ungWYH1piGDjZLemZcrNlb2xVUQuN7KOrNqEGJSymLbHCKK1O5mI0diSA0vidMS41Fk39ooCxNFgoXJObHoidLgs0o74No3EoyW+TStPORHftqU9kOYov50UInSyN/UjoTlpYJAMwY76i7Mc2KQc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")

  const headTableCsv$ = state$.map((state) => state.headTable.data)
    .filter((data) => notEmpty(data))
    .map((data) => convertToCSV(data))
    .startWith("")
  
  const tailTableCsv$ = state$.map((state) => state.tailTable.data)
    .filter((data) => notEmpty(data))
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

  // not yet functional, uses static content
  const clipboardPlots$ = actions.exportPlotsTrigger$
    .compose(sampleCombine(plots$))
    .map(([_, plots]) => {

      const byteCharacters = atob(plots);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      return {
        type: "image/png",
        data: new Blob([byteArray], {type: 'image/png'}),
      }
    })
    .remember().debug("clipboardPlots$")

  const clipboardHeadTable$ = actions.exportHeadTableTrigger$
    .compose(sampleCombine(headTableCsv$))
    .map(([_, table]) => table)
    .remember()

  const clipboardTailTable$ = actions.exportTailTableTrigger$
    .compose(sampleCombine(tailTableCsv$))
    .map(([_, table]) => table)
    .remember()

  
  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
    clipboard$: xs.merge(clipboardLink$, clipboardSignature$, clipboardPlots$, clipboardHeadTable$, clipboardTailTable$),
    dataPresent: {
      signaturePresent$: signaturePresent$,
      plotsPresent$: plotsPresent$,
      headTablePresent$: headTablePresent$,
      tailTablePresent$: tailTablePresent$,
    },
    exportData: {
      url$: url$,
      signature$: signature$,
      plots$: plots$,
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
        dataPresent.plotsPresent$,
        dataPresent.headTablePresent$,
        dataPresent.tailTablePresent$,
        exportData.url$,
        exportData.signature$,
        exportData.plots$,
        exportData.headTableCsv$,
        exportData.tailTableCsv$,
      )
      .map(([signaturePresent, plotsPresent, headTablePresent, tailTablePresent, url, signature, plots, headTableCsv, tailTableCsv]) => {
        const signatureAvailable = signaturePresent ? "" : " .disabled"
        const plotsAvailable = plotsPresent ? "" : " .disabled"
        const headTableAvailable = headTablePresent ? "" : " .disabled"
        const tailTableAvailable = tailTablePresent ? "" : " .disabled"
        const reportAvailable = " .disabled"

        const urlFile = "data:text/plain;charset=utf-8," + url
        const signatureFile = "data:text/plain;charset=utf-8," + signature
        const plotsFile = "data:image/png;base64," + plots
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