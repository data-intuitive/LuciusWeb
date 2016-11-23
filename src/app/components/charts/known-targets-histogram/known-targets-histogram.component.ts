import { Component, ElementRef, ViewChild,  AfterViewInit,
         Input, ViewEncapsulation } from '@angular/core';

import { TargetHistogram } from '../../../models';
import * as d3 from 'd3';

@Component({
  selector: 'app-known-targets-hist',
  encapsulation: ViewEncapsulation.Native,
  styleUrls: ['./known-targets-histogram.component.scss'],
  templateUrl: './known-targets-histogram.component.html'
})

export class KnownTargetsHistogramComponent implements  AfterViewInit {
    @Input() targetHistData: TargetHistogram[] = Array();
    @Input() compoundSelected: string;
    @ViewChild('knownTargetsHist') element: ElementRef;

    dataset: number[] = Array();
    datasetNames: string[] = Array();
    datasetValues: number[] = Array();

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

    constructor() {
    }

    ngAfterViewInit() {
      this.el = this.element.nativeElement;
      this.init();
    }

    init() {
    }
}
