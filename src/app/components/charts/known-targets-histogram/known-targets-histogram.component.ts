import { Component, ElementRef, ViewChild,  AfterViewInit,
         Input, ViewEncapsulation, OnInit } from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-known-targets-hist',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./known-targets-histogram.component.scss'],
  templateUrl: './known-targets-histogram.component.html'
})

export class KnownTargetsHistogramComponent implements  AfterViewInit, OnInit {
    @Input() targetHistData = Array();
    @Input() compoundSelected: string;
    @ViewChild('knownTargetsHist') element: ElementRef;

    /* DOM Element */
    el: HTMLElement;

    /* config variables */
    brushdata = [];
    bindata = [];

    hasCompound = false;
    showCompound = false;
    showTargetGene = false;
    targetGene = '';
    compound = '';
    pwids = '';
    pwidsComp = '';
    empty = false;
    numBars = 48;

    ngOnInit() {
      this.empty = this.targetHistData.length === 0;
    }

    constructor() {
    }

    ngAfterViewInit() {
      this.el = this.element.nativeElement;

      /* check if data is passed successfully from parent component */
      if (this.targetHistData) {
        let data = [];
        if (this.targetHistData.length < 48) {
          this.numBars = this.targetHistData.length;
        }
        for (let i = 0 ; i < this.numBars; i++) {
          data[i] = [];
          data[i][0] = this.targetHistData[i]['gene'];
          data[i][1] = this.targetHistData[i]['frequency'];
        }
      this.init(data);
      }
    }

    init(data) {
        this.updateGraph(data);
      }

    updateGraph(data) {
      let host = d3.select(this.el);
      let wordsColumns = 4;
      let boxHeight = 32;
      let boxWidth = Math.floor(100 / wordsColumns) + '%';

      let domainMax = data.length ? data[0][1] : 10;
      let xScale = d3.scale.linear()
        .domain([1, domainMax])
        .range([1, 100]);

      let words = host.select('#words');
      let box = words.selectAll('.box')
        .data(data);

      box.enter().append('div');

      box
        .attr('class', 'box')
        .style('height', boxHeight + 'px')
        .style('width',  boxWidth)
        .html(function(d) {
          return '<div class="word">' + d[0] +
                 '</div><div class="bar"><span class="bar" style="width:' +
                 xScale(d[1]) + '%"></span><span class="num">' +
                 d[1] + '</span></div>';
        });
      let prevSelection;
      let thisComp = this;

      box.on('click', function(d) {
        thisComp.targetGene = d[0];
        thisComp.showTargetGene = true;

        d3.select(this).classed('selected', true);
        d3.select(prevSelection).classed('selected', false);
        prevSelection = this;

        // thisComp.fire('core-signal', {
        //   name: 'update-hist-data',
        //   data: thisComp.targetGene
        // });
      });

      box.exit().remove();

      if (!this.empty) {
        // Height of #words must be a multiple of the columns + 32px of padding
        let wordsHeight = Math.ceil(data.length / wordsColumns) * boxHeight + 32;
        words.style('height', wordsHeight + 'px');
      } else {
        words.style('height', 'inherit');
      }
    }
}
