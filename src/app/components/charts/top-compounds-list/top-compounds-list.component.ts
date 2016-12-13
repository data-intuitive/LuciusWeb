import { Component, ElementRef, ViewChild,  AfterViewInit,
         Input, ViewEncapsulation, ChangeDetectorRef,
         ViewContainerRef } from '@angular/core';

import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { Settings, AnnotatedPlatewellid, Zhang } from '../../../models';
import { ActionDialogComponent } from './action-dialog/action-dialog.component';
import { appColors } from '../../../shared/colors';
import * as d3 from 'd3';

const detailDialog = ActionDialogComponent;

@Component({
  selector: 'app-top-compounds-list',
  encapsulation: ViewEncapsulation.Native,
  templateUrl: './top-compounds-list.component.html',
  styleUrls: ['./top-compounds-list.component.scss']
})

export class TopCompoundsListComponent implements AfterViewInit {

  @ViewChild('topCompList') element: ElementRef;
  @Input() settings: Settings;
  @Input() public topPositiveAnnotatedPlatewellids: AnnotatedPlatewellid[] = Array();
  @Input() public topNegativeAnnotatedPlatewellids: AnnotatedPlatewellid[] = Array();
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
  initDone = false;

  /* ref to Dialog Window */
  dialogRef: MdDialogRef<ActionDialogComponent>;

  constructor(public dialog: MdDialog,
      public viewContainerRef: ViewContainerRef,
      private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.el = this.element.nativeElement;
    this.colors = appColors;

    if (this.settings &&
        this.topPositiveCorrelations &&
        this.topNegativeCorrelations &&
        this.topPositiveAnnotatedPlatewellids &&
        this.topNegativeAnnotatedPlatewellids
      ) {
          this.isInputReady = true;
    }

    // let host = d3.select(this.el);

    /* define colorscale */
    this.colorScale = d3.scaleLinear()
      .domain([1, 0.5, 0, -0.5, -1])
      .range(this.colors);

    if (this.isInputReady) {
      this.initData();
    }

    this.cdr.detectChanges();

    /* hide sensitive information */
    if (this.settings.hiddenComps) {
      console.log('hide info!');
      // host.select('#list').classList.add('hideinfo');
      // host.select('#detail').classList.add('hideinfo');
    }
  }

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
          model: this.topPositiveAnnotatedPlatewellids
        },
        {
          title: 'Top ' + this.topcomp + ' negative correlations',
          type: 'negative',
          model: this.topNegativeAnnotatedPlatewellids
        }
      ];
    }
    this.initDone = true;
  }

  handleOpenDialog (groupIdx: number , modelIdx: number, el: AnnotatedPlatewellid) {
    let config = new MdDialogConfig();
    config.viewContainerRef = this.viewContainerRef;

    this.dialogRef = this.dialog.open(detailDialog, config);
    this.dialogRef.componentInstance.dataDetail = el;

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
      return value.toFixed(3);
    }
  }

  sourireURL(value) {
    if (value) {
      return this.settings.sourireURL + '/molecule/' + encodeURIComponent(value);
    }
  }

}
