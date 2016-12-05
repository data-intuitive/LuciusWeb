import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { HandleDataService } from '../../../../services';
import { AnnotatedPlatewellid } from '../../../../models';

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.scss']
})

export class ActionDialogComponent implements OnInit {
  dataDetail: AnnotatedPlatewellid;

  constructor(public dialogRef: MdDialogRef<any>,
              private handleDataService: HandleDataService) {
  }

  ngOnInit() {
    this.dataDetail = this.handleDataService.getCorrelationData();
  }

}
