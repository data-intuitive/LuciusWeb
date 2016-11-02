import { Component } from '@angular/core';
import { ElementRef, SimpleChange, OnChanges, ViewChild,
         ViewEncapsulation, Input, OnInit } from '@angular/core';
import { Settings } from '../models/settings';

import * as d3 from 'd3';

@Component({
  selector: 'app-chart-area',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./area-chart.component.scss'],
  templateUrl: './area-chart.component.html'
})

export class AreaChartComponent implements   OnInit {
    @ViewChild('container') element: ElementRef;
    @Input() settings: Settings;
    @Input() data: Array<number>;

    private el: HTMLElement;

    /* svg */
    private svg: any;
    private bg: any;
    private g: any;

    /* checks before drawing graph */
    isActive = false;
    isInit = false;
    isDataReady = false;
    isDataNew = false;
    isResizing = false;

    /* measurements */
    private gWidth = 0;
    private gHeight = 0;
    private gWidthPad = 0;
    private gHeightPad = 0;

    /* config */
    private margin =  {top: 16, right: 48, bottom: 16, left: 8};
    private padding = {top: 16, right: 24, bottom: 16, left: 24};
    private colors: Array<any>;
    private bins = 16;
    private targetGene= '';
    private geneData: Array<any>;
    private dataBounds: Array<any>;
    private yScale: any;
    private xScale: any;
    private yAxis: any;
    private yAxisGroup: any;
    private xAxis: any;
    private xAxisGroup: any;
    private colorScale: any;
    private barSelected: any;
    private barSize= 0;
    private barGap= 2;

    constructor() {
    }

    ngOnInit() {
      this.el = this.element.nativeElement;
      this.bins = this.settings.hist2dBins;
      // this.colors = app.colors;
      this.init();
    }

    init() {
      this.svg = d3.select(this.el).append('svg');
      // console.log(this.svg);

      // append Background // z:1
      this.bg = this.svg.append('rect')
        .attr('class', 'bg');

      // append Axis // z:2
      this.initAxis();

      //  append Group  z:3
      this.g = this.svg.append('g');

      // init finished
      this.isInit = true;
    }

    initAxis() {
      this.yAxis = d3.svg.axis();
      this.yAxisGroup = this.svg.append('g')
            .attr('class', 'y axis');
    }

  updateValues() {
    // this.gWidth = this.offsetWidth - this.margin.left - this.margin.right;
    // this.gWidthPad = Math.round(this.gWidth - this.padding.left - this.padding.right);
    // this.gHeight = this.offsetHeight - this.margin.top - this.margin.bottom;
    // this.gHeightPad = Math.round(this.gHeight - this.padding.top - this.padding.bottom);
    // this.svg
    //   .attr('width', this.offsetWidth)
    //   .attr('height', this.offsetHeight);

    this.barSize = Math.floor(this.gHeightPad / this.bins);
  }

    updateScales() {
      let dataSize = this.data.length - 1;
      this.yScale = d3.scale.linear()
        .domain([1, -1])
        .range([0, this.gHeightPad]);
      this.yScale = d3.scale.linear()
        .domain([0, dataSize])
        .range([0, this.gHeightPad]);
      this.xScale = d3.scale.linear()
        .domain([0, d3.max(this.data)])
        .range([0, this.gWidthPad]);
      this.colorScale = d3.scale.linear()
        .domain([0, 0.25 * dataSize, 0.5 * dataSize, 0.75 * dataSize, dataSize])
        .range(this.colors);
    }

    updateGraph() {
      // draw Background
      this.bg
        .attr('width', this.gWidth)
        .attr('height', this.gHeight)
        .attr('transform', 'translate(' +
          this.margin.left + ', ' +
          this.margin.top + ')');

      // draw Axis
      this.yAxis.scale(this.yScale)
        .orient('right')
        .tickSize(this.gWidth);
      this.yAxisGroup
        .attr('transform', 'translate(' +
          this.margin.left + ',' +
          (this.margin.top + this.padding.top) + ')')
        .call(this.yAxis);

      // draw graph
      this.g.attr('transform', 'translate(' +
        (this.margin.left + this.padding.left) + ',' +
        (this.margin.top + this.padding.top - (this.barSize / 2) + (this.barGap / 2)) + ')');

      // Stop execution if data is not ready
      if (!this.isDataReady) {
        return true;
      }

      function drawHistogram(selection, selector, fill) {
        selection.enter().append('rect');
        selection.attr('class', selector)
          .attr('x', function(d) { return this.gWidthPad - this.xScale(d); })
          .attr('y', function(d, i) { return this.yScale(i); })
          .attr('height', this.barSize - this.barGap)
          .attr('width', function(d) {
            return d > 0 ? this.xScale(d) + this.padding.left - 1 : 0;
          });
        if (fill) {
          selection
            .attr('fill', function(d, i) { return this.colorScale(i); });
        }
        selection.exit().remove();
      }
      if (this.geneData.length) {
        this.g.selectAll('.genebar')
          .data(this.geneData)
          .call(drawHistogram, 'genebar', false);
      } else {
        this.g.selectAll('.genebar').remove();
      }
      let bars = this.g.selectAll('.bar')
        .data(this.data)
        .call(drawHistogram, 'bar', true);
      bars.on('mouseover', function() {
        d3.select(this).classed('hover', true);
      });
      bars.on('mouseout', function() {
        d3.select(this).classed('hover', false);
      });
      bars.on('click', function(d, i) {
        this.fire('core-signal', {
          name: 'filter-data',
          data: { bounds: this.dataBounds[i] }
        });
        if (this.barSelected) {
          d3.select(this.barSelected).classed('selected', false);
        }
        this.barSelected = this;
        d3.select(this.barSelected).classed('selected', true);
      });
      this.bg.on('click', function() {
        this.fire('core-signal', {
          name: 'unfilter-data',
          data: null
        });
        if (this.barSelected) {
          d3.select(this.barSelected).classed('selected', false);
          this.barSelected = null;
        }
      });
      if (this.barSelected && this.targetGene) {
        d3.select(this.barSelected).classed('selected', true);
      }
      this.isDataNew = false;
    }
}
