import { Component, ElementRef, ViewChild, AfterViewInit,
         Input, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import { Settings } from '../../../models';
import { BaseGraphComponent } from '../base-graph/base-graph.component';

interface BinnedZhang {
  x: number;
  count: number;
  y: number;
  avg: number;
  bin: string;
}

@Component({
  selector: 'app-similarity-scatter',
  encapsulation: ViewEncapsulation.Native,
  templateUrl: './similarity-scatter.component.html',
  styleUrls: ['./similarity-scatter.component.scss']
})

export class SimilarityScatterComponent extends BaseGraphComponent
    implements AfterViewInit {

    @ViewChild('simScatter') element: ElementRef;
    @Input() settings: Settings;
    @Input() binnedZhangData: BinnedZhang[] = Array();
    data: number[][] = Array();

    /* DOM Element */
    el: HTMLElement;

    /* bindings */
    brushable = false;
    brushData = [];
    binData = [];
    sort = true;

    /* config variables */
    noise = 2;
    yScale;
    xScale;
    yAxis;
    yAxisGroup;
    colorScale;

    brush;
    brushG;
    isBrushInit;

    isDataFiltered = false;
    isDrawBin;
    isDataReady = false;
    histData;
    histW = 0;
    histH = 0;
    histExtent;
    binG;
    simG;
    bins = 20;

    constructor() {
      super();
    }

    ngAfterViewInit() {
      super.ngAfterViewInit();
      this.bins = this.settings.hist2dBins;

      if (this.binnedZhangData && this.settings) {
        this.isDataNew = true;
        this.isDataReady = true;
        for (let i = 0; i < this.binnedZhangData.length; i++) {
            this.data[i] = [];
            this.data[i][0] = this.binnedZhangData[i].x;
            this.data[i][1] = this.binnedZhangData[i].y;
        }
      }

      this.init();
    }

    handleBackButton() {
      /* update filter flag in store, to zoom out */
    }

    filterData() {

    }

    unFilterData() {

    }

    init() {
      super.init();
    }

    /* called from parent */
    initAxis() {
      super.initAxis();

      this.yAxisGroup = this.svg.append('g')
        .attr('class', 'y axis');
    }

    /* called from parent */
    updateValues() {
      super.updateValues();

      /* '0' = graph noise | '2' = no noise | '4' = hist2d noise */
      if (this.isDataFiltered) {
        this.noise = this.sort ? 0 : 2;
      } else {
        this.noise = this.sort ? 4 : 2;
      }
    }

    /* called from parent */
    updateScales() {
      super.updateScales();

      /* reference to current component */
      let thisComp = this;

      /* define domain for y dimension, getting max [zhang score]*/
      let yDomain = d3.extent(this.binnedZhangData, function(d) { return d.y; });

      /* define domain for x dimension, getting max [horizontal position] */
      let xDomain = d3.extent(this.binnedZhangData, function(d) { return d.x; });

      if (this.isDataFiltered && this.data.length === 1) {
        yDomain = [this.data[0][1] - 0.05, this.data[0][1] + 0.05];
        xDomain = [this.data[0][thisComp.noise] - 1, this.data[0][thisComp.noise] + 1];
      } else if (!this.isDataFiltered) {
        yDomain = [-1, 1];
      }

      /* scale for y-dimension */
      this.yScale = d3.scaleLinear()
        .domain(yDomain)
        .range([this.gHeightPad * 1.1, 0]);

      /* scale for x-dimension */
      this.xScale = d3.scaleLinear()
        .domain(xDomain)
        .range([0, this.gWidthPad * 1]);

      /* scale to add colors to the chart */
      this.colorScale = d3.scaleLinear()
        .domain([1, 0.5, 0, -0.5, -1])
        .range(this.colors);
    }

    /* called from parent */
    updateGraph() {
      super.updateGraph();

      // draw Axis
      this.yAxis = d3
        .axisLeft(this.yScale)
        .tickSize(this.gWidth);

      this.yAxisGroup
        .attr('transform', 'translate(' +
          (this.gWidth + this.margin.left + 18) + ',' +
          (this.margin.top + this.padding.top) + ')')
        .call(this.yAxis);

      if (this.isDataFiltered) {
        this.updateSimpleGraph();
      } else {
        this.updateBinGraph();
      }

      this.isResizing = false;
    }

    updateBinGraph() {
      if (this.isDataNew) {
        this.binG = this.g.append('g')
          .attr('id', 'binG');
        this.simG = this.g.append('g')
          .attr('id', 'simG');
        this.drawBinGraph(this.binnedZhangData);
      } else {
        this.drawBinGraph(this.histData);
      }
    }

    drawBinGraph(hist: Array<BinnedZhang>) {
      // Break if hist is empty
      if (!hist.length) {
        return 0;
      }

      let thisComp = this;

      // if (this.isDataNew) {
      //   thisComp.fire('core-signal', { name: 'stop-loader' });
      //   this.$.back.classList.add('hide');
      // }

      this.histData = hist;
      this.histW = this.gWidthPad * 0.10;
      this.histH = this.gHeightPad * 0.10;

      this.histExtent = d3.extent(hist, function(d) { return d.count; });

      let radius = Math.min(this.histW, this.histH) / 3;
      let rScale = d3.scaleLinear()
        .domain(this.histExtent)
        .range([radius * 0.5, radius * 1.5]);

      let colorDomain = new Array(this.colors.length);
      for (let i = 0, ii = colorDomain.length; i < ii; i++) {
        colorDomain[i] = this.gHeightPad / (colorDomain.length - 1) * i;
      }
      this.colorScale.domain(colorDomain.reverse());

      this.binG.attr('transform', 'translate(' +
        (this.histW * 0.5) + ',' +
        (-this.histH * 0.5) + ')');

      this.simG.selectAll('circle').remove();

      /* define scatterplot circles */
      let circles = this.binG
        .selectAll('circle')
        .data(hist)
        .enter()
        .append('circle');

      circles
        .attr('r', function(d) { return rScale(d.count); })
        .attr('cx', function(d) { return thisComp.histW * d.x; })
        .attr('cy', function(d) { return thisComp.gHeightPad - (thisComp.histH * d.y); })
        .attr('fill', function(d) { return thisComp.colorScale(thisComp.histH * d.y); });

      circles.exit().remove();

      // requestAnimationFrame(this.updateTooltip.bind(this));

      if (this.brush && !this.isDrawBin) {
        this.brush.clear();
        this.brushData = [];
        this.brushG.remove();
        this.binData = [];
      }

      this.isDataNew = false;
      this.isDrawBin = true;
    }

    updateSimpleGraph () {
      let thisComp = this;

      this.binG.selectAll('circle').remove();

      let circles = this.simG.selectAll('circle')
        .data(this.data);

      circles.enter().append('circle');

      circles.attr('r', 4)
        .attr('cy', function(d) { return thisComp.yScale(d[1]); })
        .attr('cx', function(d) { return thisComp.xScale(d[thisComp.noise]); })
        .attr('fill', function(d) { return thisComp.colorScale(d[1]); })
        .classed('filtered', this.isDataFiltered);
      circles.exit().remove();

      if (this.brushable && !this.brush || this.isDrawBin) {
        this.brushData = [];
        this.initBrush();
        // this.$.back.classList.remove('hide');
      } else if (this.brushable) {
        this.updateBrush();
      }
      this.binData = this.data;
      this.isDataNew = false;
      this.isDrawBin = false;
    }

    initBrush() {
      this.brush = d3.brush();

      this.brushG = this.g.append('g')
        .attr('class', 'brush');
      this.updateBrush();
    }

    updateBrush() {
      let thisComp = this;
      let noise = thisComp.noise;

      this.brush
        .x(this.xScale)
        .y(this.yScale)
        .on('brush', function() {
          let e = thisComp.brush.extent();
          // [x0, y0], [x1, y1]​
          thisComp.g.selectAll('circle').classed('dimmed', function(d) {
            return e[0][0] > d[noise] || d[noise] > e[1][0] ||
                   e[0][1] > d[1]     || d[1]     > e[1][1];
          });
        })
        .on('brushend', function() {
          let e = thisComp.brush.extent();
          // [x0, y0], [x1, y1]​
          thisComp.brushData = thisComp.data.filter(function(d) {
            return e[0][0] <= d[noise] && d[noise] <= e[1][0] &&
                   e[0][1] <= d[1]     && d[1]     <= e[1][1];
          });
          if (thisComp.brush.empty()) {
            thisComp.g.selectAll('.dimmed').classed('dimmed', false);
            thisComp.brushData = [];
          }
        });
      if (this.isBrushInit) {
        this.g.selectAll('.dimmed').classed('dimmed', false);
        this.brush.clear();
        this.brushData = [];
      } else {
        this.isBrushInit = true;
      }
      this.brushG.call(this.brush);
    }
}
