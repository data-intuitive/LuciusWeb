# LuciusWeb aka ComPass

## Introduction

[LuciusWeb](https://github.com/data-intuitive/LuciusWeb) is the web component of an [L1000 data](http://genometry.com/) querying application where the data processing itself is done using Spark.

The application (together with its related components, see below) is currently deployed at [Janssen](http://www.janssen.com/belgium/) under the name ComPass. At Janssen, it is used to analyse and explore close to half a million L1000 samples in real-time thanks to the scalable data processing backend. Scalability has been a core feature of the design from the start and allows us to scale up further if need be.

## Implementation

The app uses [cycle.js](https://cycle.js.org/) as a reactive Javascript library. The following packages are instrumental:

- [Vega](https://vega.github.io/vega/) for the visualization components.
- [cycle-onionifiy](https://github.com/staltz/cycle-onionify) for state management
- [cycle-storagify](https://github.com/staltz/cycle-storageify) for storing settings
- [Materialize-CSS](http://materializecss.com/) for styling and layout

## Screenshots

The home screen shows an interactive SVG with the 3 workflows the user can start.

![](images/home.png)

### Compound Workflow

![](images/compoundWorkflow.png)

### Disease Workflow

![](images/diseaseWorkflow.png)

### Target Workflow

![](images/targetWorkflow.png)

## Use

The [LuciusAPI](https://github.com/data-intuitive/LuciusAPI) REST backend is required for running this webapp.

Getting the necessary dependencies:

```
npm install
```

Starting the app in development mode:

```
npm run serve
```

## User Features

### Filters

Three filters are currently available:

- _Concentration_ or dose
- _Compound type_: positive control or test
- "Protocol" or the cell type the sample was from

Keep in mind that the design allows for including filters in a very flexible way, so this is by no means a strict limitation.

The filter dialogs allow the user to specify which filter value _to include_, by (de) selecting them one by one. It's possible to invert the selection by clicking while keeping the `a` key pressed.

### Interactive Tables

The UI for the tables has has been kept as clean as possible. There is a drawer for every table that appears when clicking the table header:

![](images/table.png)

In order of appearance, this allows one to:

- Export the data in the table to tab-separated format (to be imported in Excel or …)
- Export the data in JSON format
- Subtract 10 rows
- Subtract 5 rows
- Add 5 rows
- Add 10 rows

Clicking the option drawer again closes it.

### Blurring

In the settings, there is now an on/off switch to enable blurring of sensitive data.

![](images/blurring.png)

The amount of blur can be tuned as well, although I expect the default of 5 to be fine.

### Configuration and Customization

Configuration is performed using two files that each serve their own purpose:

- `deployments.js` contains entries for different deployments of the application. A deployment contains information such as: endpoint URIs, ports, model translations and various customizations.

- `configuration.js` contains the user-specific settings with respect to tables, histograms, colors, etc. It also contains a reference to a _deployment_.

The user settings (i.e. all of the above) are cached on disk. Only when the version number in `configuration.js` is updated are these settings overridden with the new ones from that file.

### Ghost mode

In settings, there is one option that requires mentioning: Ghost mode.

![](images/ghost.png)

Switch it on and switch to a workflow. A pre-defined scenario will run for all 3 workflows with popup comments explaining the steps performed.

## Admin Features

### Splitting User and Admin Settings

User and Admin settings are split. One can go to the admin settings via the bottom of the User settings (or by adding `/admin` to the url of the application).

### Deployments

The file `deployments.json` contains different scenarios in which the application can be used. This makes it easy to quickly switch between a local instance of the application stack or a hosted one. The `deployments.json` file currently is included in the webpack `bundle.js` file, so it needs to be edited before actually calling `npm run build`.

Please note that the _default_ value for the deployment is still in `src/js/configuration.js`.
