# CHANGELOG

## Version 5.2.0

### Functionality

- Add browser access to restarting the API

### Other

- Filter functionality made dynamic so that new filter groups can be added as needed
- Improve sturdiness against invalid input

### Deployment changes

- Requires extra translations for each filter type in `deployments.json`

## Version 5.1.0

### Functionality

- URL Queries: ComPass accepts URL queries and runs the complete analysis automatically. For instance, the following URI:

  ```
  http://localhost:3000/disease?autorun&signature=HSPA1A+DNAJB1+DDIT4+-TSEN2&numTableHead=10
  ```

  will run the Disease workflow using the signature `HSPA1A DNAJB1 DDIT4` and will show 10 entries for the top table.

- Export: Add buttons to export data and plots to a file or copy it to the clipboard. A popup window is available with all the possible export features on the right bottom of the screen.

- Correlation workflow has filters.

- Sample tables can be sorted by clicking the columns header

### Other

- Ghost mode has been improved, it no longer requires explicit timings in the scenarios

## Version 5.0.1

- The head and tail tables use pictures to display the treatment type
- Adapt the behaviour for the autocomplete when there is only one option to choose from and if the entered value matches the single autocomplete value

## Version 5.0.0

### Functionality

- A new 'Genetic' workflow is created useful for searching for genetic perturbations.
- Inverting the filter selection can be done using the `ALT` (Option on Mac) modifier key instead of the `a` key
- Filter values are populated dynamically based on the data available through the API

### Other

- The dependency stack has been cleaned and (partly) updated
- Cycle dependencies have been updated to the latest versions except for `@cycle/state`.

