import { initSettings } from './configuration.js'

const modelTranslations = initSettings.common.modelTranslations

const uiToModel = str => modelTranslations
  .filter(tr => tr.ui == str)
  .map(tr => tr.model)[0]

const modelToUI = str => modelTranslations
  .filter(tr => tr.model == str)
  .map(tr => tr.ui)[0]

export const safeUiToModel = str => {
  const res = uiToModel(str)
  if (res != undefined) return res
  else return "Missing translation (" + str + ")"
}

export const safeModelToUi = str => {
  const res = modelToUI(str)
  if (res != undefined) return res
  else return "Missing translation (" + str + ")"
}

