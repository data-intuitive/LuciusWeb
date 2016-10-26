import { Component } from '@angular/core';
import { ElementRef, SimpleChange, OnChanges, ViewChild,
         AfterViewInit, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { Settings } from '../../models/settings';
import { KnownTargets } from '../../models/known-targets';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ManipulateDataService } from '../../services/manipulate-data.service';
import * as fromRoot from '../../reducers';

import * as d3 from 'd3';

@Component({
  selector: 'app-known-targets-hist',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./known-targets-histogram.component.scss'],
  templateUrl: './known-targets-histogram.component.html'
})

export class KnownTargetsHistogramComponent implements  AfterViewInit, OnInit {
    graphData: Array<Number>;
    data: Array<number>;
    width: string;
    height: string;
    @ViewChild('container') element: ElementRef;
    @Input() settings: Settings;
    private el: HTMLElement;
    private margin =  {top: 16, right: 48, bottom: 16, left: 8};
    private padding = {top: 16, right: 24, bottom: 16, left: 24};
    private divs: any;
    knownTargets: KnownTargets;
    knownTargetsFetched$: Observable<boolean>;
    dataset: Array<{name: string, value: number}>;
    datasetNames: Array<string>;
    datasetValues: Array<number>;

    constructor(private store: Store<fromRoot.State>,
    private manipulateDataService: ManipulateDataService) {
      this.knownTargetsFetched$ = this.store.let(fromRoot.getKnownTargetsFetched);
      this.dataset = [];
      this.datasetNames = [];
      this.datasetValues = [];
    }

    ngOnInit() {
      this.knownTargetsFetched$
        .subscribe(ev => {if (ev) {
          this.knownTargets = this.manipulateDataService
            .getData('knownTargets');
            for (let i = 0; i < (this.knownTargets.result.length); i++) {
              this.dataset.push({name: this.knownTargets.result[i][0], value: +this.knownTargets.result[i][1]});
              this.datasetNames.push(this.knownTargets.result[i][0]);
              this.datasetValues.push(+this.knownTargets.result[i][1]);
            }
            this.setup();
          }
    });
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
            return xScale(d.name);
          })
          .attr('y', function(d) {
            return h - yScale(d.value);
          })
          .attr('width', 20)
          .attr('height', function(d) {
            return yScale(d.value);
        });
    }
}
