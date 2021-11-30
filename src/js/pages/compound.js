import { treatmentLikeFilter } from "../components/TreatmentForm"
import GenericTreatmentWorkflow from "./genericTreatment"

export default function CompoundWorkflow(sources) {

  const enhancedSources = {
    ...sources,
    workflow: {
          treatmentType: treatmentLikeFilter.COMPOUND,
          welcomeText: "Welcome to Compound Workflow",
          mainDivClass: ".row .compound",
          loggerName: "compound",
        },
  }

  return GenericTreatmentWorkflow(enhancedSources)
}