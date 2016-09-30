import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';

import { SettingsActions } from '../../actions';
import { AppState } from '../../reducers';
import { SettingsState } from '../../reducers/settings';
import { StoreUtil } from '../../shared';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  settings: SettingsState;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private settingsActions: SettingsActions,
    private storeUtil: StoreUtil,
  ) {
  }

  ngOnInit() {
    /* get initial values using the store util and
       assign them to a local variable */
    this.settings = this.storeUtil.getState().settings;

    /* set initial values in the settings form */
    this.settingsForm = this.formBuilder.group({
      plotNoise: this.settings.plotNoise,
      hist2dBins: this.settings.hist2dBins,
      hist2dNoise: this.settings.hist2dNoise,
      histogramBins: this.settings.histogramBins,
      topComps: this.settings.topComps,
      serverURL: [this.settings.serverURL, Validators.required],
      queryStr: [this.settings.queryStr, Validators.required],
      classPath: [this.settings.classPath, Validators.required],
      sourireURL: [this.settings.sourireURL, Validators.required],
      hiddenComps: this.settings.hiddenComps
    });
  }

  /* set new settings values by updating the store, when 'Save' button
     is pressed */
  onSubmit() {
    this.store.dispatch(this.settingsActions.update(this.settingsForm.value)
    );
  }
}
