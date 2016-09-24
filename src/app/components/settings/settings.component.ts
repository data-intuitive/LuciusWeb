import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { SettingsActions } from '../../actions';
import { AppState, getSettings } from '../../reducers';
import { SettingsState } from '../../reducers/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  settings$: Observable<SettingsState>;
  settings: SettingsState;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private settingsActions: SettingsActions,
  ) {
  }

  ngOnInit() {
    this.settings$ = this.store.let(getSettings());
    this.settings$.subscribe(s => this.settings = s);

    this.settingsForm = this.formBuilder.group({
      plotNoise: this.settings.plotNoise,
      hist2dBins: this.settings.hist2dBins,
      hist2dNoise: this.settings.hist2dNoise,
      histogramBins: this.settings.histogramBins,
      topComps: this.settings.hiddenComps,
      serverURL: [this.settings.serverURL, Validators.required],
      queryStr: [this.settings.queryStr, Validators.required],
      classPath: [this.settings.classPath, Validators.required],
      sourireURL: [this.settings.sourireURL, Validators.required],
      hiddenComps: this.settings.hiddenComps
    });
  }

  onSubmit() {
    this.store.dispatch(
      this.settingsActions.update(this.settingsForm.value)
    );
  }
}
