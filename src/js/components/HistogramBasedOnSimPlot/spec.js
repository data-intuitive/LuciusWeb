export const vegaSpec = (data) => ({
    "$schema": "https://vega.github.io/schema/vega/v3.0.json",
    "autosize": {
        "type": "fit",
        "resize": true
    },
    "data": [{
        "name": "table",
        "values": data,
        "format": {
            "type": "json",
            "parse": {
                "count": "number",
                "avg": "number",
                "x": "number",
                "y": "number",
                "bin": "string"
            }
        },
        "transform": [{
                "type": "aggregate",
                "groupby": [
                    "y"
                ],
                "fields": ["count", "avg"],
                "ops": ["sum", "average"],
                "as": [
                    "total_count",
                    "average_avg"
                ]
            },
            {
                "type": "collect",
                "sort": {
                    "field": "y",
                    "order": "descending"
                }
            }
        ]
    }],
    "scales": [{
            "name": "xscale",
            "domain": {
                "data": "table",
                "field": "total_count"
            },
            "type": "linear",
            "range": "width"
        },
        {
            "name": "yscale",
            "type": "band",
            "domain": {
                "data": "table",
                "field": "y"
            },
            "range": "height"
        },
        {
            "name": "yscale2",
            "domain": { "data": "table", "field": "average_avg" },
            "nice": true,
            "range": "height"
        },
        {
            "name": "color",
            "type": "sequential",
            "nice": true,
            "domain": {
                "data": "table",
                "field": "average_avg"
            },
            "range": {
                "scheme": "redblue"
            }
        }
    ],
    "axes": [{
            "orient": "bottom",
            "scale": "xscale",
            "ticks": false,
            "labels": false,
            "domain": false,
            // "encode": {
            //     "labels": {
            //         "update": {
            //             "fill": {
            //                 "value": "grey"
            //             }
            //         }
            //     }
            // }
        },
        {
            "orient": "right",
            "scale": "yscale2",
            "offset": 20,
            "domain": false,
            "labels": true,
            "grid": true,
            "encode": {
                "labels": {
                    "update": {
                        "fill": { "value": "grey" }
                    }
                }
            }
        }
        // {
        //     "orient": "left",
        //     "scale": "yscale",
        //     "domain": false,
        //     "labels": false,
        //     "grid": false,
        //     "ticks": false
        // }
    ],
    "marks": [{
        "type": "rect",
        "from": {
            "data": "table"
        },
        "encode": {
            "enter": {
                "x": {
                    "scale": "xscale",
                    "field": "total_count",
                    "offset": 0
                },
                "x2": {
                    "scale": "xscale",
                    "value": 0
                },
                "y": {
                    "scale": "yscale",
                    "field": "y",
                    "offset": 3
                },
                "height": {
                    "scale": "yscale",
                    "band": 1,
                    "offset": -3
                },
                "fillOpacity": {
                    "value": 0.9
                }
            },
            "update": {
                "fill": {
                    "scale": "color",
                    "field": "average_avg"
                },
                "fillOpacity": {
                    "value": 0.7
                },
                "strokeWidth": {
                    "value": 2
                },
                "stroke": {
                    "scale": "color",
                    "field": "average_avg"
                }
            },
            "hover": {
                "fill": {
                    "value": "white"
                },
                "fillOpacity": {
                    "value": 0.5
                },
                "stroke": {
                    "value": "grey"
                }
            }
        }
    }]
})

export const emptyData = [{}];

export const exampleData = [{
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