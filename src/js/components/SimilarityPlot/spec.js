
export const similarityPlotSpec = (data) => ({
    "padding": "strict",
    "data": [
        {
            "name": "table",
            "format": {
                "type": "json",
                "parse": { "x": "number", "count": "number", "avg": "number" }
            },
            "values": data
        },
        {
            "name": "aggregates",
            "source": "table",
            "transform": [
                {
                    "type": "aggregate",
                    "summarize": [{ "field": "count", "ops": "sum" }]
                }
            ]
        }
    ],
    "scales": [
        {
            "name": "xscale",
            "type": "linear",
            "range": "width",
            "domain": { "data": "table", "field": "x" }
        },
        {
            "name": "yscale",
            "type": "linear",
            "range": "height",
            "domain": { "data": "table", "field": "avg" },
            "domainMin": -1,
            "domainMax": 1
        },
        {
            "name": "color",
            "type": null,
            "domain": { "data": "table", "field": "avg" },
            "range": ["red", "green"],
            "zero": false
        },
        {
            "name": "sizeScale",
            "type": "linear",
            "range": [0, 500],
            "domain": { "data": "table", "field": "count" }
        }
    ],
    "axes": [
        {
            "type": "x",
            "scale": "xscale",
            "grid": false,
            "ticks": 0,
            "round": true,
            "nice": true,
            "zero": false,
            "properties": { "axis": { "strokeWidth": { "value": 0 } } }
        },
        {
            "type": "y",
            "format": "s",
            "scale": "yscale",
            "grid": true,
            "ticks": 10,
            "properties": {
                "axis": { "strokeWidth": { "value": 0 } },
                "majorTicks": {
                    "strokeWidth": { "value": 0 },
                    "stroke": { "value": "lightgray" }
                },
                "labels": {
                    "fill": { "value": "lightgray" },
                    "fontSize": { "value": 10 },
                    "align": { "value": "right" },
                    "baseline": { "value": "middle" },
                    "dx": { "value": -10 }
                }
            }
        }
    ],
    "marks": [
        {
            "type": "symbol",
            "from": { "data": "table" },
            "properties": {
                "enter": {
                    "x": { "field": "x", "scale": "xscale" },
                    "y": { "field": "avg", "scale": "yscale" },
                    "size": { "value": 49 },
                    "opacity": { "value": 0.7 }
                },
                "update": {
                    "strokeWidth": { "value": 1.5 },
                    "strokeOpacity": { "value": 1 },
                    "fill": { "scale": "color", "field": "avg" },
                    "size": { "scale": "sizeScale", "field": "count" },
                    "stroke": { "scale": "color", "field": "avg" },
                    "fillOpacity": { "value": 0.7 }
                },
                "hover": {
                    "fill": { "value": "#de2d26" },
                    "fillOpacity": { "value": 0.2 }
                }
            }
        }
    ]
})


export const similarityPlotSpecOld = (data) => ({
    // "autosize" : "fit",
    // "padding": 25,
    "padding": "strict",
    "data": [
        {
            "name": "source",
            "values": data,
            "format": {
                "type": "json",
                "parse": {
                    "x": "number",
                    "zhangBoxed": "number",
                    "xShift": "number",
                    "avg": "number"
                }
            },
            "transform": [
                {
                    "type": "formula",
                    "field": "absAvg",
                    "expr": "abs(datum.avg)"
                },
                {
                    "type": "formula",
                    "field": "xShift",
                    "expr": "datum.x + 1.5"
                },
                {
                    "type": "formula",
                    "field": "invAbsAvg",
                    "expr": "1/(1+datum.absAvgScaled)"
                },
                {
                    "type": "formula",
                    "field": "fixed",
                    "expr": "100"
                },
                {
                    "type": "formula",
                    "field": "countScaled",
                    "expr": "datum.count * 10"
                },
                {
                    "type": "formula",
                    "field": "zhangBoxed",
                    "expr": "datum.y / 20 - 1"
                },
                {
                    "type": "formula",
                    "field": "binFiltered",
                    "expr": "datum.absAvg >= .8 ? datum.bin : \"\" "
                },
                {
                    "type": "filter",
                    "test": "datum[\"x\"] !== null && !isNaN(datum[\"x\"]) && datum[\"zhangBoxed\"] !== null && !isNaN(datum[\"zhangBoxed\"]) && datum[\"xShift\"] !== null && !isNaN(datum[\"xShift\"]) && datum[\"avg\"] !== null && !isNaN(datum[\"avg\"])"
                }
            ]
        },
        // {
        //     "name": "layout",
        //     "values": [
        //         {}
        //     ],
        //     "transform": [
        //         {
        //             "type": "formula",
        //             "field": "width",
        //             "expr": "600"
        //         },
        //         {
        //             "type": "formula",
        //             "field": "height",
        //             "expr": "350"
        //         }
        //     ]
        // }
    ],
    // "marks": [
    //     {
    //         "name": "root",
    //         "type": "group",
    //         "description": "Bin Plot",
    //         "from": {
    //             "data": "layout"
    //         },
    //         "properties": {
    //             "update": {
    //                 "width": {
    //                     "field": "width"
    //                 },
    //                 "height": {
    //                     "field": "height"
    //                 }
    //             }
    //         },
    "marks": [
        {
            "name": "layer_0_marks",
            "type": "symbol",
            "from": {
                "data": "source"
            },
            "properties": {
                "update": {
                    "x": {
                        "scale": "xscale",
                        "field": "x"
                    },
                    "y": {
                        "scale": "y",
                        "field": "zhangBoxed"
                    },
                    // "size": {
                    //     "value": 60
                    // },
                    "shape": {
                        "value": "circle"
                    },
                    "stroke": {
                        "scale": "color",
                        "field": "avg"
                    },
                    "strokeWidth": { "value": 1.5 },
                    "strokeOpacity": { "value": 1 },
                    "size": {
                        "field": "countScaled"
                    },
                    "fill": {
                        "scale": "color",
                        "field": "avg"
                    },
                    "fillOpacity": {
                        "value": 0.5
                    },
                }
            }
        },
        // {
        //     "name": "layer_1_marks",
        //     "type": "text",
        //     "from": {
        //         "data": "source"
        //     },
        //     "properties": {
        //         "update": {
        //             "align": {
        //                 "value": "center"
        //             },
        //             "baseline": {
        //                 "value": "middle"
        //             },
        //             "text": {
        //                 "field": "binFiltered"
        //             },
        //             "x": {
        //                 "scale": "x",
        //                 "field": "xShift"
        //             },
        //             "y": {
        //                 "scale": "y",
        //                 "field": "avg"
        //             },
        //             "fontSize": {
        //                 "value": 10
        //             },
        //             "fill": {
        //                 "value": "gray"
        //             }
        //         }
        //     }
        // }
    ],
    "scales": [
        {
            "name": "xscale",
            "type": "linear",
            "domain": { "data": "source", "field": "x" },
            "range": "width",
            "round": true,
            "nice": true,
            "zero": false
        },
        {
            "name": "y",
            "type": "linear",
            "domain": {
                "data": "source",
                "field": "zhangBoxed"
            },
            "range": "height",
            "round": true,
            "nice": true,
            "zero": true
        },
        // {
        //     "name": "x",
        //     "type": "linear",
        //     "domain": [
        //         0,
        //         20
        //     ],
        //     "rangeMin": 0,
        //     "rangeMax": 600,
        //     "round": true,
        //     "nice": true,
        //     "zero": false
        // },
        // {
        //     "name": "y",
        //     "type": "linear",
        //     "domain": {
        //         "data": "source",
        //         "field": "zhangBoxed"
        //     },
        //     "rangeMin": 350,
        //     "rangeMax": 0,
        //     "round": true,
        //     "nice": true,
        //     "zero": true
        // },
        {
            "name": "color",
            "type": null,
            "domain": {
                "data": "source",
                "field": "avg"
            },
            "range": ["red", "green"],
            "zero": false
        }
    ],
    "axes": [
        {
            "type": "x",
            "scale": "xscale",
            "format": "s",
            "grid": true,
            "layer": "back",
            "ticks": 10,
            "title": "",
            "properties": {
                "axis": {
                    "strokeWidth": {
                        "value": 0
                    }
                }
            }
        },
        {
            "type": "y",
            "scale": "y",
            "format": "s",
            "grid": true,
            "layer": "back",
            "ticks": 20,
            "title": "",
            "properties": {
                "axis": {
                    "strokeWidth": {
                        "value": 0
                    }
                }
            }
        }
    ],
    // "legends": [
    //     {
    //         "fill": "color",
    //         "title": "# Samples",
    //         "offset": -150,
    //         "orient": "right",
    //         "properties": {
    //             "symbols": {
    //                 "shape": {
    //                     "value": "circle"
    //                 },
    //                 "strokeWidth": {
    //                     "value": 0
    //                 },
    //                 "opacity": {
    //                     "value": 0.7
    //                 }
    //             }
    //         }
    //     }
    // ]

    //     }
    // ]
})


export const similarityPlotSpec1 = (data) => {
    const obj = {
        // "width": 300,
        // "height": 200,
        "padding": "auto",
        "data": [
            {
                "name": "table",
                "values": data
            }
        ],
        "scales": [
            {
                "name": "xscale",
                "type": "linear",
                "range": "width",
                "domain": { "data": "table", "field": "x" }
            },
            {
                "name": "yscale",
                "type": "linear",
                "range": "height",
                "domain": { "data": "table", "field": "y" }
            },
            {
                "name": "c",
                "type": "linear",
                "range": ["red", "green"],
                "domain": { "data": "table", "field": "avg" }
            },
            {
                "name": "size",
                "type": "linear",
                "domain": { "data": "table", "field": "count" }
            }

        ],
        "axes": [
            { "type": "x", "scale": "xscale" },
            { "type": "y", "scale": "yscale", ticks: 0 }
        ],
        "marks": [
            {
                "type": "symbol",
                "from": { "data": "table" },
                "properties": {
                    "enter": {
                        "x": { "field": "x", "scale": "xscale" },
                        "y": { "field": "y", "scale": "yscale" },
                        "size": { "field": "max_count" },
                        "fill": { "scale": "c", "field": "avg" },
                        "opacity": { "value": 0.7 }
                    },
                    "update": { "fill": { "value": "#3182bd" } },
                    "hover": { "fill": { "value": "#de2d26" } }
                }
            }
        ]
    }
    return obj;
}

export const emptyData = [{}];

export const exampleData = [
    {
        "x": 10,
        "count": 4,
        "y": 1,
        "avg": -0.7691794871794873,
        "bin": "10-1"
    },
    {
        "x": 7,
        "count": 47,
        "y": 3,
        "avg": -0.22262878979615097,
        "bin": "7-3"
    },
    {
        "x": 5,
        "count": 81,
        "y": 5,
        "avg": 0.024842698432618247,
        "bin": "5-5"
    },
    {
        "x": 7,
        "count": 87,
        "y": 4,
        "avg": -0.1620306518934318,
        "bin": "7-4"
    },
    {
        "x": 8,
        "count": 129,
        "y": 3,
        "avg": -0.3137223068894132,
        "bin": "8-3"
    },
    {
        "x": 2,
        "count": 134,
        "y": 6,
        "avg": 0.25347102279676526,
        "bin": "2-6"
    },
    {
        "x": 6,
        "count": 134,
        "y": 4,
        "avg": -0.08338057890204376,
        "bin": "6-4"
    },
    {
        "x": 0,
        "count": 107,
        "y": 9,
        "avg": 0.9866570479974468,
        "bin": "0-9"
    },
    {
        "x": 1,
        "count": 60,
        "y": 7,
        "avg": 0.4625293634200852,
        "bin": "1-7"
    },
    {
        "x": 0,
        "count": 8,
        "y": 8,
        "avg": 0.6577156177156178,
        "bin": "0-8"
    },
    {
        "x": 3,
        "count": 122,
        "y": 5,
        "avg": 0.16171003623158423,
        "bin": "3-5"
    },
    {
        "x": 9,
        "count": 102,
        "y": 2,
        "avg": -0.4844763471822296,
        "bin": "9-2"
    },
    {
        "x": 3,
        "count": 12,
        "y": 6,
        "avg": 0.20461761949390814,
        "bin": "3-6"
    },
    {
        "x": 4,
        "count": 134,
        "y": 5,
        "avg": 0.08848013770094085,
        "bin": "4-5"
    },
    {
        "x": 9,
        "count": 32,
        "y": 1,
        "avg": -0.6743207050681278,
        "bin": "9-1"
    },
    {
        "x": 5,
        "count": 53,
        "y": 4,
        "avg": -0.024072480978141353,
        "bin": "5-4"
    },
    {
        "x": 8,
        "count": 5,
        "y": 2,
        "avg": -0.4016149184149184,
        "bin": "8-2"
    },
    {
        "x": 0,
        "count": 19,
        "y": 7,
        "avg": 0.561069807385597,
        "bin": "0-7"
    },
    {
        "x": 1,
        "count": 74,
        "y": 6,
        "avg": 0.34850528128878633,
        "bin": "1-6"
    }
]
