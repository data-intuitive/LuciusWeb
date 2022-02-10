import xs from "xstream"
import { div, i, ul, li, p, input, button, span, a } from "@cycle/dom"
import { isEmpty, mergeLeft, equals } from "ramda"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"
import sampleCombine from "xstream/extra/sampleCombine"
import dropRepeats from "xstream/extra/dropRepeats"
import { convertToCSV } from "../utils/export"

/**
 * @module components/Exporter
 */

/**
 * Get triggers from button presses in the DOM
 * @function intent
 * @param {*} domSource$ 
 * @returns object containing trigger streams
 */
function intent(domSource$) {
  const exportLinkTriggerFab$ = domSource$.select(".export-clipboard-link-fab").events("click")
  const exportSignatureTriggerFab$ = domSource$.select(".export-clipboard-signature-fab").events("click")

  const exportLinkTrigger$ = domSource$.select(".export-clipboard-link").events("click")
  const exportSignatureTrigger$ = domSource$.select(".export-clipboard-signature").events("click")
  const exportPlotsTrigger$ = domSource$.select(".export-clipboard-plots").events("click")
  const exportHeadTableTrigger$ = domSource$.select(".export-clipboard-headTable").events("click")
  const exportTailTableTrigger$ = domSource$.select(".export-clipboard-tailTable").events("click")

  const modalTrigger$ = domSource$.select(".modal-open-btn").events("click")
  const modalCloseTrigger$ = domSource$.select(".export-close").events("click")

  const testTrigger$ = domSource$.select(".test-btn").events("click")

  return {
    exportLinkTriggerFab$: exportLinkTriggerFab$,
    exportSignatureTriggerFab$: exportSignatureTriggerFab$,
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

/**
 * collect data to be made available for copy/download
 * trigger modal to be opened or closed
 * send data to clipboard when triggered
 * 
 * @function model
 * @param {Object} actions object of trigger streams
 * @param {Stream} state$ full state
 * @param {Stream} vega$ stream of vega objects, to be filtered 
 * @param {Object} config configuration object passed from workflow
 * @returns Object with 
 *            * reducers$ placeholder for reducers
 *            * modal$ data to be sent to the modal driver
 *            * clipboard$ data to be sent to the clipboard driver
 *            * dataPresent Object with booleans for what data is available
 *            * exportData Object with data
 */
function model(actions, state$, vega$, config) {
  
  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' }))
  
  function notEmptyOrUndefined(data) {
    return data != undefined && !isEmpty(data)
  }

  const signaturePresent$ = state$.map((state) => notEmptyOrUndefined(state.form.signature?.output)).startWith(false)
  const plotsPresent$ = state$.map((state) => notEmptyOrUndefined(state.plots.data)).startWith(false)
  const headTablePresent$ = state$.map((state) => notEmptyOrUndefined(state.headTable?.data)).startWith(false)
  const tailTablePresent$ = state$.map((state) => notEmptyOrUndefined(state.tailTable?.data)).startWith(false)

  const url$ = state$.map((state) => state.routerInformation.pageStateURL).startWith("")
  const signature$ = state$.map((state) => state.form.signature?.output).startWith("")
  // result already contains 'data:image/png;base64,'
  const plotFile$ = vega$
    .filter(vega => vega.el == config.plotId)
    .map((vega) => xs.fromPromise(vega.view.toImageURL('png')))
    .flatten()
    .startWith("")

  const headTableCsv$ = state$.map((state) => state.headTable?.data)
    .filter((data) => notEmptyOrUndefined(data))
    .map((data) => convertToCSV(data))
    .startWith("")
  
  const tailTableCsv$ = state$.map((state) => state.tailTable?.data)
    .filter((data) => notEmptyOrUndefined(data))
    .map((data) => convertToCSV(data))
    .startWith("")

  const urlFile$ = url$.map(url => "data:text/plain;charset=utf-8," + url)
  const signatureFile$ = signature$.map(signature => "data:text/plain;charset=utf-8," + signature)
  const headTableCsvFile$ = headTableCsv$.map(headTableCsv => "data:text/tsv;charset=utf-8," + encodeURIComponent(headTableCsv))
  const tailTableCsvFile$ = tailTableCsv$.map(tailTableCsv => "data:text/tsv;charset=utf-8," + encodeURIComponent(tailTableCsv))

  const clipboardLinkFab$ = actions.exportLinkTriggerFab$
    .compose(sampleCombine(url$))
    .map(([_, url]) => url)
    .remember()

  const clipboardSignatureFab$ = actions.exportSignatureTriggerFab$
    .compose(sampleCombine(signature$))
    .map(([_, signature]) => signature)
    .remember()

  const clipboardLink$ = actions.exportLinkTrigger$
    .compose(sampleCombine(url$))
    .map(([_, url]) => ({
      sender: "url",
      data: url,
    }))
    .remember()

  const clipboardSignature$ = actions.exportSignatureTrigger$
    .compose(sampleCombine(signature$))
    .map(([_, signature]) => ({
      sender: "signature",
      data: signature,
    }))
    .remember()

  const clipboardPlots$ = actions.exportPlotsTrigger$
    .compose(sampleCombine(plotFile$))
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
    .map(([_, table]) => ({
      sender: "headTable",
      data: table,
    }))
    .remember()

  const clipboardTailTable$ = actions.exportTailTableTrigger$
    .compose(sampleCombine(tailTableCsv$))
    .map(([_, table]) => ({
      sender: "tailTable",
      data: table,
    }))
    .remember()

  const testAction$ = actions.testTrigger$
    .compose(sampleCombine(plotFile$))
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
    clipboard$: xs.merge(clipboardLinkFab$, clipboardSignatureFab$, clipboardLink$, clipboardSignature$, clipboardPlots$, clipboardHeadTable$, clipboardTailTable$, testAction$),
    dataPresent: {
      signaturePresent$: signaturePresent$,
      plotsPresent$: plotsPresent$,
      headTablePresent$: headTablePresent$,
      tailTablePresent$: tailTablePresent$,
    },
    exportData: {
      url$: url$,
      urlFile$: urlFile$,
      signatureFile$: signatureFile$,
      plotFile$: plotFile$,
      headTableCsvFile$: headTableCsvFile$,
      tailTableCsvFile$: tailTableCsvFile$,
    }
  }
}

/**
 * @function view
 * @param {Stream} state$ full state
 * @param {Object} dataPresent object with booleans of what data is available
 * @param {Object} exportData object with available data
 * @param {Object} config configuration object passed from workflow
 * @param {Object} clipboard state of the clipboard driver which gives us our permissions and results
 * @returns Vdom div object with nested children for FAB and modal
 */
function view(state$, dataPresent, exportData, config, clipboard) {

    const fab$ = dataPresent.signaturePresent$
    .map((present) => {
      
      const extraSigClass = config.fabSignature != "update"
        ? config.fabSignature
        : present ? "" : ".disabled"

      return div(".fixed-action-btn", [
          span(".btn-floating .btn-large", i(".large .material-icons", "share")),
          ul([
              li(span(".btn-floating .export-clipboard-link-fab .waves-effect.waves-light", i(".material-icons", "link"))),
              li(span(".btn-floating .export-clipboard-signature-fab .waves-effect.waves-light " + extraSigClass, i(".material-icons", "content_copy"))),
              // li(span(".btn-floating .export-file-report", i(".material-icons", "picture_as_pdf"))),
              li(span(".btn-floating .modal-open-btn .waves-effect.waves-light", i(".material-icons", "open_with"))),
              // li(span(".btn-floating .test-btn", i(".material-icons", "star"))),
          ])
      ])})

    const modal$ = xs
      .combine(
        dataPresent.signaturePresent$,
        dataPresent.plotsPresent$,
        dataPresent.headTablePresent$,
        dataPresent.tailTablePresent$,
        exportData.url$,
        exportData.urlFile$,
        exportData.signatureFile$,
        exportData.plotFile$,
        exportData.headTableCsvFile$,
        exportData.tailTableCsvFile$,
        clipboard.copyImagesPermission$,
        clipboard.results$,
      )
      .map(([
        signaturePresent,
        plotsPresent,
        headTablePresent,
        tailTablePresent,
        url,
        urlFile,
        signatureFile,
        plotFile,
        headTableCsvFile,
        tailTableCsvFile,
        clipboardPermissions,
        clipboardResult,
      ]) => {

        const copyImagesPermission = clipboardPermissions.state == "granted"

        const addExportDiv = (text, clipboardId, fileData, fileName, available, clipboardAllowed=true, downloadAllowed=true) => {
          const availableClipboardText = available && clipboardAllowed ? "" : " .disabled"
          const availableDownloadText = available && downloadAllowed ? "" : " .disabled"

          // Styling should prevent the user to click the 'a' directly; this causes the page div#root to be corrupted.
          // Work around is to make the internal 'i' the full size of the 'a' thus "catching" the initial click.
          // Exact reason is not 100% clear. Using preventDefault doesn't seem to work.
          //
          // At the time of writing, the impression is that it could have to do with the exporter or sub-parts not being isolated.
          // Debugging suggest the @cycle/dom to be the culprit.
          // Removing the 'div#Root' -> 'fromEvent.js:16' event listener prevents the page from misbehaving.
          // Workaround is done in '.paddingfix' in the scss.
          return div(".row", [
            span(".col .s6 .push-s1", text),
            span(".btn .col .s1 .offset-s1 .waves-effect .waves-light " + clipboardId + " " + availableClipboardText, i(".material-icons", "content_copy")),
            a(".btn .col .s1 .offset-s1 .waves-effect .waves-light .paddingfix " + availableDownloadText,
              {
                props: {
                  href: fileData,
                  download: fileName,
                },
              },
              i(".material-icons", "file_download"),
            )
          ])
        }

        return div([
          div("#modal-exporter.modal", [
            div(".modal-content", [
              div(".row .title", [
                p(".col .s12", "Export to clipboard or file"),
                p(".col .s12", "" + clipboardResult.text),
              ]),
              addExportDiv("Create link to this page's state", ".export-clipboard-link", urlFile, "url.txt", true),
              addExportDiv("Copy signature", ".export-clipboard-signature", signatureFile, "signature.txt", signaturePresent),
              addExportDiv("Copy " + config.plotName + " plot", ".export-clipboard-plots", plotFile, "plot.png", plotsPresent, copyImagesPermission),
              addExportDiv("Copy top table", ".export-clipboard-headTable", headTableCsvFile, "table.tsv", headTablePresent),
              addExportDiv("Copy bottom table", ".export-clipboard-tailTable", tailTableCsvFile, "table.tsv", tailTablePresent),
              // div(".row", [
              //   span(".col .s6 .push-s1", "Export report"),
              //   span(".btn .col .s1 .offset-s3 .export-file-report .disabled", i(".material-icons", "file_download")),
              // ]),
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

  const defaultConfig = {
    plotId: "#simplot", // id of the div passed to vega
    plotName: "binned similarity", // part of the text to be displayed for plot copy/download
    fabSignature: "update", // part of FAB class name, set to "", ".hide" or ".disabled". 
                            //"update" sets ".disabled" when the signature is not available and updates the FAB when it becomes available
  }
  const fullConfig = mergeLeft(sources.config, defaultConfig)

  const state$ = sources.onion.state$

  const actions = intent(sources.DOM)

  const model_ = model(actions, state$, sources.vega, fullConfig)

  const vdom$ = view(state$, model_.dataPresent, model_.exportData, fullConfig, sources.clipboard)

  const fabInit$ = vdom$.mapTo({
      state: "init",
      element: ".fixed-action-btn",
      options: {
          direction: "top",
        //   hoverEnabled: false,
      }
    })
    .compose(dropRepeats(equals)) // run just once
    .compose(delay(1)) // let the vdom propagate first and next cycle initialize FAB

  const fabUpdate$ = model_.dataPresent.signaturePresent$
    .filter(_ => fullConfig.fabSignature == "update")
    .compose(dropRepeats(equals))
    .mapTo({
      state: "update",
      element: ".fixed-action-btn",
      options: {
          direction: "top",
        //   hoverEnabled: false,
      }
    })
    .compose(delay(1)) // let the vdom propagate first and next cycle update FAB

  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: model_.reducers$,
    fab: xs.merge(fabInit$, fabUpdate$),
    modal: model_.modal$,
    clipboard: model_.clipboard$,
  }
}

export {Exporter}