export const histogramVegaSpec = (data) => ({
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
            },
            {
                "type": "formula",
                "as": "isNull",
                "expr": "datum['average_avg'] == 0"
            }
        ]
    }],
    "signals": [{
        "name": "tooltip",
        "value": {},
        "on": [{
                "events": "rect:mouseover",
                "update": "datum"
            },
            {
                "events": "rect:mouseout",
                "update": "{}"
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
            "range": "height",
            "domainMax": 1.0,
            "domainMin": -1.0

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
        },
        {
            "name": "nullScale",
            "type": "ordinal",
            "domain": {
                "data": "table",
                "field": "isNull",
                "sort": true
            },
            "range": [2, 0],
        }
    ],
    "axes": [{
            "orient": "bottom",
            "scale": "xscale",
            "ticks": true,
            "labels": true,
            "domain": false,
            "title": "Bin size",
            "titleColor": "grey"
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
            },
            "title": "Zhang Score",
            "titleColor": "grey"
        }
    ],
    "marks": [{
            "type": "rect",
            "name": "bars",
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
                        "scale": "nullScale",
                        "field": "isNull"
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
        },
        {
            "type": "text",
            "encode": {
                "enter": {
                    "fill": {
                        "value": "#333"
                    }
                },
                "update": {
                    "x": {
                        "scale": "xscale",
                        "signal": "tooltip.total_count",
                        "offset": 10
                    },
                    "y": {
                        "scale": "yscale",
                        "signal": "tooltip.y",
                        "band": 0.5,
                        "offset": 1.5
                    },
                    "text": {
                        "signal": "tooltip.total_count"
                    },
                    "baseline": {
                        "value": "middle"
                    },
                    "fillOpacity": [{
                            "test": "datum === tooltip",
                            "value": 0
                        },
                        {
                            "value": 1
                        }
                    ]
                }
            }
        }
        // {
        //     "type": "text",
        //     "from": {
        //         "data": "bars"
        //     },
        //     "encode": {
        //         "enter": {
        //             "x": {
        //                 "field": "x2",
        //                 "offset": -5
        //             },
        //             "y": {
        //                 "field": "y",
        //                 "offset": {
        //                     "field": "height",
        //                     "mult": 0.5
        //                 }
        //             }
        //         },
        //         "update": {
        //             "fontSize": {
        //                 "value": 10
        //             },
        //             "fill": {
        //                 "value": "white"
        //             },
        //             "align": {
        //                 "value": "right"
        //             },
        //             "baseline": {
        //                 "value": "middle"
        //             },
        //             "text": {
        //                 "field": "datum.total_count"
        //             }
        //         }
        //     }
        // }
    ],
    "title": {
        "text": "Similarity Histogram",
        "anchor": "middle",
        "color": "grey"
    }
})