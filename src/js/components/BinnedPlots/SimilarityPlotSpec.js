export const similarityPlotVegaSpec = (data) => ({
    "$schema": "https://vega.github.io/schema/vega/v3.0.json",
    "autosize": { "type": "fit", "resize": true },

    "data": [{
        "name": "table",
        "values": data,
        "format": {
            "type": "json",
            "parse": { "count": "number", "avg": "number" }
        }
    }],

    "signals": [{
        "name": "tooltip",
        "value": {},
        "on": [
            { "events": "rect:mouseover", "update": "datum" },
            { "events": "rect:mouseout", "update": "{}" }
        ]
    }],

    "scales": [{
            "name": "xscale",
            "domain": { "data": "table", "field": "x" },
            "range": "width"
        },
        {
            "name": "yscale",
            "domain": { "data": "table", "field": "avg" },
            "range": "height"
        },
        {
            "name": "yscale2",
            "domain": { "data": "table", "field": "avg" },
            "nice": true,
            "range": "height",
            "domainMax": 1.0,
            "domainMin": -1.0
        },
        {
            "name": "sizeScale",
            "type": "linear",
            "range": [0, 500],
            "domain": { "data": "table", "field": "count" }
        },
        {
            "name": "color",
            "type": "sequential",
            "nice": true,
            "domain": { "data": "table", "field": "avg" },
            "range": { "scheme": "redblue" }
        }
    ],

    "axes": [{
            "orient": "bottom",
            "scale": "xscale",
            "domain": false,
            "ticks": true,
            "labels": true,
            "encode": {
                "labels": {
                    "update": {
                        "fill": { "value": "grey" }
                    }
                }
            },
            "title": "Bin Index",
            "titleColor": "grey"
        },
        {
            "orient": "left",
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
        "type": "symbol",
        "from": { "data": "table" },
        "encode": {
            "enter": {
                "shape": { "value": "circle" },
                "size": { "scale": "sizeScale", "field": "count" },
                "x": { "scale": "xscale", "field": "x" },
                "y": { "scale": "yscale2", "field": "avg" }
            },
            "update": {
                "fill": { "scale": "color", "field": "avg" },
                "fillOpacity": { "value": 0.7 },
                "strokeWidth": { "value": 2 },
                "stroke": { "scale": "color", "field": "avg" }
            },
            "hover": {
                "fill": { "value": "white" },
                "fillOpacity": { "value": 0.5 },
                "stroke": { "value": "grey" }
            }
        }
    }],
    "title": {
        "text": "Similarity Plot",
        "anchor": "middle",
        "color": "grey"
    }
})