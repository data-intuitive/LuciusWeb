export const CorrelationVegaSpec = (data) => ({
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "autosize": { "type": "fit", "resize": true },
  "data": [
    {
      "name": "table",
      "format": {
        "type": "json",
        "parse": {
          "count" : "number",
          "x_bin_start" : "number",
          "x_bin_end" : "number",
          "y_bin_start" : "number",
          "y_bin_end" : "number"
        }
      },
      "values": data
    }
  ],
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
  "marks": [
    {
      "name": "marks",
      "type": "rect",
      "style": ["bar"],
      "from": {"data": "table"},
      "encode": {
        "enter": {
          "x": {"scale": "x", "field": "x_bin_start", "offset": 2},
          "x2": {"scale": "x", "field": "x_bin_end", "offset": -2},
          "y": {"scale": "y", "field": "y_bin_start", "offset" : -2},
          "y2": {"scale": "y", "field": "y_bin_end", "offset": 2},
          "fill": {"scale": "color", "field" : "count"},
          "tooltip": {
            "signal": "{'Count': datum.count}"
          }
        },
                "update": {
          "fill": {"scale": "color", "field": "count"},
          "fillOpacity": {"value": 0.7},
          "strokeOpacity" : {"value" : 0.8},
          "strokeWidth": {"value": 3},
          "stroke": {"scale": "color", "field": "count"}
        },
        "hover": {
          "fill": {"scale": "color", "field": "count"},
          "fillOpacity": {"value": 0.2},
          "strokeOpacity" : {"value" : 0.4},
          "strokeWidth": {"value": 3},
          "stroke": {"scale": "color", "field": "count"}
        }
      }}
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "domain": [-1, 1],
      "zero": true,
      "range": "width"
    },
    {
      "name": "y",
      "type": "linear",
      "domain": [-1, 1],
      "zero": true,
      "range" : "height"
    },
    {
      "name": "color",
      "type": "linear",
      "domain": {"data": "table", "field": "count"},
      "range": "ramp"
    }
  ],
  "axes": [
    {
      "scale": "x",
      "orient": "bottom",
      "grid": true,
      "zindex": -1,
      "domain" : false,
      "encode": {
          "labels": {
              "update": {
                  "fill": { "value": "grey" }
              }
          }
      }
    },
    {
      "scale": "y",
      "orient": "left",
      "grid": true,
      "zindex": -1,
      "domain" : false,
      "encode": {
          "labels": {
              "update": {
                  "fill": { "value": "grey" }
              }
          }
      }
    }
  ]
})

