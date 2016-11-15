import { Component } from '@angular/core';
import { ElementRef, ViewChild,
         AfterViewInit, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { HandleDataService } from '../../../services/handle-data.service';
import * as fromRoot from '../../../reducers';
import { Settings } from '../../../models/settings';

import * as d3 from 'd3';

@Component({
  selector: 'app-known-targets-hist',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./known-targets-histogram.component.scss'],
  templateUrl: './known-targets-histogram.component.html'
})

export class KnownTargetsHistogramComponent implements  AfterViewInit, OnInit {
    graphData: number[] = Array();
    data: number[] = Array();
    width: string;
    height: string;
    @ViewChild('container') element: ElementRef;
    @Input() settings: Settings;
    private el: HTMLElement;
    // private margin =  {top: 16, right: 48, bottom: 16, left: 8};
    // private padding = {top: 16, right: 24, bottom: 16, left: 24};
    // private divs: any;
    dataset: {gene: string, frequency: number}[] = Array();
    datasetNames: string[] = Array();
    datasetValues: number[] = Array();

    constructor(private store: Store<fromRoot.State>,
                private handleDataService: HandleDataService) {
      this.dataset = [];
      this.datasetNames = [];
      this.datasetValues = [];
    }

    ngOnInit() {
      this.setup();
    }

    ngAfterViewInit() {
      this.el = this.element.nativeElement;
    }

    setup() {
      let w = 400;
      let h = 200;

      let svg = d3.select(this.el).append('svg')
        .attr('width', w)
        .attr('height', h);

      let yScale = d3.scale.linear()
       .domain([0, d3.max(this.datasetValues) * 1.1])
       .range([0, h]);

      let xScale = d3.scale.ordinal()
        .domain(this.datasetNames)
        .rangeBands([0 , w], 0.1);

      svg.selectAll('rect')
        .data(this.dataset)
        .enter()
        .append('rect')
          .attr('class', 'bar')
          .attr('x', function(d) {
            return xScale(d.gene);
          })
          .attr('y', function(d) {
            return h - yScale(d.frequency);
          })
          .attr('width', 20)
          .attr('height', function(d) {
            return yScale(d.frequency);
        });
    }
}
