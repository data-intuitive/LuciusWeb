import { treatmentLikeFilter } from "../components/TreatmentForm"
import GenericTreatmentWorkflow from "./genericTreatment"

export default function GeneticWorkflow(sources) {

  const enhancedSources = {
    ...sources,
    workflow: {
          treatmentType: treatmentLikeFilter.GENETIC,
          welcomeText: "Welcome to Genetic Workflow",
          mainDivClass: ".row .genetic",
          loggerName: "generic",
        },
  }

  return GenericTreatmentWorkflow(enhancedSources)
}
