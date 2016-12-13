import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AnnotatedPlatewellid } from '../../../../models';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-action-dialog',
  encapsulation: ViewEncapsulation.Native,
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.scss']
})

export class ActionDialogComponent implements OnInit {
  dataDetail: AnnotatedPlatewellid;

  constructor(public dialogRef: MdDialogRef<any>) {
  }

  ngOnInit() {
  }

}
