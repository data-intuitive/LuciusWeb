import { Component, ElementRef, ViewChild,  AfterViewInit,
         Input, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import 'd3-color';
import 'd3-scale';

import { Settings, AnnotatedPlatewellid, Zhang } from '../../../models';

/* app colors definition */
const appColors = [
  d3.rgb(44, 123, 182),
  d3.rgb(171, 217, 233),
  d3.rgb(255, 255, 191),
  d3.rgb(253, 174, 97),
  d3.rgb(215, 25, 28)
];

@Component({
  selector: 'app-top-compounds-list',
  encapsulation: ViewEncapsulation.Native,
  templateUrl: './top-compounds-list.component.html',
  styleUrls: ['./top-compounds-list.component.scss']
})
export class TopCompoundsListComponent implements AfterViewInit {

  @ViewChild('topCompList') element: ElementRef;
  @Input() settings: Settings;
  @Input() annotatedPlatewellids: AnnotatedPlatewellid[] = Array();
  @Input() topPositiveCorrelations: Zhang[] = Array();
  @Input() topNegativeCorrelations: Zhang[] = Array();

  /* DOM Element */
  el: HTMLElement;

  /* config variables */
  isBrushEmpty = true;
  dataDetail = [];
  colors = [];
  colorScale;
  isInputReady = false;
  topcomp = 25;
  data = [];

  ngAfterViewInit() {
    this.el = this.element.nativeElement;
    this.colors = appColors;

    if (this.settings &&
        this.topPositiveCorrelations &&
        this.topNegativeCorrelations &&
        this.annotatedPlatewellids) {
          this.isInputReady = true;
    }

    if (this.isInputReady) {
      this.initData();
    }

    let host = d3.select(this.el);

    /* define colorscale */
    this.colorScale = d3.scaleLinear()
      .domain([1, 0.5, 0, -0.5, -1])
      .range(this.colors);

    /* hide sensitive information */
    if (this.settings.hiddenComps) {
      console.log('hide info!');
      // host.select('#list').classList.add('hideinfo');
      // host.select('#detail').classList.add('hideinfo');
    }
  }

  constructor() { }

  initData() {
    this.topcomp = this.settings.topComps;

    if (!this.isBrushEmpty) {
      // this.data = [
      //   {
      //     title: 'Selected coumpounds',
      //     type: ' ',
      //     model: json.result.slice(0, 100)
      //   }
      // ];
    } else {
      this.data = [
        {
          title: 'Top ' + this.topcomp + ' positive correlations',
          type: 'positive',
          model: this.topPositiveCorrelations
        },
        {
          title: 'Top ' + this.topcomp + ' negative correlations',
          type: 'negative',
          model: this.topNegativeCorrelations
        }
      ];
    }

  }

  handleOpenDialog (e, n, el) {
    // let dataFlat = [];
    // let id = +el.dataset.id + (+el.dataset.groupid * this.topcomp);

    // if (this.isBrushEmpty) {
    //   dataFlat = dataFlat.concat(this.data[0].model, this.data[1].model);
    // } else {
    //   dataFlat = this.data[0].model;
    // }
    //
    // this.dataDetail = dataFlat[id];
    // this.$.detail.open();
  }

  getColorValue(value) {
          if (value) {
            return this.colorScale(value);
          }
        }

  getRoundValue(value) {
    if (value) {
      // 'e3' ?
      return Number(Math.round(value) + 'e-3');
    }
  }

  sourireURL(value) {
    if (value) {
      return this.settings.sourireURL + '/molecule/' + encodeURIComponent(value);
    }
  }

}
