import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, getSettingsObject } from '../../reducers';
import { Observable } from 'rxjs/Observable';
import { SettingsActions } from '../../actions/settings';
import { SettingsState } from '../../reducers/settings';
import { LocalStorageService } from '../../services/localstorage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [LocalStorageService]
})

export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  settings$: Observable<SettingsState>;
  setObj: SettingsState;

    constructor(
        private _formBuilder: FormBuilder,
        private store: Store<AppState>,
        private settingsActions: SettingsActions,
        private _localStorageService: LocalStorageService
    ) { }

    ngOnInit() {
        this.store.dispatch(this.settingsActions.initializeSettingsValues());
        this.settings$ = this.store.let(getSettingsObject());
        this.settings$.subscribe(s => this.setObj = s);

        this.settingsForm = this._formBuilder.group({
            plotNoise: this.setObj.plotNoise,
            hist2dBins: this.setObj.hist2dBins,
            hist2dNoise: this.setObj.hist2dNoise,
            histogramBins: this.setObj.histogramBins,
            topComps: this.setObj.hiddenComps,
            serverURL: [this.setObj.serverURL, Validators.required],
            queryStr: [this.setObj.queryStr, Validators.required],
            classPath: [this.setObj.classPath, Validators.required],
            sourireURL: [this.setObj.sourireURL, Validators.required],
            hiddenComps: this.setObj.hiddenComps
        });
    }

    onSubmit() {
            this.store.dispatch(this.settingsActions.updateSettingsValues(this.settingsForm.value));
    }
}
