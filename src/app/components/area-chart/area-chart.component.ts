import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss']
})

export class AreaChartComponent implements OnInit, AfterViewInit {
    dataset = [ 5, 10, 15, 20, 25, 40 ];
    w = 400;
    h = 200;
    mult = 8;
    private host;
    private htmlElement: HTMLElement;
    @ViewChild('container') element: ElementRef;

    constructor() {
    }

    ngAfterViewInit() {
      this.htmlElement = this.element.nativeElement;
      this.host = d3.select(this.htmlElement);
    }

    ngOnInit() {
      let svg = d3.select('#chartArea').append('svg')
        .attr('wdith', this.w)
        .attr('height', this.h);

      // let yScale = d3.scale.linear()
      //   .domain([0, 50])
      //   .range([0, this.h]);

      svg.selectAll('rect')
        .data(this.dataset)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d, i) {
          return i * 22;
        })
        .attr('y', function(d) {
          return this.h - 5 * d;
        })
        .attr('width', 20)
        .attr('height', function(d) {
          return d * 8;
        });
       }
}
