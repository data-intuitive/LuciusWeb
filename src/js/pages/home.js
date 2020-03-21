import xs from 'xstream';
import { div, nav, a, h3, p, ul, li, h1, h2, i, footer, header, main, svg, g, path, img, map, area, use, span } from '@cycle/dom'
import { merge, prop, equals } from 'ramda';

import { Check } from '../components/Check'
import { IsolatedSettings } from './settings'

import flattenSequentially from 'xstream/extra/flattenSequentially'
import { pick, mix } from 'cycle-onionify';
import { initSettings } from '../configuration'
import debounce from 'xstream/extra/debounce'
import dropRepeats from 'xstream/extra/dropRepeats'

import { logoSVG } from '../index'

const appear = {
    style: {
        // fontSize: '14px',
        opacity: '0',
        transition: 'opacity 4s',
        delayed: { opacity: '1' },
        destroy: { opacity: '0' }
    }
}

function Home(sources) {

    const checkProps$ = sources.onion.state$
        .compose(dropRepeats((x, y) => equals(x.settings, y.settings)))
        .map(state => merge(state.settings.form, state.settings.api))
    const CheckSink = Check(merge(sources, { props: checkProps$ }))

    const vdom$ = xs.combine(CheckSink.DOM)
        .map(([check]) => div([
            div({ style: { 'z-index': -1, height: '100%', overflow: 'hidden', position: 'absolute', opacity: 0.08, 'text-align': 'center', width: '100%' } },
                Array(60).fill().map(i => div({ style: { width: '25%', display: 'inline-block' } }, [logoSVG]))),
            div('.row .transparent', [
                h2('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1', { style: { 'vertical-align': 'top' } }, [
                    'Welcome to ComPass',
                    // div({ style: { display: 'inline-block', width: '200px', 'vertical-align': '-40%' } }, [logoSVG]),
                    ' ',
                    check
                ]),
                p('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1  .flow-text', [
                    'This application is the interface with L1000 data.'
                ]),
                div('.row', []),
                div('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1 .center-align', appear, [
                    svg({ attrs: { viewBox: '1018 -228 972 974' }, style: { 'max-width': '400px' } }, [
                        svg.a({ attrs: { 'xlink:href': "/target" } }, [
                            // TARGET
                            svg.path({
                                attrs: {
                                    id: "target",
                                    d: "M 1506.0454 -136.98166 L 1506.0454 -225 C 1420.9163 -225 1337.2871 -202.5916 1263.5632 -160.02709 C 1031.6083 -26.107868 952.1347 270.4917 1086.0539 502.4466 L 1162.28 458.43743 C 1052.6664 268.58106 1117.716 25.81266 1307.5724 -83.80097 C 1367.9158 -118.64026 1436.3668 -136.98165 1506.0454 -136.98166 Z",
                                    fill: "#f44335",
                                    'stroke-width': '0pt'
                                }
                            }),
                            svg.text([
                                svg.textPath({ attrs: { 'xlink:href': "#target", startOffset: "80%" } }, [
                                    svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'text-anchor': "middle", 'letter-spacing': 15, 'font-weight': "bold", fill: "#ebebeb", dy: "-20" } }, "TARGET")
                                ])
                            ]),
                            svg.path({
                                attrs: {
                                    id: 'border',
                                    d: "M 1506.0454 -136.98166 L 1506.0454 -225 C 1420.9163 -225 1337.2871 -202.5916 1263.5632 -160.02709 C 1031.6083 -26.107868 952.1347 270.4917 1086.0539 502.4466 L 1162.28 458.43743 C 1052.6664 268.58106 1117.716 25.81266 1307.5724 -83.80097 C 1367.9158 -118.64026 1436.3668 -136.98165 1506.0454 -136.98166 Z",
                                    stroke: "white",
                                    'fill-opacity': '0',
                                    'stroke-linecap': "round",
                                    'stroke-linejoin': "round",
                                    'stroke-width': "6"
                                }
                            })
                        ]),
                        // DISEASE
                        svg.a({ attrs: { 'xlink:href': "/disease" } }, [
                            svg.path({
                                attrs: {
                                    id: "disease",
                                    d: "M 1849.8108 458.43743 L 1926.0369 502.4466 C 1968.6014 428.7227 1991.0098 345.09344 1991.0098 259.9644 C 1991.0098 -7.8740405 1773.8838 -225 1506.0454 -225 L 1506.0454 -136.98166 C 1725.2726 -136.98166 1902.9914 40.73715 1902.9914 259.9644 C 1902.9914 329.643 1884.65 398.094 1849.8108 458.4374 Z",
                                    fill: "#e91e63"
                                }
                            }),
                            svg.text([
                                svg.textPath({ attrs: { 'xlink:href': "#disease", startOffset: "80%" } }, [
                                    svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'text-anchor': "middle", 'letter-spacing': 15, 'font-weight': "bold", fill: "#ebebeb", dy: "-20" } }, "DISEASE")
                                ])
                            ]),
                            svg.path({
                                attrs: {
                                    id: 'border',
                                    d: "M 1849.8108 458.43743 L 1926.0369 502.4466 C 1968.6014 428.7227 1991.0098 345.09344 1991.0098 259.9644 C 1991.0098 -7.8740405 1773.8838 -225 1506.0454 -225 L 1506.0454 -136.98166 C 1725.2726 -136.98166 1902.9914 40.73715 1902.9914 259.9644 C 1902.9914 329.643 1884.65 398.094 1849.8108 458.4374 Z",
                                    stroke: "white",
                                    'fill-opacity': '0',
                                    'stroke-linecap': "round",
                                    'stroke-linejoin': "round",
                                    'stroke-width': "6"
                                }
                            })
                        ]),
                        // COMPOUND
                        svg.a({ attrs: { 'xlink:href': "/compound" } }, [
                            svg.path({
                                attrs: {
                                    id: "compound",
                                    d: "M 1162.28 458.43743 L 1086.0539 502.4466 C 1128.6184 576.1705 1189.8393 637.3914 1263.5632 679.9559 C 1495.518 813.8751 1792.1177 734.4015 1926.0369 502.4466 L 1849.8108 458.43743 C 1740.1971 648.2938 1497.4287 713.3434 1307.5724 603.7298 C 1247.229 568.8905 1197.1193 518.7809 1162.28 458.43745 Z",
                                    fill: "#ff9800"
                                }
                            }),
                            svg.text([
                                svg.textPath({ attrs: { 'xlink:href': "#compound", startOffset: "29%" } }, [
                                    svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'text-anchor': "middle", 'letter-spacing': 15, 'font-weight': "bold", fill: "#ebebeb", dy: "-20" } }, "COMPOUND")
                                ])
                            ]),
                            svg.path({
                                attrs: {
                                    id: 'border',
                                    d: "M 1162.28 458.43743 L 1086.0539 502.4466 C 1128.6184 576.1705 1189.8393 637.3914 1263.5632 679.9559 C 1495.518 813.8751 1792.1177 734.4015 1926.0369 502.4466 L 1849.8108 458.43743 C 1740.1971 648.2938 1497.4287 713.3434 1307.5724 603.7298 C 1247.229 568.8905 1197.1193 518.7809 1162.28 458.43745 Z",
                                    stroke: "white",
                                    'fill-opacity': '0',
                                    'stroke-linecap': "round",
                                    'stroke-linejoin': "round",
                                    'stroke-width': "6"
                                }
                            })
                        ]),
                        svg.g([
                            // DISEASE - PHENO
                            svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1506.0454 -.035595944 C 1645.2211 -.035595944 1758.0454 112.78865 1758.0454 251.9644 C 1758.0454 296.19964 1746.4014 339.65556 1724.2838 377.9644 Z", fill: "#e92363", 'fill-opacity': ".5" } }),
                            svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1506.0454 -.035595944 C 1645.2211 -.035595944 1758.0454 112.78865 1758.0454 251.9644 C 1758.0454 296.19964 1746.4014 339.65556 1724.2838 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6", 'fill-opacity': '0' } }),
                            svg.text({ attrs: { transform: "translate(1529.807 150.726)", fill: "white" } }, [
                                svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'font-weight': "bold", fill: "white", x: ".18359375", y: "56", textLength: "198.63281" } }, 'PHENO')
                            ]),

                            svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", fill: "#fe9801", 'fill-opacity': ".5" } }),
                            svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6", 'fill-opacity': '0' } }),
                            // svg.path({ attrs: { d: "M 1506.1296 251.9644 L 1724.368 377.9644 C 1654.78 498.49415 1500.6593 539.7907 1380.1296 470.2028 C 1341.8207 448.0852 1310.0088 416.27324 1287.8912 377.9644 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6" } }),


                            svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1287.807 377.9644 C 1218.2191 257.43466 1259.5156 103.31388 1380.0454 33.726002 C 1418.3542 11.608383 1461.8101 -.035595944 1506.0454 -.035595944 Z", fill: "#f44335", 'fill-opacity': ".5" } }),
                            svg.path({ attrs: { d: "M 1506.0454 251.9644 L 1287.807 377.9644 C 1218.2191 257.43466 1259.5156 103.31388 1380.0454 33.726002 C 1418.3542 11.608383 1461.8101 -.035595944 1506.0454 -.035595944 Z", stroke: "white", 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "6", 'fill-opacity': '0' } }),

                            svg.text({ attrs: { transform: "translate(1309.807 150.726)", fill: "white" } }, [
                                svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'font-weight': "bold", fill: "white", x: ".29589844", y: "56", textLength: "158.4082" } }, 'GENO')
                            ]),


                            svg.text({ attrs: { transform: "translate(1406.807 358.726)", fill: "white" } }, [
                                svg.tspan({ attrs: { 'font-family': "Roboto", 'font-size': "60", 'font-weight': "bold", fill: "white", x: ".3076172", y: "56", textLength: "209.38477" } }, 'CHEMO')
                            ]),


                        ])
                    ]),
                ]),

                // img({ attrs: { src: 'src/js/pages/home.svg', usemap: '#homemap'} }),
                // div('.col .s6 .offset-s3', [
                //     div('.col .s12 .orange .darken-4 .pink-text', { style: { padding: '10px 10px 10px 10px' } },
                //         [
                //             i('.orange-text .text-lighten-1 .material-icons', 'play_arrow'),
                //             a('.orange-text .text-lighten-3', { props: { href: '/compound' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Compound Workflow')
                //         ]),
                //     div('.row', []),
                //     div('.col .s12 .red .darken-4 .pink-text', { style: { padding: '10px 10px 10px 10px' } },
                //         [
                //             i('.red-text .text-lighten-1 .material-icons', 'play_arrow'),
                //             a('.red-text .text-lighten-4', { props: { href: '/target' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Target Workflow')
                //         ]),
                //     div('.row', []),
                //     div('.col .s12 .pink .darken-4', { style: { padding: '10px 10px 10px 10px' } },
                //         [
                //             i('.pink-text .text-lighten-1 .material-icons', 'play_arrow'),
                //             a('.pink-text .text-lighten-3', { props: { href: '/disease' }, style: { fontWeight: 'bolder', 'font-size': '32px' } }, ' Disease Workflow')
                //         ]),
                // ]),
                div('.row', []),
                p('.col .l6 .m8 .s10 offset-l3 .offset-m2 .offset-s1  .flow-text', [
                    'You can click on one of the workflows above to start it.',
                    ' Alternatively, you can initiate ghost mode in the settings.'
                ]),
            ])
        ]));

    return {
        DOM: vdom$,
        HTTP: CheckSink.HTTP,
        onion: CheckSink.onion,
        alert: CheckSink.alert,
        popup: CheckSink.popup
    };
}

export default Home
