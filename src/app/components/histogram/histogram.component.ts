import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit {
  @Input() signature: any;
  @Input() compound: any;

  constructor() { }

  ngOnInit() {
  }

}
