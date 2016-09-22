import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.settingsForm =
      this._formBuilder
          .group({
            plotNoise: Number,
            hist2dBins: Number,
            hist2dNoise: Number,
            histogramBins: Number,
            topComps: Number,
            serverURL: ['', Validators.required],
            queryStr: ['', Validators.required],
            classPath: ['', Validators.required],
            sourireURL: ['', Validators.required],
            hiddenComps: Boolean
          });
  }

  onSubmit() {
    console.log(this.settingsForm.value);
  }
}
