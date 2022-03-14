import xs from "xstream"
import { div, i, ul, li, p, input, button, span, a } from "@cycle/dom"
import { isEmpty, mergeLeft, equals, keys, toUpper, all, identity } from "ramda"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"
import debounce from "xstream/extra/debounce"
import sampleCombine from "xstream/extra/sampleCombine"
import dropRepeats from "xstream/extra/dropRepeats"
import { convertToCSV, convertTableToMd, convertFilterToMd, convertSelectedSamplesToMd } from "../utils/export"
import { map } from "jquery"

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
  const exportMdReportTrigger$ = domSource$.select(".export-clipboard-mdReport").events("click")

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
    exportMdReportTrigger$: exportMdReportTrigger$,
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

  const genericMdDataPresent$ = xs.combine(signaturePresent$, plotsPresent$, headTablePresent$, tailTablePresent$).map((arr) => all(identity)(arr))
  const diseaseMdDataPresent$ = xs.combine(plotsPresent$, headTablePresent$, tailTablePresent$).map((arr) => all(identity)(arr))
  const correlationMdDataPresent$ = plotsPresent$

  const mdPresentSelector = {
    "": genericMdDataPresent$, // generic treatment
    "DISEASE": diseaseMdDataPresent$,
    "CORRELATION": correlationMdDataPresent$,
  }

  const mdReportPresent$ = (mdPresentSelector[toUpper(config.workflowName)] ?? mdPresentSelector[""])

  const url$ = state$.map((state) => state.routerInformation.pageStateURL).map((url) => "["+url+"]("+url+")").startWith("")
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

  const urlMd$ = url$

  const treatmentQueryMd$ = state$.map((state) => state.form.check?.output) // generic treatment WF
  const signatureQueryMd$ = state$.map((state) => state.form.query) // disease WF
  const signatureQuery1Md$ = state$.map((state) => state.form.query1) // correlation WF
  const signatureQuery2Md$ = state$.map((state) => state.form.query2) // correlation WF

  // present in generic treatment WFs
  const samplesMd$ = state$.map((state) => convertSelectedSamplesToMd(state.form.sampleSelection?.data)).startWith("")
  const signatureMd$ = signature$

  const filterMd$ = state$.map((state) => convertFilterToMd(state.filter.filter_output, state.settings.filter.values))
    .startWith("")

  const plotMd$ = plotFile$
    .filter((data) => data != "")
    .map((data) => "![](" + data + ")")
    .startWith("")

  const headTableMd$ = state$.map((state) => state.headTable?.data)
    .filter((data) => notEmptyOrUndefined(data))
    .map((data) => convertTableToMd(data))
    .startWith("")
  
  const tailTableMd$ = state$.map((state) => state.tailTable?.data)
    .filter((data) => notEmptyOrUndefined(data))
    .map((data) => convertTableToMd(data))
    .startWith("")

  // data streams with headers added
  const addHeaderL2 = (h) => (s) => ("\n" + "## " + h + "\n\n" + s)
  const urlMdWH$ = urlMd$.map(addHeaderL2("Search query URL"))
  const treatmentQueryMdWH$ = treatmentQueryMd$.map(addHeaderL2("Treatment query"))
  const signatureQueryMdWH$ = signatureQueryMd$.map(addHeaderL2("Signature query"))
  const signatureQuery1MdWH$ = signatureQuery1Md$.map(addHeaderL2("Signature query 1"))
  const signatureQuery2MdWH$ = signatureQuery2Md$.map(addHeaderL2("Signature query 2"))
  const samplesMdWH$ = samplesMd$.map(addHeaderL2("Selected samples"))
  const signatureMdWH$ = signatureMd$.map(addHeaderL2("Signature"))
  const filterMdWH$ = filterMd$.map(addHeaderL2("Filter"))
  const plotMdWH$ = plotMd$.map(addHeaderL2("Plot"))
  const headTableMdWH$ = headTableMd$.map(addHeaderL2("Top table"))
  const tailTableMdWH$ = tailTableMd$.map(addHeaderL2("Bottom table"))

  const WFTitleMd$ = xs.of("# " + config.workflowName + " Workflow report")

  const genericMd$ = xs.combine(WFTitleMd$, urlMdWH$, treatmentQueryMdWH$, samplesMdWH$, signatureMdWH$, filterMdWH$, plotMdWH$, headTableMdWH$, tailTableMdWH$)
    .map(([WFTitle, url, treatmentQuery, samples, signature, filter, plot, head, tail]) => 
      [
        WFTitle,
        url,
        treatmentQuery,
        samples,
        signature,
        filter,
        plot,
        head,
        tail
      ].join("\n")
    )

  const DiseaseMd$ = xs.combine(WFTitleMd$, urlMdWH$, signatureQueryMdWH$, filterMdWH$, plotMdWH$, headTableMdWH$, tailTableMdWH$)
    .map(([WFTitle, url, signatureQuery, filter, plot, head, tail]) => 
      [
        WFTitle,
        url,
        signatureQuery,
        filter,
        plot,
        head,
        tail
      ].join("\n")
    )

  const CorrelationMd$ = xs.combine(WFTitleMd$, urlMdWH$, signatureQuery1MdWH$, signatureQuery2MdWH$, filterMdWH$, plotMdWH$)
    .map(([WFTitle, url, signatureQuery1, signatureQuery2, filter, plot, head, tail]) => 
      [
        WFTitle,
        url,
        signatureQuery1,
        signatureQuery2,
        filter,
        plot,
      ].join("\n")
    )

  const MdSelector = {
    "": genericMd$, // generic treatment
    "DISEASE": DiseaseMd$,
    "CORRELATION": CorrelationMd$,
  }

  const selectedMd$ = MdSelector[toUpper(config.workflowName)] ?? MdSelector[""]

  const urlFile$ = url$.map(url => "data:text/plain;charset=utf-8," + url)
  const signatureFile$ = signature$.map(signature => "data:text/plain;charset=utf-8," + signature)
  const headTableCsvFile$ = headTableCsv$.map(headTableCsv => "data:text/tsv;charset=utf-8," + encodeURIComponent(headTableCsv))
  const tailTableCsvFile$ = tailTableCsv$.map(tailTableCsv => "data:text/tsv;charset=utf-8," + encodeURIComponent(tailTableCsv))
  const mdReportFile$ = selectedMd$.map(md => "data:text/plain;charset=utf-8," + md)

  const clipboardLinkFab$ = actions.exportLinkTriggerFab$
    .compose(sampleCombine(url$))
    .map(([_, url]) => ({
      sender: "url-fab",
      data: url,
    }))
    .remember()

  const clipboardSignatureFab$ = actions.exportSignatureTriggerFab$
    .compose(sampleCombine(signature$))
    .map(([_, signature]) => ({
      sender: "signature-fab",
      data: signature,
    }))
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
        sender: "plot",
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

  const clipboardMdReport$ = actions.exportMdReportTrigger$
    .compose(sampleCombine(selectedMd$))
    .map(([_, md]) => ({
      sender: "mdReport",
      data: md,
    }))
    .remember()

  const testAction$ = actions.testTrigger$
    .compose(sampleCombine(selectedMd$))
    .map(([_, md]) => {
     
      return {
        sender: 'test-fab',
        data: md,
      }
    })
    .remember()

  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
    clipboard$: xs.merge(
      clipboardLinkFab$,
      clipboardSignatureFab$,
      clipboardLink$,
      clipboardSignature$,
      clipboardPlots$,
      clipboardHeadTable$,
      clipboardTailTable$,
      clipboardMdReport$,
      testAction$,
    ),
    dataPresent: {
      signaturePresent$: signaturePresent$,
      plotsPresent$: plotsPresent$,
      headTablePresent$: headTablePresent$,
      tailTablePresent$: tailTablePresent$,
      mdReportPresent$: mdReportPresent$,
    },
    exportData: {
      url$: url$,
      urlFile$: urlFile$,
      signatureFile$: signatureFile$,
      plotFile$: plotFile$,
      headTableCsvFile$: headTableCsvFile$,
      tailTableCsvFile$: tailTableCsvFile$,
      mdReportFile$: mdReportFile$,
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

    const clipboardResultAutoClear$ = xs
      .merge(
        clipboard.results$,
        clipboard.results$.compose(debounce(2000)).mapTo({})
      )
      .startWith({})

    const fab$ = xs
    .combine(
      dataPresent.signaturePresent$,
      clipboardResultAutoClear$,
    )
    .map(([signaturePresent, clipboardResult]) => {
      
      const clipboardUrlBtnResult = "url-fab" != clipboardResult?.sender 
      ? ""
      : clipboardResult.state == "success" ? " .success" : " .failure"

      const clipboardSigBtnResult = "signature-fab" != clipboardResult?.sender 
      ? ""
      : clipboardResult.state == "success" ? " .success" : " .failure"


      const extraSigClass = config.fabSignature != "update"
        ? config.fabSignature
        : signaturePresent ? "" : " .disabled"

      return div(".fixed-action-btn", [
          span(".btn-floating .btn-large", i(".large .material-icons", "share")),
          ul([
              li(span(".btn-floating .export-clipboard-link-fab .waves-effect.waves-light",span(".fab-wrap" + clipboardUrlBtnResult, i(".material-icons", "link")))),
              li(span(".btn-floating .export-clipboard-signature-fab .waves-effect.waves-light" + extraSigClass, span(".fab-wrap" + clipboardSigBtnResult, i(".material-icons", "content_copy")))),
              // li(span(".btn-floating .export-file-report", i(".material-icons", "picture_as_pdf"))),
              li(span(".btn-floating .modal-open-btn .waves-effect.waves-light", span(".test3", i(".material-icons", "open_with")))),
              // li(span(".btn-floating .test-btn", i(".material-icons", "star"))),
          ])
      ])})


    const modal$ = xs
      .combine(
        dataPresent.signaturePresent$,
        dataPresent.plotsPresent$,
        dataPresent.headTablePresent$,
        dataPresent.tailTablePresent$,
        dataPresent.mdReportPresent$,
        exportData.url$,
        exportData.urlFile$,
        exportData.signatureFile$,
        exportData.plotFile$,
        exportData.headTableCsvFile$,
        exportData.tailTableCsvFile$,
        exportData.mdReportFile$,
        clipboard.copyImagesPermission$,
        clipboardResultAutoClear$,
      )
      .map(([
        signaturePresent,
        plotsPresent,
        headTablePresent,
        tailTablePresent,
        mdReportPresent,
        url,
        urlFile,
        signatureFile,
        plotFile,
        headTableCsvFile,
        tailTableCsvFile,
        mdReportFile,
        clipboardPermissions,
        clipboardResult,
      ]) => {

        const copyImagesPermission = clipboardPermissions.state == "granted"

        const addExportDiv = (identifier, text, clipboardId, fileData, fileName, available, clipboardAllowed=true, downloadAllowed=true) => {
          const availableClipboardText = available && clipboardAllowed ? "" : " .disabled"
          const availableDownloadText = available && downloadAllowed ? "" : " .disabled"

          const clipboardBtnResult = identifier != clipboardResult?.sender 
            ? ""
            : clipboardResult.state == "success" ? " .success" : " .failure"

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
            span(".btn .col .s1 .offset-s1 .waves-effect .waves-light " + clipboardId + " " + availableClipboardText + clipboardBtnResult, i(".material-icons", "content_copy")),
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
                //p(".col .s12", "" + clipboardResult.text),
              ]),
              addExportDiv("url", "Create link to this page's state", ".export-clipboard-link", urlFile, "url.txt", true),
              addExportDiv("signature", "Copy signature", ".export-clipboard-signature", signatureFile, "signature.txt", signaturePresent),
              addExportDiv("plot", "Copy " + config.plotName + " plot", ".export-clipboard-plots", plotFile, "plot.png", plotsPresent, copyImagesPermission),
              addExportDiv("headTable", "Copy top table", ".export-clipboard-headTable", headTableCsvFile, "table.tsv", headTablePresent),
              addExportDiv("tailTable", "Copy bottom table", ".export-clipboard-tailTable", tailTableCsvFile, "table.tsv", tailTablePresent),
              addExportDiv("mdReport", "Copy MarkDown report", ".export-clipboard-mdReport", mdReportFile, "report.md", mdReportPresent),
              // div(".row", [
              //   span(".col .s6 .push-s1", "Export report"),
              //   span(".btn .col .s1 .offset-s3 .export-file-report .disabled", i(".material-icons", "file_download")),
              // ]),
            ]),
            div(".modal-footer", [
              button(".export-close .col .s8 .push-s2 .btn", "Close"),
              //div(".col .s12 .blue.lighten-3", {style: {wordWrap: "break-word"}}, url),
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
    workflowName: "", // Both the name to add in the MarkDown report and select how the content in combined
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
    .compose(delay(50)) // let the vdom propagate first and next cycle initialize FAB

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
    .compose(delay(50)) // let the vdom propagate first and next cycle update FAB

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
