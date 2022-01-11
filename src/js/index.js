import xs from "xstream"
import delay from "xstream/extra/delay"
import dropRepeats from "xstream/extra/dropRepeats"

import {
  div,
  nav,
  a,
  h3,
  p,
  ul,
  li,
  h1,
  h2,
  i,
  footer,
  header,
  main,
  svg,
  g,
  path,
  span,
  img,
} from "@cycle/dom"
import { merge, prop, mergeDeepLeft, mergeDeepRight } from "ramda"
import * as R from "ramda"

// Workflows
import DiseaseWorkflow from "./pages/disease"
import CompoundWorkflow from "./pages/compound"
import LigandWorkflow from "./pages/ligand"
import GeneticWorkflow from "./pages/genetic"
import GenericTreatmentWorkflow from "./pages/genericTreatment"
import TargetWorkflow from "./pages/target"
import CorrelationWorkflow from "./pages/correlation"

// Pages
import StatisticsWorkflow from "./pages/statistics"
import Debug from "./pages/debug"
import Home from "./pages/home"
import { IsolatedSettings } from "./pages/settings"
import { IsolatedAdminSettings } from "./pages/adminSettings"

// Utilities
import { initSettings } from "./configuration.js"
import initDeployments from "../../deployments.json"
import { loggerFactory } from "./utils/logger"

import {
  compoundSVG,
  targetSVG,
  ligandSVG,
  diseaseSVG,
  correlationSVG,
  settingsSVG,
} from "./svg"

export default function Index(sources) {
  const { router } = sources

  const logger = loggerFactory(
    "index",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$.debug("state")

  const page$ = router.routedComponent({
    "/": Home,
    "/disease": DiseaseWorkflow,
    // '/disease': {
    //   '/': DiseaseWorkflow,
    //   // '/:id': id => sources => DiseaseWorkflow({props$: id, ...sources})
    // },
    "/compound": CompoundWorkflow,
    "/target": TargetWorkflow,
    "/genetic": GeneticWorkflow,
    "/ligand": LigandWorkflow,
    "/generic": GenericTreatmentWorkflow,
    "/statistics": StatisticsWorkflow,
    "/settings": IsolatedSettings,
    "/correlation": CorrelationWorkflow,
    "/debug": Debug,
    "/admin": IsolatedAdminSettings,
    "*": Home,
  })(sources)

  // TODO: Add a visual reference for ghost mode
  // const ghost$ = state$
  //     .filter(state => state.common.ghost)
  //     .compose(dropRepeats(equals))
  //     .mapTo(i('.small .material-icons', 'flight_takeoff'))
  //     .startWith(span())

  const nav$ = state$.map((state) => {
    const makeLink = (path, label, options) => {
      const highlight = state.routerInformation.pathname === path

      return li(highlight ? ".active" : "", [
        a(options, { props: { href: path } }, label),
      ])
    }

    const leftLogo = state.settings.config.logoUrl
      ? a(
          ".left .grey-text .hide-on-med-and-down",
          { props: { href: "/" }, style: { margin: "5px" } },
          img(".logo_img .left", {
            props: { alt: "logo", src: state.settings.config.logoUrl },
            style: { height: "40px" },
          })
        )
      : span()

    const centerLogo = state.settings.config.logoUrl
      ? div(".brand-logo .center", [
          a(
            ".grey-text .hide-on-large-only",
            { props: { href: "/" } },
            img(".logo_img", {
              props: { alt: "logo", src: state.settings.config.logoUrl },
              style: { height: "40px" },
            })
          ),
        ])
      : div()

    return header({ style: { display: "flex" } }, [
      nav("#navigation", [
        div(".nav-wrapper .valign-wrapper", [
          a(
            ".sidenav-trigger",
            { props: { href: "#" }, attrs: { "data-target": "mobile-demo" } },
            i(".material-icons", "menu")
          ),
          a(
            ".brand-logo .right .grey-text",
            { props: { href: "/" } },
            div({ style: { width: "140px" } }, logoSVG)
            // span('.gradient', 'ComPass')
          ),
          leftLogo,
          a(
            ".extraTitle",
            { props: { href: "/" }, style: { margin: "5px" } },
            ""
          ),
          ul(".left .hide-on-med-and-down", [
            makeLink(
              "/compound",
              div([span(["Compound", " "]), compoundSVG]),
              ".compound"
            ),
            // makeLink('/target', span(['Target', ' ', targetSVG]), '.red-text'),
            makeLink(
              "/genetic",
              div([span(["Genetic", " "]), targetSVG]),
              ".genetic"
            ),
            makeLink(
              "/ligand",
              div([span(["Ligand", " "]), ligandSVG]),
              ".ligand"
            ),
            makeLink(
              "/disease",
              div([span(["Disease", " "]), diseaseSVG]),
              ".disease"
            ),
            makeLink(
              "/correlation",
              div([span(["Correlation", " "]), correlationSVG]),
              ".correlation"
            ),
            makeLink(
              "/settings",
              div([span(["Settings", " "]), settingsSVG]),
              ".settings"
            ),
            // makeLink('/admin', span(['Admin']), '.blue-text'),
            li(div(span(".version", "", ["v", VERSION]))),
          ]),
          centerLogo,
        ]),
      ]),
      ul(".sidenav", { props: { id: "mobile-demo" } }, [
        makeLink(
          "/compound",
          div([span(["Compound", " "]), compoundSVG]),
          ".compound"
        ),
        // makeLink('/target', span(['Target', ' ', targetSVG]), '.target'),
        makeLink(
          "/genetic",
          div([span(["Genetic", " "]), targetSVG]),
          ".genetic"
        ),
        makeLink(
          "/ligand",
          div([span(["Ligand", " "]), ligandSVG]),
          ".ligand"
        ),
        makeLink(
          "/disease",
          div([span(["Disease", " "]), diseaseSVG]),
          ".disease"
        ),
        makeLink(
          "/correlation",
          div([span(["Correlation", " "]), correlationSVG]),
          ".correlation"
        ),
        makeLink(
          "/settings",
          div([span(["Settings", " "]), settingsSVG]),
          ".settings"
        ),
        // makeLink('/admin', span(['Admin']), '.blue-text'),
        li(
          div(
            span(".version", { style: { padding: "0 32px" } }, ["v", VERSION])
          )
        ),
      ]),
    ])
  })

  const sidenavTrigger$ = sources.DOM.select(".sidenav-trigger").events("click")
  const sidenavEvent$ = sidenavTrigger$.map((trigger) => ({
    element: ".sidenav",
    state: "open",
  }))

  // We combine with state in order to read the customizations
  // This works because the defaultReducer runs before anything else
  const footer$ = state$.map((state) =>
    footer(".page-footer", [
      div(".valign-wrapper .row", { style: { margin: "0px" } }, [
        div(".col .s8", { style: { margin: "0px" } }, [
          p({ style: { margin: "0px" } }, [
            "Please use ",
            a({ props: { href: "/statistics" } }, "the information"),
            " provided in ComPass with care. ",
            "Work instructions can be found via this link: ",
            a(
              { props: { href: state.settings.deployment.customizations.wi } },
              "Work Instructions."
            ),
          ]),
          p({ style: { margin: "0px" } }, [
            "ComPass does not make any claims. ",
            "In case of issues, please include the contents of ",
            a({ props: { href: "/debug" } }, "this page"),
            " in your bug report",
          ]),
        ]),
        div(
          ".col .s4 .right-align",
          { style: { height: "100%", alignSelf: "flex-end" } },
          [
            p({ style: { margin: "0px" } }, [
              "Open-source code can be found on ",
              a(
                {
                  props: {
                    href: "https://github.com/data-intuitive/LuciusWeb",
                  },
                },
                "GitHub"
              ),
            ]),
          ]
        ),
      ]),
    ])
  )

  const view$ = page$.map(prop("DOM")).flatten().remember()

  const pageName$ = state$.map((state) => {
      const pageName = state.routerInformation.pathname.substr(1)
      if (pageName == "")
        return ".homePage"
      else
        return "." + pageName + "Page"
    })
    .compose(dropRepeats())

  const vdom$ = xs
    .combine(pageName$, nav$, view$, footer$)
    .map(([pageName, navDom, viewDom, footerDom]) =>
      div(
        pageName,
        {
          style: {
            display: "flex",
            "min-height": "100vh",
            "flex-direction": "column",
            height: "100%",
          },
        },
        [navDom, main([viewDom]), footerDom]
      )
    )
    .remember()

  // Initialize state
  // Storageify ensures the state of the application is constantly cached.
  // We only use the settings part of the stored state.
  // Please note: with the addition of 'deployments', the requested deployment is added to the settings
  // Overwrite recursively with the values from `deployments.json` using Ramda's `mergeDeepRight`
  // The wanted deployment is contained in initSettings.deployment already without further details
  // When it comes to component isolation, having the admin and user configuration together under the
  // related key in settings makes sense. So we add the respective entries from deployment to where they should appear
  const defaultReducer$ = xs.of((prevState) => {
    // Which deployment to use?
    const desiredDeploymentName = initSettings.deployment.name
    // Fetch the deployment
    const desiredDeployment = R.head(
      initDeployments.filter((x) => x.name == desiredDeploymentName)
    )
    // Merge the deployment in settings.deployment
    const updatedDeployment = mergeDeepRight(
      initSettings.deployment,
      desiredDeployment
    )
    // Merge the updated deployment with the settings, by key.
    const updatedSettings = merge(initSettings, {
      deployment: updatedDeployment,
    })
    // Do the same with the administrative settings
    const distributedAdminSettings = mergeDeepRight(
      updatedSettings,
      updatedSettings.deployment.services
    )

    /**
     * Recursively check if all members of obj are present in value
     * Does not check for equalitiy, just the value being present
     * Completely ignores the required functionality for arrays
     */
    const allPresent = (obj, value) => {
      const keys = Object.keys(obj)
      const valueKeys = Object.keys(value)

      const present = keys.map((key) => {
        if (!R.contains(key, valueKeys)) return false
        if (typeof obj[key] === "object")
          return allPresent(obj[key], value[key])
        return true
      })

      // return/check if all booleans in the array are true
      return R.all(R.identity)(present)
    }

    if (typeof prevState === "undefined") {
      // No pre-existing state information, use default settings
      console.log("prevState = undefined")
      return {
        settings: distributedAdminSettings,
      }
    } else {
      // Pre-existing state information.
      // Safety check on old information
      const sameVersionInSettings =
        prevState.settings.version == initSettings.version
      const allPresentInSettings = allPresent(initSettings, prevState?.settings)

      if (!sameVersionInSettings)
        console.log(
          "Stored settings version doesn't match application settings version. Resetting settings to default values."
        )
      if (!allPresentInSettings)
        console.log(
          "Stored settings don't match application settings structure. Resetting settings to default values."
        )
      // If stored settings are different version or are invalid, use default settings.
      return sameVersionInSettings && allPresentInSettings
        ? { settings: prevState.settings }
        : { settings: distributedAdminSettings }
    }
  })

  const deploymentsReducer$ = sources.deployments.map(
    (deployments) => (prevState) => {
      // Which deployment to use?
      const desiredDeploymentName = prevState.settings.deployment.name
      // Fetch the deployment
      const desiredDeployment = R.head(
        deployments.filter((x) => x.name == desiredDeploymentName)
      )
      // Merge the deployment in settings.deployment
      const updatedDeployment = mergeDeepRight(
        prevState.settings.deployment,
        desiredDeployment
      )
      // Merge the updated deployment with the settings, by key.
      const updatedSettings = merge(prevState.settings, {
        deployment: updatedDeployment,
      })
      // Do the same with the administrative settings, keep value in settings if exist - only add from deployments if value is missing
      // Take into account the strategy for dealing with deployments configuration
      const distributedAdminSettings =
        prevState.settings.strategy.deployments == "theirs"
          ? mergeDeepRight(updatedSettings, updatedSettings.deployment.services)
          : mergeDeepLeft(updatedSettings, updatedSettings.deployment.services)
      return { ...prevState, settings: distributedAdminSettings }
    }
  )

  const routerReducer$ = router.history$.map((router) => (prevState) => {
    return {
      ...prevState,
      routerInformation: router,
    }
  })

  // Capture link targets and send to router driver
  const router$ = sources.DOM.select("a")
    .events("click")
    .map((ev) => ev.target.pathname)
    .remember()

  // All clicks on links should be sent to the preventDefault driver
  const prevent$ = sources.DOM.select("a")
    .events("click")
    .filter((ev) => ev.target.pathname == "/debug")

  const history$ = sources.onion.state$.fold((acc, x) => acc.concat([x]), [{}])

  return {
    log: xs.merge(
      // logger(page$, 'page$', '>> ', ' > ', ''),
      logger(state$, "state$"),
      logger(history$, "history$"),
      logger(router.history$, "router_history$"),
      // logger(prevent$, 'prevent$'),
      page$.map(prop("log")).filter(Boolean).flatten()
    ),
    onion: xs.merge(
      defaultReducer$.debug("defaultReducer"),
      deploymentsReducer$.debug("deplRed"),
      routerReducer$,
      page$.map(prop("onion")).filter(Boolean).flatten()
    ),
    DOM: vdom$,
    router: xs
      .merge(router$, page$.map(prop("router")).filter(Boolean).flatten())
      .remember(),
    HTTP: page$.map(prop("HTTP")).filter(Boolean).flatten(),
    vega: page$.map(prop("vega")).filter(Boolean).flatten(),
    alert: page$.map(prop("alert")).filter(Boolean).flatten(),
    preventDefault: xs.merge(
      prevent$,
      page$.map(prop("preventDefault")).filter(Boolean).flatten()
    ),
    popup: page$.map(prop("popup")).filter(Boolean).flatten(),
    modal: page$.map(prop("modal")).filter(Boolean).flatten(),
    ac: page$.map(prop("ac")).filter(Boolean).flatten(),
    sidenav: sidenavEvent$,
    storage: page$.map(prop("storage")).filter(Boolean).flatten(),
    deployments: page$
      .map(prop("deployments"))
      .filter(Boolean)
      .flatten()
      .debug("deployments"),
  }
}

export const logoSVG = svg(
  { id: "logo", attrs: { viewBox: "159 26 1060 460" } },
  [
    svg.defs([
      svg.linearGradient(
        {
          attrs: {
            id: "gradient",
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "100%",
            gradientUnits: "userSpaceOnUse",
          },
        },
        [
          svg.stop({
            attrs: { offset: "0%" },
            style: { "stop-color": "#ff9800", "stop-opacity": "1" },
          }),
          svg.stop({
            attrs: { offset: "50%" },
            style: { "stop-color": "#f44336", "stop-opacity": "1" },
          }),
          svg.stop({
            attrs: { offset: "100%" },
            style: { "stop-color": "#e91e63", "stop-opacity": "1" },
          }),
        ]
      ),
    ]),
    svg.g({ attrs: { fill: "url(#gradient)" } }, [
      svg.path({ attrs: { d: "M 389 256 L 389 26 L 342 201 Z" } }),
      svg.path({ attrs: { d: "M 389 256 L 159 256 L 334 303 Z" } }),
      svg.path({ attrs: { d: "M 389 256 L 389 486 L 436 311 Z" } }),
      svg.path({ attrs: { d: "M 389 256 L 619 256 L 444 209 Z" } }),
      //svg.text({ attrs: { 'font-family': 'Garamond, serif', 'font-size': "160", 'font-weight': "bold", x: "450", y: "398" } }, 'COMPASS'),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 42.517 108.894 A 73.307 73.307 0 0 0 60.16 110.965 A 111.506 111.506 0 0 0 67.956 110.701 A 87.869 87.869 0 0 0 78.4 109.365 A 102.036 102.036 0 0 0 79.766 109.093 Q 87.225 107.553 92.8 105.205 A 11.877 11.877 0 0 0 94.135 104.431 A 8.802 8.802 0 0 0 95.44 103.365 A 5.185 5.185 0 0 0 95.872 102.873 Q 96.619 101.909 97.12 100.405 Q 98.24 96.885 99.04 93.525 A 74.101 74.101 0 0 0 99.604 90.961 A 59.633 59.633 0 0 0 100.24 87.205 A 55.183 55.183 0 0 0 100.451 85.441 Q 100.64 83.595 100.64 82.165 A 5.632 5.632 0 0 0 100.64 82.147 Q 100.634 80.24 99.332 79.674 A 3.055 3.055 0 0 0 98.32 79.445 Q 96.55 79.323 95.385 80.972 A 6.972 6.972 0 0 0 94.72 82.165 A 56.752 56.752 0 0 1 93.8 84.01 Q 91.762 87.912 89.352 90.983 A 31.476 31.476 0 0 1 82.4 97.605 Q 77.685 100.834 71.132 101.994 A 45.53 45.53 0 0 1 63.2 102.645 Q 54.08 102.645 47.36 98.965 Q 40.64 95.285 36 88.725 Q 31.36 82.165 29.12 73.125 A 72.598 72.598 0 0 1 27.744 66.056 A 87.496 87.496 0 0 1 26.88 53.525 Q 26.88 45.205 29.44 37.525 Q 32 29.845 36.72 23.765 Q 41.44 17.685 48.08 14.165 A 29.342 29.342 0 0 1 53.049 12.09 A 32.658 32.658 0 0 1 62.88 10.645 A 58.028 58.028 0 0 1 64.994 10.683 Q 71.646 10.926 76.56 12.725 A 36.033 36.033 0 0 1 78.031 13.3 Q 82.667 15.232 85.44 18.005 Q 88.48 20.725 90 24.405 Q 91.52 28.085 92.64 31.765 A 6.448 6.448 0 0 0 92.647 31.785 Q 92.855 32.403 93.155 32.879 A 3.239 3.239 0 0 0 94.8 34.245 Q 95.51 34.507 96.167 34.507 A 3.165 3.165 0 0 0 97.6 34.165 A 2.181 2.181 0 0 0 98.779 32.667 A 3.73 3.73 0 0 0 98.88 31.765 Q 98.88 29.734 98.798 27.455 A 165.242 165.242 0 0 0 98.56 22.805 Q 98.24 17.845 97.6 12.565 Q 97.528 11.695 97.275 11.006 A 3.802 3.802 0 0 0 96.4 9.605 A 7.672 7.672 0 0 0 95.926 9.169 A 8.327 8.327 0 0 0 93.92 7.925 Q 89.92 6.485 85.04 5.205 Q 80.16 3.925 74.96 3.205 Q 69.76 2.485 64.64 2.485 Q 49.6 2.485 37.68 7.045 A 73.108 73.108 0 0 0 32.282 9.359 A 60.996 60.996 0 0 0 17.28 19.365 Q 8.8 27.125 4.4 37.125 Q 0 47.125 0 58.165 A 57.845 57.845 0 0 0 0.137 62.174 A 48.394 48.394 0 0 0 4.64 79.765 Q 9.28 89.525 17.6 96.485 Q 25.92 103.445 36.8 107.205 A 65.874 65.874 0 0 0 42.517 108.894 Z",
          id: "0",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 168.8 110.965 Q 157.76 110.965 147.76 107.205 Q 137.76 103.445 130 96.485 Q 122.24 89.525 117.84 79.845 A 49.402 49.402 0 0 1 113.682 63.757 A 59.923 59.923 0 0 1 113.44 58.325 Q 113.44 47.445 117.04 37.445 Q 120.64 27.445 127.84 19.605 A 50.961 50.961 0 0 1 142.36 8.694 A 60.247 60.247 0 0 1 145.68 7.125 A 54.565 54.565 0 0 1 159.472 3.251 A 72.704 72.704 0 0 1 170.24 2.485 Q 181.44 2.485 191.44 6.245 Q 201.44 10.005 209.12 16.965 Q 216.8 23.925 221.28 33.605 Q 225.76 43.285 225.76 55.125 Q 225.76 65.845 222.08 75.925 Q 218.4 86.005 211.2 93.845 A 50.961 50.961 0 0 1 196.68 104.757 A 60.247 60.247 0 0 1 193.36 106.325 A 54.565 54.565 0 0 1 179.569 110.2 A 72.704 72.704 0 0 1 168.8 110.965 Z M 171.68 103.605 A 26.844 26.844 0 0 0 179.094 102.625 A 21.365 21.365 0 0 0 186.96 98.485 A 27.514 27.514 0 0 0 193.442 90.523 A 37.424 37.424 0 0 0 196.16 84.245 Q 199.2 75.125 199.2 63.285 Q 199.2 53.525 197.36 44.005 Q 195.52 34.485 191.6 26.805 Q 187.68 19.125 181.6 14.565 Q 175.52 10.005 167.2 10.005 A 26.016 26.016 0 0 0 159.655 11.057 A 21.4 21.4 0 0 0 152.08 15.125 A 27.98 27.98 0 0 0 145.339 23.499 A 37.303 37.303 0 0 0 142.88 29.205 Q 139.932 37.894 139.843 49.291 A 91.218 91.218 0 0 0 139.84 50.005 Q 139.84 59.925 141.76 69.445 A 73.734 73.734 0 0 0 144.886 80.561 A 61.444 61.444 0 0 0 147.52 86.645 Q 151.36 94.325 157.36 98.965 A 22.185 22.185 0 0 0 169.511 103.523 A 28.279 28.279 0 0 0 171.68 103.605 Z",
          id: "1",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 280 18.965 L 303.52 75.125 A 1.737 1.737 0 0 0 303.731 75.456 Q 303.908 75.669 304.133 75.769 A 1.008 1.008 0 0 0 304.4 75.845 A 0.705 0.705 0 0 0 304.5 75.853 Q 304.88 75.853 305.14 75.414 A 2.079 2.079 0 0 0 305.28 75.125 L 328.16 22.005 Q 329.162 16.996 329.844 13.651 A 1135.171 1135.171 0 0 1 330 12.885 A 101.259 101.259 0 0 1 330.442 10.826 Q 330.92 8.715 331.36 7.285 A 3.896 3.896 0 0 1 331.783 6.339 Q 332.447 5.294 333.703 5.212 A 3.35 3.35 0 0 1 333.92 5.205 L 340.8 5.205 Q 347.52 4.885 354.8 4.165 Q 360.801 3.572 364.681 3.468 A 58.182 58.182 0 0 1 366.24 3.445 A 7.727 7.727 0 0 1 367.651 3.568 A 5.754 5.754 0 0 1 369.04 4.005 A 2.337 2.337 0 0 1 369.686 4.438 Q 370.18 4.917 370.234 5.659 A 2.568 2.568 0 0 1 370.24 5.845 A 3.116 3.116 0 0 1 370.139 6.667 A 2.064 2.064 0 0 1 369.2 7.925 Q 368.16 8.565 366.56 9.045 Q 365.825 9.29 364.903 9.676 A 38.566 38.566 0 0 0 364.32 9.925 A 60.68 60.68 0 0 0 363.262 10.4 Q 362.781 10.622 362.357 10.829 A 34.278 34.278 0 0 0 362.08 10.965 A 24.408 24.408 0 0 0 359.476 12.352 Q 358.179 13.153 357.193 14.035 A 11.367 11.367 0 0 0 355.92 15.365 Q 353.998 17.749 354.219 22.868 A 26.82 26.82 0 0 0 354.24 23.285 Q 354.56 34.805 355.04 43.445 Q 355.52 52.085 355.92 59.445 Q 356.32 66.805 356.88 74.725 Q 357.265 80.17 357.688 86.863 A 2486.888 2486.888 0 0 1 358.08 93.205 Q 358.4 97.365 361.52 99.845 A 17.172 17.172 0 0 0 364.885 101.907 Q 367.04 102.925 369.76 103.605 Q 371.36 104.085 372.48 104.725 A 2.102 2.102 0 0 1 373.55 106.233 A 3.129 3.129 0 0 1 373.6 106.805 Q 373.6 107.925 372.64 108.565 Q 371.68 109.205 370.24 109.205 A 124.521 124.521 0 0 1 366.961 109.159 Q 365.284 109.115 363.422 109.028 A 214.634 214.634 0 0 1 362.16 108.965 Q 357.6 108.725 353.2 108.565 Q 348.8 108.405 345.6 108.405 Q 342.4 108.405 338.48 108.565 Q 334.56 108.725 330.56 108.965 Q 326.56 109.205 322.88 109.205 A 6.326 6.326 0 0 1 321.48 109.056 A 5.104 5.104 0 0 1 320.32 108.645 A 2.421 2.421 0 0 1 319.742 108.252 A 1.688 1.688 0 0 1 319.2 106.965 A 2.958 2.958 0 0 1 319.371 105.938 A 2.56 2.56 0 0 1 320.32 104.725 Q 321.44 103.925 323.04 103.605 A 33.68 33.68 0 0 0 325.926 102.937 Q 328.739 102.142 330.36 101.01 A 6.886 6.886 0 0 0 331.2 100.325 Q 333.291 98.309 333.291 93.854 A 20.13 20.13 0 0 0 333.28 93.205 Q 332.8 83.285 332.48 73.445 Q 332.16 63.605 331.92 54.085 A 657.231 657.231 0 0 0 331.259 36.728 A 600.597 600.597 0 0 0 331.2 35.605 Q 331.2 34.485 330.64 34.565 A 0.762 0.762 0 0 0 330.265 34.743 Q 329.915 35.03 329.6 35.765 L 299.04 108.405 A 5.387 5.387 0 0 1 298.705 109.169 Q 297.956 110.543 296.715 110.339 A 2.202 2.202 0 0 1 296.64 110.325 A 3.756 3.756 0 0 1 295.619 109.974 A 2.786 2.786 0 0 1 294.4 108.725 Q 286.56 90.165 278 72.085 Q 269.44 54.005 262.24 36.245 A 3.156 3.156 0 0 0 262.06 35.806 Q 261.635 34.977 260.906 35.147 A 1.42 1.42 0 0 0 260.72 35.205 A 1.58 1.58 0 0 0 259.891 35.962 Q 259.736 36.247 259.641 36.626 A 4.851 4.851 0 0 0 259.52 37.365 Q 259.04 45.365 258.72 54.885 Q 258.4 64.405 258.4 74.085 L 258.4 92.085 A 11.336 11.336 0 0 0 258.894 95.507 A 9.135 9.135 0 0 0 261.28 99.365 A 12.265 12.265 0 0 0 263.913 101.274 Q 266.48 102.694 270.339 103.591 A 39.254 39.254 0 0 0 270.4 103.605 Q 272 103.925 273.44 104.645 A 3.112 3.112 0 0 1 274.184 105.151 A 2.171 2.171 0 0 1 274.88 106.805 Q 274.88 107.905 273.646 108.542 A 4.015 4.015 0 0 1 273.6 108.565 Q 272.32 109.205 270.88 109.205 Q 266.56 109.205 264.16 108.965 Q 261.76 108.725 259.84 108.645 Q 258.37 108.584 256.056 108.57 A 241.657 241.657 0 0 0 254.56 108.565 Q 251.04 108.565 247.36 108.725 Q 243.68 108.885 240.96 109.045 Q 238.738 109.176 237.798 109.2 A 14.405 14.405 0 0 1 237.44 109.205 Q 235.52 109.205 234.56 108.645 A 2.008 2.008 0 0 1 233.961 108.128 Q 233.652 107.721 233.608 107.159 A 2.45 2.45 0 0 1 233.6 106.965 A 2.295 2.295 0 0 1 233.708 106.238 Q 233.983 105.413 234.96 105.125 A 41.882 41.882 0 0 0 236.227 104.729 Q 236.874 104.516 237.593 104.261 A 74.939 74.939 0 0 0 238.08 104.085 A 14.817 14.817 0 0 0 243.664 100.558 A 17.927 17.927 0 0 0 244.56 99.605 Q 247.36 96.405 248 91.445 Q 248.66 86.385 249.358 79.699 A 808.068 808.068 0 0 0 250 73.285 Q 251.04 62.485 252.16 50.165 Q 253.28 37.845 254.08 25.845 Q 254.197 25.148 254.228 24.197 A 22.532 22.532 0 0 0 254.24 23.445 L 254.24 20.405 A 15.303 15.303 0 0 0 254.146 18.645 Q 254.044 17.77 253.834 17.044 A 6.444 6.444 0 0 0 253.36 15.845 Q 252.48 14.165 250.4 13.045 Q 248.48 11.765 246.24 10.885 Q 244 10.005 241.44 9.365 A 12.798 12.798 0 0 1 240.164 8.979 Q 239.543 8.753 239.037 8.48 A 5.984 5.984 0 0 1 238.4 8.085 Q 237.28 7.285 237.28 6.005 A 2.466 2.466 0 0 1 237.39 5.244 Q 237.655 4.425 238.56 4.085 A 7.122 7.122 0 0 1 239.913 3.733 Q 240.571 3.625 241.32 3.608 A 12.488 12.488 0 0 1 241.6 3.605 Q 244 3.605 247.52 3.765 Q 251.04 3.925 255.28 4.005 Q 259.52 4.085 263.92 4.245 Q 268.32 4.405 272 4.405 A 3.689 3.689 0 0 1 274.011 5.009 A 4.772 4.772 0 0 1 274.4 5.285 A 4.895 4.895 0 0 1 275.175 6.036 A 3.481 3.481 0 0 1 275.84 7.285 Q 276.96 10.325 277.92 13.125 Q 278.88 15.925 280 18.965 Z",
          id: "2",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 393.92 93.045 L 393.92 21.365 A 24.447 24.447 0 0 0 393.773 18.576 Q 393.438 15.671 392.344 13.937 A 6.247 6.247 0 0 0 392 13.445 A 6.811 6.811 0 0 0 390.327 11.947 Q 388.579 10.8 385.67 10.016 A 31.125 31.125 0 0 0 384.32 9.685 Q 382.496 9.264 381.656 8.536 A 2.551 2.551 0 0 1 381.44 8.325 A 3.112 3.112 0 0 1 380.834 7.37 A 2.829 2.829 0 0 1 380.64 6.325 Q 380.64 5.365 381.6 4.645 Q 382.444 4.013 383.782 3.936 A 6.615 6.615 0 0 1 384.16 3.925 Q 387.84 3.925 391.6 4.085 Q 395.36 4.245 398.96 4.485 A 109.621 109.621 0 0 0 403.304 4.692 A 91.493 91.493 0 0 0 405.76 4.725 A 63.208 63.208 0 0 0 408.952 4.649 Q 410.895 4.55 412.56 4.325 Q 415.52 3.925 419.12 3.525 A 57.801 57.801 0 0 1 422.034 3.282 Q 424.64 3.125 427.84 3.125 A 74.922 74.922 0 0 1 440.24 4.088 Q 446.789 5.189 452.105 7.548 A 37.317 37.317 0 0 1 458.8 11.365 A 27.236 27.236 0 0 1 467.187 20.771 Q 469.954 26.023 470.213 32.625 A 35.159 35.159 0 0 1 470.24 34.005 A 41.752 41.752 0 0 1 467.704 48.641 A 39.421 39.421 0 0 1 466 52.565 Q 461.76 61.045 453.2 66.245 Q 444.64 71.445 431.52 71.445 A 21.718 21.718 0 0 1 429.227 71.333 Q 426.719 71.065 425.2 70.165 Q 423.04 68.885 423.04 67.125 A 2.072 2.072 0 0 1 423.781 65.52 A 3.105 3.105 0 0 1 424.08 65.285 Q 424.729 64.836 425.284 64.667 A 2.186 2.186 0 0 1 425.92 64.565 A 13.015 13.015 0 0 1 427.32 64.637 Q 428.22 64.734 428.96 64.965 Q 430.24 65.365 432.48 65.365 A 9.839 9.839 0 0 0 440.581 61.31 A 17.306 17.306 0 0 0 442.64 57.845 A 33.299 33.299 0 0 0 444.803 51.238 Q 445.521 48.018 445.836 44.233 A 75.351 75.351 0 0 0 446.08 38.005 A 71.948 71.948 0 0 0 445.742 30.761 Q 444.99 23.366 442.573 18.803 A 16.941 16.941 0 0 0 441.28 16.725 A 15.331 15.331 0 0 0 430.194 10.295 A 20.798 20.798 0 0 0 427.84 10.165 Q 424.873 10.165 422.853 11.043 A 7.065 7.065 0 0 0 421.04 12.165 Q 418.982 13.94 418.75 17.414 A 13.668 13.668 0 0 0 418.72 18.325 L 418.56 92.725 A 15.111 15.111 0 0 0 418.774 95.363 Q 419.023 96.762 419.56 97.846 A 6.266 6.266 0 0 0 421.28 100.005 A 11.172 11.172 0 0 0 423.248 101.224 Q 425.345 102.269 428.593 103.106 A 53.266 53.266 0 0 0 430.72 103.605 A 9.395 9.395 0 0 1 431.734 103.844 Q 432.229 103.993 432.626 104.185 A 3.715 3.715 0 0 1 433.36 104.645 Q 434.221 105.35 434.24 106.744 A 4.638 4.638 0 0 1 434.24 106.805 A 2.515 2.515 0 0 1 434.121 107.6 A 2.037 2.037 0 0 1 433.44 108.565 A 2.681 2.681 0 0 1 432.532 109.03 Q 432.153 109.145 431.698 109.185 A 5.749 5.749 0 0 1 431.2 109.205 A 124.521 124.521 0 0 1 427.921 109.159 Q 426.244 109.115 424.382 109.028 A 214.634 214.634 0 0 1 423.12 108.965 Q 418.56 108.725 414.08 108.565 Q 409.6 108.405 406.4 108.405 Q 403.04 108.405 399.04 108.565 A 495.61 495.61 0 0 0 391.329 108.936 A 541.268 541.268 0 0 0 390.8 108.965 Q 386.56 109.205 383.04 109.205 A 4.947 4.947 0 0 1 381.858 109.07 A 3.961 3.961 0 0 1 380.8 108.645 A 2.008 2.008 0 0 1 380.201 108.128 Q 379.892 107.721 379.848 107.159 A 2.45 2.45 0 0 1 379.84 106.965 A 2.907 2.907 0 0 1 381.219 104.408 Q 381.748 104.056 382.48 103.81 A 8.312 8.312 0 0 1 383.2 103.605 Q 389.28 102.325 391.6 100.325 Q 393.778 98.448 393.912 93.681 A 22.691 22.691 0 0 0 393.92 93.045 Z",
          id: "3",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 540.16 71.445 L 511.84 71.445 A 3.161 3.161 0 0 0 511.112 71.524 A 2.113 2.113 0 0 0 510.08 72.085 A 2.62 2.62 0 0 0 509.653 72.663 Q 509.323 73.254 509.12 74.165 Q 508.48 76.405 507.68 78.645 Q 506.88 80.885 506.16 83.125 Q 505.44 85.365 504.8 87.605 Q 504.16 89.845 503.52 91.925 A 16.266 16.266 0 0 0 503.252 93.343 Q 502.719 97.117 504.48 99.285 A 7.072 7.072 0 0 0 506.138 100.721 Q 508.603 102.32 513.44 103.445 A 9.231 9.231 0 0 1 514.913 103.87 Q 517.28 104.795 517.28 106.805 A 2.25 2.25 0 0 1 517.172 107.524 A 1.797 1.797 0 0 1 516.4 108.485 Q 515.615 108.985 514 109.039 A 12.054 12.054 0 0 1 513.6 109.045 Q 508.96 109.045 504.96 108.805 A 128.917 128.917 0 0 0 500.76 108.625 A 168.958 168.958 0 0 0 496.16 108.565 A 86.201 86.201 0 0 0 489.508 108.813 A 74.292 74.292 0 0 0 487.04 109.045 Q 482.72 109.525 477.76 109.525 A 9.189 9.189 0 0 1 476.471 109.44 Q 475.532 109.307 474.8 108.965 Q 473.804 108.5 473.635 107.429 A 2.973 2.973 0 0 1 473.6 106.965 Q 473.6 105.365 474.64 104.645 A 6.568 6.568 0 0 1 475.583 104.11 Q 476.382 103.734 477.44 103.445 A 23.679 23.679 0 0 0 483.013 101.145 A 20.837 20.837 0 0 0 485.52 99.445 Q 488.96 96.725 490.72 92.725 Q 494.72 83.765 498.24 75.045 Q 501.76 66.325 505.12 57.765 Q 508.48 49.205 511.84 40.325 Q 515.2 31.445 518.56 22.325 Q 520.37 17.38 521.179 14.48 A 29.609 29.609 0 0 0 521.6 12.805 Q 522.214 9.968 522.533 9.409 A 0.757 0.757 0 0 1 522.56 9.365 Q 525.44 8.565 528 7.925 A 41.102 41.102 0 0 0 530.982 7.053 A 52.081 52.081 0 0 0 533.44 6.165 Q 536.32 5.045 538.32 3.285 Q 539.852 1.938 540.773 1.059 A 29.826 29.826 0 0 0 541.28 0.565 Q 541.92 0.085 542.56 0.005 A 0.687 0.687 0 0 1 542.646 0 Q 543.149 0 543.653 0.743 A 4.663 4.663 0 0 1 543.84 1.045 Q 544.32 2.005 544.72 3.045 A 17.874 17.874 0 0 1 545.145 4.291 A 23.023 23.023 0 0 1 545.44 5.365 Q 548.8 16.085 552.32 27.205 Q 555.84 38.325 559.44 49.365 Q 563.04 60.405 566.56 71.205 Q 570.08 82.005 573.44 92.245 Q 574.4 95.445 576.4 97.685 Q 578.4 99.925 580.96 101.205 A 32.783 32.783 0 0 0 584.226 102.613 A 41.388 41.388 0 0 0 586.72 103.445 A 13.072 13.072 0 0 1 587.892 103.821 Q 588.463 104.037 588.93 104.287 A 6.08 6.08 0 0 1 589.52 104.645 A 2.343 2.343 0 0 1 590.532 106.352 A 3.539 3.539 0 0 1 590.56 106.805 Q 590.56 107.925 589.6 108.565 A 3.817 3.817 0 0 1 587.81 109.185 A 4.8 4.8 0 0 1 587.36 109.205 Q 584.198 109.205 579.552 108.971 A 271.839 271.839 0 0 1 579.44 108.965 Q 574.72 108.725 569.92 108.565 Q 565.795 108.428 562.497 108.408 A 180.368 180.368 0 0 0 561.44 108.405 Q 558.4 108.405 554 108.565 Q 549.6 108.725 545.12 108.885 Q 540.64 109.045 537.44 109.045 A 6.221 6.221 0 0 1 536.257 108.938 A 4.536 4.536 0 0 1 534.96 108.485 Q 533.958 107.946 533.922 106.886 A 2.348 2.348 0 0 1 533.92 106.805 A 2.958 2.958 0 0 1 534.091 105.778 A 2.56 2.56 0 0 1 535.04 104.565 Q 536.16 103.765 537.76 103.445 A 40.685 40.685 0 0 0 540.837 102.662 Q 544.445 101.58 546.4 100.085 Q 548.799 98.251 548.336 94.8 A 10.393 10.393 0 0 0 548.16 93.845 Q 547.52 90.805 546.56 87.445 Q 545.6 84.085 544.72 80.645 A 170.044 170.044 0 0 0 543.119 74.809 A 155.128 155.128 0 0 0 542.88 74.005 Q 542.568 72.755 542.102 72.115 A 2.548 2.548 0 0 0 542.08 72.085 A 1.317 1.317 0 0 0 541.562 71.685 Q 541.123 71.483 540.43 71.451 A 5.877 5.877 0 0 0 540.16 71.445 Z M 516.32 62.805 L 537.12 62.805 A 7.767 7.767 0 0 0 537.905 62.769 Q 538.69 62.689 539.094 62.431 A 0.844 0.844 0 0 0 539.52 61.685 Q 539.52 61.329 539.476 61.06 A 2.187 2.187 0 0 0 539.44 60.885 A 7.273 7.273 0 0 0 539.376 60.646 Q 539.341 60.523 539.297 60.383 A 16.936 16.936 0 0 0 539.2 60.085 L 528.48 23.925 Q 528 22.165 527.52 22.165 Q 527.232 22.165 526.554 23.594 A 22.258 22.258 0 0 0 526.4 23.925 L 513.76 60.085 A 3.082 3.082 0 0 0 513.502 60.805 A 2.614 2.614 0 0 0 513.44 61.365 A 1.102 1.102 0 0 0 513.584 61.934 Q 513.717 62.159 513.971 62.318 A 1.85 1.85 0 0 0 514.32 62.485 A 5.205 5.205 0 0 0 515.418 62.748 A 6.869 6.869 0 0 0 516.32 62.805 Z",
          id: "4",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 624.48 110.965 Q 617.6 110.965 611.2 109.365 Q 604.8 107.765 599.2 104.245 Q 598.24 103.445 597.28 102.485 A 7.09 7.09 0 0 1 596.273 101.231 A 6.069 6.069 0 0 1 595.84 100.405 Q 594.24 96.085 593.68 89.845 A 109.626 109.626 0 0 1 593.245 80.042 A 113.493 113.493 0 0 1 593.28 77.205 Q 593.28 76.15 594.133 75.663 A 2.198 2.198 0 0 1 594.24 75.605 Q 595.2 75.125 596.48 75.125 Q 598.08 75.125 598.64 75.525 Q 599.2 75.925 599.84 77.045 A 56.914 56.914 0 0 0 603.579 86.657 A 40.784 40.784 0 0 0 610.32 96.405 A 24.816 24.816 0 0 0 616.606 101.305 A 20.744 20.744 0 0 0 626.56 103.765 Q 631.68 103.765 634.96 101.445 Q 638.24 99.125 640 95.525 A 17.225 17.225 0 0 0 641.55 90.78 A 15.4 15.4 0 0 0 641.76 88.245 A 21.789 21.789 0 0 0 641.43 84.349 Q 641.012 82.048 640.063 80.17 A 13.127 13.127 0 0 0 639.76 79.605 A 18.002 18.002 0 0 0 636.877 75.848 A 24.514 24.514 0 0 0 633.76 73.205 Q 631.01 71.225 627.202 69.018 A 135.313 135.313 0 0 0 623.52 66.965 Q 616.8 63.125 610.56 58.885 Q 604.32 54.645 600.32 48.565 Q 596.428 42.649 596.323 33.853 A 41.035 41.035 0 0 1 596.32 33.365 Q 596.32 23.925 601.2 17.045 Q 606.08 10.165 614.56 6.325 A 43.184 43.184 0 0 1 627.747 2.798 A 53.582 53.582 0 0 1 633.6 2.485 Q 639.68 2.485 645.2 3.765 Q 650.72 5.045 654.08 6.325 Q 656 7.125 656.88 8.085 A 4.088 4.088 0 0 1 657.401 8.815 Q 657.958 9.786 658.4 11.445 A 51.999 51.999 0 0 1 658.967 14.168 Q 659.244 15.691 659.485 17.434 A 103.878 103.878 0 0 1 659.76 19.605 Q 660.32 24.405 660.32 30.165 Q 660.32 32.245 657.44 32.245 Q 656 32.245 654.8 31.525 Q 653.6 30.805 653.28 29.685 A 43.999 43.999 0 0 0 651.108 23.634 Q 649.65 20.391 647.772 17.91 A 22.151 22.151 0 0 0 645.28 15.125 A 18.127 18.127 0 0 0 632.798 10.17 A 23.441 23.441 0 0 0 632.32 10.165 A 24.049 24.049 0 0 0 628.658 10.429 Q 626.644 10.74 624.959 11.416 A 13.834 13.834 0 0 0 624.16 11.765 Q 620.8 13.365 619.12 16.565 A 13.649 13.649 0 0 0 617.914 19.917 Q 617.44 22.015 617.44 24.565 A 10.869 10.869 0 0 0 619.444 30.83 A 13.95 13.95 0 0 0 620.08 31.685 Q 622.72 34.965 627.68 38.325 Q 632.562 41.632 638.838 45.404 A 336.973 336.973 0 0 0 639.04 45.525 Q 645.655 49.445 650.207 53.272 A 49.549 49.549 0 0 1 652.8 55.605 A 36.832 36.832 0 0 1 657.162 60.623 A 28.158 28.158 0 0 1 660.24 66.085 A 29.077 29.077 0 0 1 662.163 73.131 A 38.837 38.837 0 0 1 662.56 78.805 A 41.422 41.422 0 0 1 661.84 86.744 Q 660.892 91.599 658.696 95.481 A 25.101 25.101 0 0 1 657.84 96.885 A 27.512 27.512 0 0 1 645.745 107.023 A 33.765 33.765 0 0 1 644.56 107.525 A 45.856 45.856 0 0 1 634.709 110.197 Q 630.224 110.917 625.158 110.962 A 76.284 76.284 0 0 1 624.48 110.965 Z",
          id: "5",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.path({
        attrs: {
          transform: "translate(460,300)",
          d: "M 703.52 110.965 Q 696.64 110.965 690.24 109.365 Q 683.84 107.765 678.24 104.245 Q 677.28 103.445 676.32 102.485 A 7.09 7.09 0 0 1 675.313 101.231 A 6.069 6.069 0 0 1 674.88 100.405 Q 673.28 96.085 672.72 89.845 A 109.626 109.626 0 0 1 672.285 80.042 A 113.493 113.493 0 0 1 672.32 77.205 Q 672.32 76.15 673.173 75.663 A 2.198 2.198 0 0 1 673.28 75.605 Q 674.24 75.125 675.52 75.125 Q 677.12 75.125 677.68 75.525 Q 678.24 75.925 678.88 77.045 A 56.914 56.914 0 0 0 682.619 86.657 A 40.784 40.784 0 0 0 689.36 96.405 A 24.816 24.816 0 0 0 695.646 101.305 A 20.744 20.744 0 0 0 705.6 103.765 Q 710.72 103.765 714 101.445 Q 717.28 99.125 719.04 95.525 A 17.225 17.225 0 0 0 720.59 90.78 A 15.4 15.4 0 0 0 720.8 88.245 A 21.789 21.789 0 0 0 720.47 84.349 Q 720.052 82.048 719.103 80.17 A 13.127 13.127 0 0 0 718.8 79.605 A 18.002 18.002 0 0 0 715.917 75.848 A 24.514 24.514 0 0 0 712.8 73.205 Q 710.05 71.225 706.242 69.018 A 135.313 135.313 0 0 0 702.56 66.965 Q 695.84 63.125 689.6 58.885 Q 683.36 54.645 679.36 48.565 Q 675.468 42.649 675.363 33.853 A 41.035 41.035 0 0 1 675.36 33.365 Q 675.36 23.925 680.24 17.045 Q 685.12 10.165 693.6 6.325 A 43.184 43.184 0 0 1 706.787 2.798 A 53.582 53.582 0 0 1 712.64 2.485 Q 718.72 2.485 724.24 3.765 Q 729.76 5.045 733.12 6.325 Q 735.04 7.125 735.92 8.085 A 4.088 4.088 0 0 1 736.441 8.815 Q 736.998 9.786 737.44 11.445 A 51.999 51.999 0 0 1 738.007 14.168 Q 738.284 15.691 738.525 17.434 A 103.878 103.878 0 0 1 738.8 19.605 Q 739.36 24.405 739.36 30.165 Q 739.36 32.245 736.48 32.245 Q 735.04 32.245 733.84 31.525 Q 732.64 30.805 732.32 29.685 A 43.999 43.999 0 0 0 730.148 23.634 Q 728.69 20.391 726.812 17.91 A 22.151 22.151 0 0 0 724.32 15.125 A 18.127 18.127 0 0 0 711.838 10.17 A 23.441 23.441 0 0 0 711.36 10.165 A 24.049 24.049 0 0 0 707.698 10.429 Q 705.684 10.74 703.999 11.416 A 13.834 13.834 0 0 0 703.2 11.765 Q 699.84 13.365 698.16 16.565 A 13.649 13.649 0 0 0 696.954 19.917 Q 696.48 22.015 696.48 24.565 A 10.869 10.869 0 0 0 698.484 30.83 A 13.95 13.95 0 0 0 699.12 31.685 Q 701.76 34.965 706.72 38.325 Q 711.602 41.632 717.878 45.404 A 336.973 336.973 0 0 0 718.08 45.525 Q 724.695 49.445 729.247 53.272 A 49.549 49.549 0 0 1 731.84 55.605 A 36.832 36.832 0 0 1 736.202 60.623 A 28.158 28.158 0 0 1 739.28 66.085 A 29.077 29.077 0 0 1 741.203 73.131 A 38.837 38.837 0 0 1 741.6 78.805 A 41.422 41.422 0 0 1 740.88 86.744 Q 739.932 91.599 737.736 95.481 A 25.101 25.101 0 0 1 736.88 96.885 A 27.512 27.512 0 0 1 724.785 107.023 A 33.765 33.765 0 0 1 723.6 107.525 A 45.856 45.856 0 0 1 713.749 110.197 Q 709.264 110.917 704.198 110.962 A 76.284 76.284 0 0 1 703.52 110.965 Z",
          id: "6",
          vectorEffect: "non-scaling-stroke",
        },
      }),
      svg.rect({
        attrs: { x: "466", y: "240.5", width: "800", height: "15.5" },
      }),
      // svg.text({ attrs: { 'font-family': "Calibri", 'font-size': "40", 'font-weight': "bold", x: "497", y: "450" } }, 'COMPUTATIONAL SCIENCES'),
      // svg.path({ attrs: { d: "M 1111.1316 329.63885 C 1111.7629 340.6366 1119.8291 350.53146 1131.0461 350.7098 C 1142.2632 350.8882 1154.6805 342.4446 1153.2188 331.05904 C 1151.7572 319.67348 1142.7102 319.24054 1132.1177 316.17612 C 1121.5253 313.11165 1130.3999 308.0055 1130.3999 308.0055 C 1130.3999 308.0055 1134.739 305.7016 1139.3956 304.96687 C 1144.0522 304.23215 1147.434 306.17886 1149.1073 306.1567 C 1150.7806 306.13453 1150.2077 300.1209 1149.0792 298.99964 C 1147.9508 297.87838 1138.8401 295.20424 1130.1026 299.3452 C 1121.365 303.48615 1118.0291 308.5461 1118.0291 308.5461 C 1118.0291 308.5461 1110.5002 318.6411 1111.1316 329.63885 Z" } }),
      // svg.path({ attrs: { d: "M 1123.1925 334.362 C 1124.9592 338.72802 1129.5795 341.5972 1134.138 340.08526 C 1138.6965 338.57332 1142.5552 333.3991 1140.3996 328.99328 C 1138.244 324.58742 1134.0469 325.6506 1129.3442 325.9052 C 1124.6415 326.1598 1122.6041 322.6 1122.6041 322.6 L 1122.3587 325.91298 C 1122.3587 325.91298 1121.4258 329.996 1123.1925 334.362 Z", fill: "white" } }),
      // svg.ellipse({ attrs: { cx: "1130.6581", cy: "328.0728", rx: "5.658064", ry: "6.727217" } }),
      // svg.ellipse({ attrs: { cx: "1130.6581", cy: "329.1", rx: "2.554036", ry: "2.1000034", fill: "white" } }),
    ]),
  ]
)

// const homeSVG = svg(
//   {
//     attrs: {
//       "vertical-align": "baseline",
//       height: "30pt",
//       width: "30pt",
//       viewBox: "1020 -226 972 972",
//     },
//   },
//   [
//     svg.a({ attrs: { "xlink:href": "/target" } }, [
//       // TARGET
//       svg.path({
//         attrs: {
//           id: "target",
//           d: "M 1506.0454 -136.98166 L 1506.0454 -225 C 1420.9163 -225 1337.2871 -202.5916 1263.5632 -160.02709 C 1031.6083 -26.107868 952.1347 270.4917 1086.0539 502.4466 L 1162.28 458.43743 C 1052.6664 268.58106 1117.716 25.81266 1307.5724 -83.80097 C 1367.9158 -118.64026 1436.3668 -136.98165 1506.0454 -136.98166 Z",
//           fill: "#f44335",
//         },
//       }),
//       svg.text([
//         svg.textPath(
//           { attrs: { "xlink:href": "#target", startOffset: "80%" } },
//           [
//             svg.tspan(
//               {
//                 attrs: {
//                   "font-family": '"Roboto", Arial, Helvetica, sans-serif',
//                   "font-size": "60",
//                   "text-anchor": "middle",
//                   "letter-spacing": 15,
//                   "font-weight": "bold",
//                   fill: "#ebebeb",
//                   dy: "-20",
//                 },
//               },
//               "TARGET"
//             ),
//           ]
//         ),
//       ]),
//       svg.path({
//         attrs: {
//           d: "M 1506.0454 -136.98166 L 1506.0454 -225 C 1420.9163 -225 1337.2871 -202.5916 1263.5632 -160.02709 C 1031.6083 -26.107868 952.1347 270.4917 1086.0539 502.4466 L 1162.28 458.43743 C 1052.6664 268.58106 1117.716 25.81266 1307.5724 -83.80097 C 1367.9158 -118.64026 1436.3668 -136.98165 1506.0454 -136.98166 Z",
//           stroke: "white",
//           "fill-opacity": "0",
//           "stroke-linecap": "round",
//           "stroke-linejoin": "round",
//           "stroke-width": "6",
//         },
//       }),
//     ]),
//     // DISEASE
//     svg.a({ attrs: { "xlink:href": "/disease" } }, [
//       svg.path({
//         attrs: {
//           id: "disease",
//           d: "M 1849.8108 458.43743 L 1926.0369 502.4466 C 1968.6014 428.7227 1991.0098 345.09344 1991.0098 259.9644 C 1991.0098 -7.8740405 1773.8838 -225 1506.0454 -225 L 1506.0454 -136.98166 C 1725.2726 -136.98166 1902.9914 40.73715 1902.9914 259.9644 C 1902.9914 329.643 1884.65 398.094 1849.8108 458.4374 Z",
//           fill: "#e91e63",
//         },
//       }),
//       svg.text([
//         svg.textPath(
//           { attrs: { "xlink:href": "#disease", startOffset: "80%" } },
//           [
//             svg.tspan(
//               {
//                 attrs: {
//                   "font-family": '"Roboto", Arial, Helvetica, sans-serif',
//                   "font-size": "60",
//                   "text-anchor": "middle",
//                   "letter-spacing": 15,
//                   "font-weight": "bold",
//                   fill: "#ebebeb",
//                   dy: "-20",
//                 },
//               },
//               "DISEASE"
//             ),
//           ]
//         ),
//       ]),
//       svg.path({
//         attrs: {
//           d: "M 1849.8108 458.43743 L 1926.0369 502.4466 C 1968.6014 428.7227 1991.0098 345.09344 1991.0098 259.9644 C 1991.0098 -7.8740405 1773.8838 -225 1506.0454 -225 L 1506.0454 -136.98166 C 1725.2726 -136.98166 1902.9914 40.73715 1902.9914 259.9644 C 1902.9914 329.643 1884.65 398.094 1849.8108 458.4374 Z",
//           stroke: "white",
//           "fill-opacity": "0",
//           "stroke-linecap": "round",
//           "stroke-linejoin": "round",
//           "stroke-width": "6",
//         },
//       }),
//     ]),
//     // COMPOUND
//     svg.a({ attrs: { "xlink:href": "/compound" } }, [
//       svg.path({
//         attrs: {
//           id: "compound",
//           d: "M 1162.28 458.43743 L 1086.0539 502.4466 C 1128.6184 576.1705 1189.8393 637.3914 1263.5632 679.9559 C 1495.518 813.8751 1792.1177 734.4015 1926.0369 502.4466 L 1849.8108 458.43743 C 1740.1971 648.2938 1497.4287 713.3434 1307.5724 603.7298 C 1247.229 568.8905 1197.1193 518.7809 1162.28 458.43745 Z",
//           fill: "#ff9800",
//         },
//       }),
//       svg.text([
//         svg.textPath(
//           { attrs: { "xlink:href": "#compound", startOffset: "29%" } },
//           [
//             svg.tspan(
//               {
//                 attrs: {
//                   "font-family": '"Roboto", Arial, Helvetica, sans-serif',
//                   "font-size": "60",
//                   "text-anchor": "middle",
//                   "letter-spacing": 15,
//                   "font-weight": "bold",
//                   fill: "#ebebeb",
//                   dy: "-20",
//                 },
//               },
//               "COMPOUND"
//             ),
//           ]
//         ),
//       ]),
//       svg.path({
//         attrs: {
//           d: "M 1162.28 458.43743 L 1086.0539 502.4466 C 1128.6184 576.1705 1189.8393 637.3914 1263.5632 679.9559 C 1495.518 813.8751 1792.1177 734.4015 1926.0369 502.4466 L 1849.8108 458.43743 C 1740.1971 648.2938 1497.4287 713.3434 1307.5724 603.7298 C 1247.229 568.8905 1197.1193 518.7809 1162.28 458.43745 Z",
//           stroke: "white",
//           "fill-opacity": "0",
//           "stroke-linecap": "round",
//           "stroke-linejoin": "round",
//           "stroke-width": "6",
//         },
//       }),
//     ]),
//     svg.g([
//       // DISEASE - PHENO
//       svg.path({
//         attrs: {
//           d: "M 1506.0454 251.9644 L 1506.0454 -.035595944 C 1645.2211 -.035595944 1758.0454 112.78865 1758.0454 251.9644 C 1758.0454 296.19964 1746.4014 339.65556 1724.2838 377.9644 Z",
//           fill: "#e92363",
//           "fill-opacity": ".5",
//         },
//       }),
//       svg.path({
//         attrs: {
//           d: "M 1506.0454 251.9644 L 1506.0454 -.035595944 C 1645.2211 -.035595944 1758.0454 112.78865 1758.0454 251.9644 C 1758.0454 296.19964 1746.4014 339.65556 1724.2838 377.9644 Z",
//           stroke: "white",
//           "stroke-linecap": "round",
//           "stroke-linejoin": "round",
//           "stroke-width": "6",
//           "fill-opacity": "0",
//         },
//       }),
//       svg.text(
//         { attrs: { transform: "translate(1529.807 150.726)", fill: "white" } },
//         [
//           svg.tspan(
//             {
//               attrs: {
//                 "font-family": '"Roboto", Arial, Helvetica, sans-serif',
//                 "font-size": "60",
//                 "font-weight": "bold",
//                 fill: "white",
//                 x: ".18359375",
//                 y: "56",
//                 textLength: "198.63281",
//               },
//             },
//             "PHENO"
//           ),
//         ]
//       ),

//       svg.path({
//         attrs: {
//           d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z",
//           fill: "#fe9801",
//           "fill-opacity": ".5",
//         },
//       }),
//       svg.path({
//         attrs: {
//           d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z",
//           stroke: "white",
//           "stroke-linecap": "round",
//           "stroke-linejoin": "round",
//           "stroke-width": "6",
//           "fill-opacity": "0",
//         },
//       }),
//       // svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6" } }),

//       svg.path({
//         attrs: {
//           d: "M 1506.0454 251.9644 L 1287.807 377.9644 C 1218.2191 257.43466 1259.5156 103.31388 1380.0454 33.726002 C 1418.3542 11.608383 1461.8101 -.035595944 1506.0454 -.035595944 Z",
//           fill: "#f44335",
//           "fill-opacity": ".5",
//         },
//       }),
//       svg.path({
//         attrs: {
//           d: "M 1506.0454 251.9644 L 1287.807 377.9644 C 1218.2191 257.43466 1259.5156 103.31388 1380.0454 33.726002 C 1418.3542 11.608383 1461.8101 -.035595944 1506.0454 -.035595944 Z",
//           stroke: "white",
//           "stroke-linecap": "round",
//           "stroke-linejoin": "round",
//           "stroke-width": "6",
//           "fill-opacity": "0",
//         },
//       }),

//       svg.text(
//         { attrs: { transform: "translate(1309.807 150.726)", fill: "white" } },
//         [
//           svg.tspan(
//             {
//               attrs: {
//                 "font-family": '"Roboto", Arial, Helvetica, sans-serif',
//                 "font-size": "60",
//                 "font-weight": "bold",
//                 fill: "white",
//                 x: ".29589844",
//                 y: "56",
//                 textLength: "158.4082",
//               },
//             },
//             "GENO"
//           ),
//         ]
//       ),

//       svg.text(
//         { attrs: { transform: "translate(1406.807 358.726)", fill: "white" } },
//         [
//           svg.tspan(
//             {
//               attrs: {
//                 "font-family": '"Roboto", Arial, Helvetica, sans-serif',
//                 "font-size": "60",
//                 "font-weight": "bold",
//                 fill: "white",
//                 x: ".3076172",
//                 y: "56",
//                 textLength: "209.38477",
//               },
//             },
//             "CHEMO"
//           ),
//         ]
//       ),
//     ]),
//   ]
// )
