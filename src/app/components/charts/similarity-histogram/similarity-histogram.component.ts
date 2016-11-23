import { Component, ElementRef, ViewChild,  AfterViewInit,
         Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { Settings, TargetHistogram } from '../../../models';
import { BaseGraphComponent } from '../base-graph/base-graph.component';

@Component({
  selector: 'app-similarity-histogram',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./similarity-histogram.component.scss'],
  templateUrl: './similarity-histogram.component.html'
})

export class SimilarityHistogramComponent extends BaseGraphComponent
    implements AfterViewInit {

    @ViewChild('simHist') element: ElementRef;
    @Input() settings: Settings;
    @Input() similarityHistogramData: TargetHistogram;
    data: number[] = Array();

    /* DOM Element */
    el: HTMLElement;

    /* config variables */
    bins = 16;
    targetGene = '';
    geneData = [];
    dataBounds = [];

    yScale;
    xScale;
    yAxis;
    yAxisGroup;
    xAxis;
    xAxisGroup;
    yAxisScale;
    colorScale;
    barSelected;
    barSize = 0;
    barGap = 2;

    constructor() {
      super();
    }

    ngAfterViewInit() {
      super.ngAfterViewInit();
      this.bins = this.settings.hist2dBins;

      /* check store for targetGeneSelected flag */
      // if (targetGeneSelected)
        // this.targetGene = selectedGene;
      // else
        this.targetGene = '';

      /* check if data is passed successfully from parent component */
      if (this.similarityHistogramData) {
        this.dataBounds = this.similarityHistogramData.metadata.bounds;
        this.data = this.similarityHistogramData.data.zhang;
        this.geneData = this.targetGene.length ?
          this.similarityHistogramData[this.targetGene] : [];

        this.isDataNew = true;
        this.isDataReady = true;
      }
      this.init();
    }

    init() {
      super.init();
      // console.log('svg', this.svg);
    }

    initAxis() {
      super.initAxis();

      this.yAxis = d3.svg.axis();
      this.yAxisGroup = this.svg.append('g')
        .attr('class', 'y axis');
    }

    updateValues() {
      super.updateValues();

      /* calculate size of each bar, given gHeightPad and num of bins */
      this.barSize = Math.floor(this.gHeightPad / this.bins);
    }

    updateScales() {
      super.updateScales();

      let dataSize = this.data.length - 1;

      /* scale for y-Axis */
      this.yAxisScale = d3.scale.linear()
        .domain([1, -1])
        .range([0, this.gHeightPad]);

      /* scale for y-dimension */
      this.yScale = d3.scale.linear()
        .domain([0, dataSize])
        .range([0, this.gHeightPad]);

      /* scale for x-dimension */
      this.xScale = d3.scale.linear()
        .domain([0, d3.max(this.data)])
        .range([0, this.gWidthPad]);

      /* scale to add colors to the chart */
      this.colorScale = d3.scale.linear<d3.Rgb>()
        .domain([0, 0.25 * dataSize, 0.5 * dataSize, 0.75 * dataSize, dataSize])
        .range(this.colors);
    }

    updateGraph() {
      super.updateGraph();

      /* draw Axis */
      this.yAxis
        .scale(this.yAxisScale)
        .orient('right')
        .tickSize(this.gWidth);

      this.yAxisGroup
        .attr('transform', 'translate(' +
          this.margin.left + ',' +
          (this.margin.top + this.padding.top) + ')')
        .call(this.yAxis);

      /* draw graph element according to margins */
      this.g.attr('transform', 'translate(' +
        (this.margin.left + this.padding.left) + ',' +
        (this.margin.top + this.padding.top -
        (this.barSize / 2) + (this.barGap / 2)) + ')');

      /* Stop execution if data is not ready */
      if (!this.isDataReady) {
        console.log('Data is not ready!');
        return true;
      }

      /* reference to current component */
      let thisComp = this;

      function drawHistogram(selection, selector, fill) {
        selection.enter()
        .append('rect');

        selection.attr('class', selector)
          .attr('x', function(d) { return thisComp.gWidthPad - thisComp.xScale(d); })
          .attr('y', function(d, i) { return thisComp.yScale(i); })
          .attr('height', thisComp.barSize - thisComp.barGap)
          .attr('width', function(d) {
            return d > 0 ? thisComp.xScale(d) + thisComp.padding.left - 1 : 0;
          });

        if (fill) {
          selection
            .attr('fill', function(d, i) { return thisComp.colorScale(i); });
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
        // this.fire('core-signal', {
        //   name: 'filter-data',
        //   data: { bounds: this.dataBounds[i] }
        // });
        // TODO: Update Filter flag in store

        /* undo previous selection */
        if (this.barSelected) {
          d3.select(this.barSelected).classed('selected', false);
        }

        /* mark new selection */
        this.barSelected = this;
        d3.select(this.barSelected).classed('selected', true);
      });

      this.bg.on('click', function() {
        // this.fire('core-signal', {
        //   name: 'unfilter-data',
        //   data: null
        // });
        // TODO: Update UnFilter flag in store

        /* undo previous selection */
        if (this.barSelected) {
          d3.select(this.barSelected).classed('selected', false);
          this.barSelected = null;
        }
      });

      if (this.barSelected && this.targetGene) {
        d3.select(this.barSelected)
          .classed('selected', true);
      }
      this.isDataNew = false;
    }
}
