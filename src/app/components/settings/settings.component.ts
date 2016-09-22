import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, getSettingsObject } from '../../reducers';
import { Observable } from 'rxjs/Observable';
import { SettingsActions } from '../../actions/settings';
import { SettingsState } from '../../reducers/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  settings$: Observable<SettingsState>;
  setObj: SettingsState;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private settingsActions: SettingsActions
  ) {
    this.settings$ = this.store.let(getSettingsObject());
    this.settings$.subscribe(s => this.setObj = s);
    localStorage.setItem('setObj', JSON.stringify(this.setObj));
  }

  ngOnInit() {
    this.settingsForm = this.formBuilder.group({
      plotNoise: JSON.parse(localStorage.getItem('setObj')).plotNoise,
      hist2dBins: JSON.parse(localStorage.getItem('setObj')).hist2dBins,
      hist2dNoise: JSON.parse(localStorage.getItem('setObj')).hist2dNoise,
      histogramBins: JSON.parse(localStorage.getItem('setObj')).histogramBins,
      topComps: JSON.parse(localStorage.getItem('setObj')).topComps,
      serverURL: [
        JSON.parse(localStorage.getItem('setObj')).serverURL,
        Validators.required
      ],
      queryStr: [
        JSON.parse(localStorage.getItem('setObj')).queryStr,
        Validators.required
      ],
      classPath: [
        JSON.parse(localStorage.getItem('setObj')).classPath,
        Validators.required
      ],
      sourireURL: [
        JSON.parse(localStorage.getItem('setObj')).sourireURL,
        Validators.required
      ],
      hiddenComps: JSON.parse(localStorage.getItem('setObj')).hiddenComps
    });
  }

  onSubmit() {
    // console.log(this.settingsForm.value);
    localStorage.setItem('setObj', JSON.stringify(this.settingsForm.value));
    this.store.dispatch(
      this.settingsActions.updateSettingsValues(this.settingsForm.value)
    );
  }
}
