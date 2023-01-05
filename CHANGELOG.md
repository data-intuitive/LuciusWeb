# CHANGELOG

## Version 5.4.3

### Other

- Set the contentSecurityPolicy option in helmet to improve cross-site scripting security

### Deployment changes

- `serverConfiguration.js` should contain valid information matching the deployment infrastructure

## Version 5.4.2

## Minor changes

- On index/landing page, the server responsiveness is checked by retrieving the filters instead of the statistics.
  The filters API endpoint is fully cached while the statistics are only semi-cached.
  This also removes the spark jobserver call and calculations on the average job duration.

## Version 5.4.1

### Bug fixes

- Fix an issue where data refresh causes the top table expansion functionality locking up caused by added listeners and streams getting interrupted
- Fix issue when a sample selection filter is removed triggering an update on unavailable data
- Hide outdated sample selection data when retrieving new data due a new selected perturbation

### Minor changes

- Update npm packages and create package-loc.json from scratch, solving many remaining open audit hits
- Update Ramda to 0.28.0, fix `merge` being removed in favour of `mergeRight` and `contains` in favour of `includes`

## Version 5.4.0

### Functionality

- Display a Sample Information Details section in top tables
- Change filter and sample information details to be collapsable (collapsed by default)

### Minor changes

- Fix table sample info display of dose & time so the text is properly truncated if the value string is long
- Hide table sample info fields if the API call returned either empty or "Feature not found"
- Display single cell information in sample selection and table sample info
- Solve the 3 invalid font warnings on the console
- Display perturbation information details under the expanded table sample info by clicking the 'i' icon

### Other

- Updated required node version in Dockerfile
- Updated some pinned package versions
- Use the helmet package to set/tweak server html headers
- Restructured the folder structure slightly to introduce a `public` folder
  This prevents exposing server configuration files
- `dist/bundle.js` now compiles towards the public folder too

### Deployment changes

- `deployments.json` should now be placed in the `public` folder instead of the project root

## Version 5.3.0

### Functionality

- Add filters to the sample selection component

## Version 5.2.0

### Functionality

- Add exporting of report in Markdown format
- Add browser access to restarting the API
- Display tooltip for clipboard and download buttons in export menu

### Other

- Filter functionality made dynamic so that new filter groups can be added as needed
- Improve sturdiness against invalid input
- Filter a-link references on 'do-not-route' before sending to the router

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
- Moved scss files from `src/js` to `src/sass`, so any alternative versions of e.g. `_variables.scss` or `_main.custom.scss` should now be placed in the new folder

## Version 5.0.2

- Fix mistake in sample selection column truncation code

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

