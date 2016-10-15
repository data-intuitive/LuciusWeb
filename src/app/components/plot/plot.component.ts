import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements OnInit {
  @Input() signature: any;
  @Input() compound: any;

  constructor() {

  }

  ngOnInit() {

  }

}
