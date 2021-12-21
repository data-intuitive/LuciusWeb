import { treatmentLikeFilter } from "../components/TreatmentForm"
import GenericTreatmentWorkflow from "./genericTreatment"

export default function LigandWorkflow(sources) {

  const enhancedSources = {
    ...sources,
    workflow: {
          treatmentType: treatmentLikeFilter.LIGAND,
          welcomeText: "Welcome to Ligand Workflow",
          mainDivClass: ".row .ligand",
          loggerName: "ligand",
          ghostModeScenarioSelector: ((state) => state.settings.common.ghost.ligand),
        },
  }

  return GenericTreatmentWorkflow(enhancedSources)
}
