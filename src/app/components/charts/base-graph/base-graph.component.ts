import { Component, ViewChild,
         ElementRef, AfterViewInit } from '@angular/core';

import * as d3 from 'd3';
import 'd3-color';

/* app colors definition */
const appColors = [
  d3.rgb(44, 123, 182),
  d3.rgb(171, 217, 233),
  d3.rgb(255, 255, 191),
  d3.rgb(253, 174, 97),
  d3.rgb(215, 25, 28)
];

@Component({
  selector: 'app-base-graph',
  templateUrl: './base-graph.component.html',
  styleUrls: ['./base-graph.component.scss']
})

export class BaseGraphComponent implements AfterViewInit {
    @ViewChild('base') element: ElementRef;
    el: HTMLElement;

    /* svg */
    svg: any;
    bg: any;
    g: any;

    /* checks before drawing graph */
    isActive = false;
    isInit = false;
    isDataReady = false;
    isDataNew = false;
    isResizing = false;

    /* measurements */
    gWidth = 0;
    gHeight = 0;
    gWidthPad = 0;
    gHeightPad = 0;
    offsetHeight;
    offsetWidth;

    /* config */
    margin =  {top: 16, right: 48, bottom: 16, left: 8};
    padding = {top: 16, right: 24, bottom: 16, left: 24};
    colors = [];

    constructor() {
    }

    ngAfterViewInit() {
      this.el = this.element.nativeElement;
      // init vars
      this.colors = appColors;
    }

    init() {
      this.svg = d3.select(this.el)
        .append('svg');

      // append Background - z:1
      this.bg = this.svg
        .append('rect')
        .attr('class', 'bg');

      // append Axis - z:2
      this.initAxis();

      //  append Group - z:3
      this.g = this.svg.append('g');

      // perform updates
      this.updateValues();
      this.updateScales();
      this.updateGraph();

      // init finished
      this.isInit = true;
    }

    initAxis() {
      // add common functionality here
      // call super(); in sub-component
    }

    updateValues() {
      // add common functionality here
      // call super(); in sub-component

      this.offsetWidth = this.el.offsetWidth;
      this.offsetHeight = 2 * this.el.offsetHeight;

      // calculate svg dimensions
      this.gWidth = this.offsetWidth - this.margin.left - this.margin.right;
      this.gWidthPad = Math.round(
        this.gWidth - this.padding.left - this.padding.right);
      this.gHeight = this.offsetHeight - this.margin.top - this.margin.bottom;
      this.gHeightPad = Math.round(
        this.gHeight - this.padding.top - this.padding.bottom);

      // apply to svg element
      this.svg
        .attr('width', this.offsetWidth)
        .attr('height', this.offsetHeight);
    }

    initConfig() {
      // add common functionality here
      // call super(); in sub-component
    }

    updateScales() {
      // add common functionality here
      // call super(); in sub-component
    }

    updateGraph() {
      // add common functionality here
      // call super(); in sub-component

      // draw Background element according to margins
      this.bg
       .attr('width', this.gWidth)
       .attr('height', this.gHeight)
       .attr('transform', 'translate(' +
         this.margin.left + ', ' +
         this.margin.top + ')');

      // draw Graph element according to margins
      this.g.attr('transform', 'translate(' +
        (this.margin.left + this.padding.left) + ',' +
        (this.margin.top + this.padding.top) + ')');
    }
}
