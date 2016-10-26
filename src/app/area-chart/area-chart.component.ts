import { Component } from '@angular/core';
import { ElementRef, SimpleChange, OnChanges, ViewChild,
         AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { Settings } from '../models/settings';

import * as d3 from 'd3';

@Component({
  selector: 'app-chart-area',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./area-chart.component.scss'],
  templateUrl: './area-chart.component.html'
})

export class AreaChartComponent implements  AfterViewInit {
    graphData: Array<Number>;
    data: Array<number>;
    width: string;
    height: string;
    @ViewChild('container') element: ElementRef;
    @Input() settings: Settings;
    private el: HTMLElement;
    // private margin =  {top: 16, right: 48, bottom: 16, left: 8};
    // private padding = {top: 16, right: 24, bottom: 16, left: 24};
    private divs: any;
    private bins = 16;

    constructor() {
    }

    ngAfterViewInit() {
      this.el = this.element.nativeElement;
      this.setup();
    }

    setup() {
      this.bins = this.settings.hist2dBins;

      let dataset = [5, 10, 15, 20, 25];
      let w = 400;
      let h = 200;

      let svg = d3.select(this.el).append('svg')
        .attr('width', w)
        .attr('height', h);

      let yScale = d3.scale.linear()
         .domain([0, d3.max(dataset) * 1.1])
         .range([0, h]);

      svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d, i) {
          return d * 5;
        })
        .attr('y', function(d) {
          return h - yScale(d);
        })
        .attr('width', 20)
        .attr('height', function(d) {
          return yScale(d);
        });
    }

  //   setup() {
  //     let graph: any = d3.select(this.el);            // D3 chart container
  //
  //     // setup the graph
  //     this.divs = graph
  //       .append('div')
  //       .attr({
  //         'class': 'chart'
  //       })
  //       .style({
  //         'width': this.width + 'px',
  //         'height': this.height + 'px',
  //       })
  //       .selectAll('div');
  //   }
  //
  //   // Render the D3 Bar Chart
  //   __render(newValue: any): void   {
  //     if ( !newValue ) {
  //       return;
  //     }
  //
  //   // join the data,then chain styles and bar text ... all the usual suspects
  //   this.divs.data(newValue).enter().append('div')
  //     .transition().ease('elastic')
  //     .style('width', (d: any) => d + '%')
  //     .text( (d: any) => d + '%');
  // }
  //
  // // update render on change
  // ngOnChanges( changes: { [propertyName: string]: SimpleChange } ): void {
  //   this.__render( this.data );
  // }
}
