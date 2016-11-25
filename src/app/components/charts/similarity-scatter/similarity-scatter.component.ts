import { Component, ElementRef, ViewChild,  AfterViewInit,
         Input, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import { Settings, Zhang } from '../../../models';
import { BaseGraphComponent } from '../base-graph/base-graph.component';

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
    @Input() zhangData: Zhang[] = Array();
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

    isDataFiltered;
    isDrawBin;
    hist2d;
    histData: any[][] = Array();
    histW = 0;
    histH = 0;
    histExtent;
    binG;
    simG;
    bins = 20;

    constructor() {
      super();
      for (let i = 0; i < this.zhangData.length; i++) {
        this.data[i][0] = (this.zhangData[i].indexSorted);
        this.data[i][1] = (this.zhangData[i].zhangScore);
      }
      this.isDataNew = true;
    }

    ngAfterViewInit() {
      super.ngAfterViewInit();

      this.bins = this.settings.hist2dBins;
      this.init();
    }

    initAxis() {
      super.initAxis();

      this.yAxis = d3.svg.axis();
      this.yAxisGroup = this.svg.append('g')
        .attr('class', 'y axis');
    }

    init() {
      super.init();

      this.binG = this.g.append('g');
      this.simG = this.g.append('g');
    }

    updateValues() {
      super.updateValues();

      /* '0' = graph noise | '2' = no noise | '4' = hist2d noise */
      if (this.isDataFiltered) {
        this.noise = this.sort ? 0 : 2;
      } else {
        this.noise = this.sort ? 4 : 2;
      }
    }

    updateScales() {
      super.updateScales();

      /* reference to current component */
      let thisComp = this;

      /* d[1] = zhang score of each data element */
      let yDomain = d3.extent(this.data, function(d) { return d[1]; });

      /* get noise value */
      let xDomain = d3.extent(this.data, function(d) { return d[thisComp.noise]; });

      if (this.isDataFiltered && this.data.length === 1) {
        yDomain = [this.data[0][1] - 0.05, this.data[0][1] + 0.05];
        xDomain = [this.data[0][thisComp.noise] - 1, this.data[0][thisComp.noise] + 1];
      } else if (!this.isDataFiltered) {
        yDomain = [-1, 1];
      }

      /* scale for y-dimension */
      this.yScale = d3.scale.linear()
        .domain(yDomain)
        .range([this.gHeightPad, 0]);

      /* scale for x-dimension */
      this.xScale = d3.scale.linear()
        .domain(xDomain)
        .range([0, this.gWidthPad]);

      /* scale to add colors to the chart */
      this.colorScale = d3.scale.linear()
        .domain([1, 0.5, 0, -0.5, -1])
        .range(this.colors);
    }

    updateGraph() {
      super.updateGraph();

      // draw Axis
      this.yAxis
        .scale(this.yScale)
        .orient('left')
        .tickSize(this.gWidth);

      this.yAxisGroup
        .attr('transform', 'translate(' +
          (this.gWidth + this.margin.left) + ',' +
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
        // create Hist2D
        // this.hist2d = d3.hist2d()
        //   .bins(this.bins)
        //   .indices([this.noise, 1])
        //   .domain([this.xScale.domain(), this.yScale.domain()])
        //   (this.data, this.drawBinGraph.bind(this));
      } else {
        this.drawBinGraph(this.histData);
      }
    }

    drawBinGraph(hist: Array<Array<any>>) {
      let thisComp = this;

      // if (this.isDataNew) {
      //   thisComp.fire('core-signal', { name: 'stop-loader' });
      //   this.$.back.classList.add('hide');
      // }

      this.histData = hist;

      this.hist2d.size([this.gWidthPad, this.gHeightPad]);
      this.histW = this.hist2d.size()[0];
      this.histH = this.hist2d.size()[1];

      this.histExtent = d3.extent(hist, function(d) { return d.length; });

      let radius = Math.min(this.histW, this.histH) / 2;
      let rScale = d3.scale.linear()
        .domain(this.histExtent)
        .range([radius * 0.4, radius * 1.6]);

      let colorDomain = new Array(this.colors.length);
      for (let i = 0, ii = colorDomain.length; i < ii; i++) {
        colorDomain[i] = this.gHeightPad / (colorDomain.length - 1) * i;
      }
      this.colorScale.domain(colorDomain.reverse());

      this.binG.attr('transform', 'translate(' +
        (this.histW * 0.5) + ',' +
        (-this.histH * 0.5) + ')');

      this.simG.selectAll('circle').remove();

      let circles = this.binG.selectAll('circle')
        .data(hist);

      circles.enter().append('circle');

      circles
        .attr('r', function(d) { return rScale(d.length); })
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
      this.brush = d3.svg.brush();

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
