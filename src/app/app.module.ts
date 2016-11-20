import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { LuciusWebRoutingModule } from './app-routing.module';
import { reducer } from './reducers';
import { AppComponent } from './app.component';

import * as components from './components';
import * as services from './services';

import { SettingsEffects,
         ServerEffects,
         DataEffects }
from './effects';

@NgModule({
  declarations: [
    AppComponent,
    components.CompoundComponent,
    components.SettingsComponent,
    components.ToolbarComponent,
    components.SimilarityChartsComponent,
    components.TopCompoundsComponent,
    components.KnownTargetsComponent,
    components.SimilarityHistogramComponent,
    components.SimilarityScatterComponent,
    components.KnownTargetsHistogramComponent,
    components.BaseGraphComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule.forRoot(),

    LuciusWebRoutingModule,

    StoreModule.provideStore(reducer),
    EffectsModule.runAfterBootstrap(SettingsEffects),
    EffectsModule.runAfterBootstrap(ServerEffects),
    EffectsModule.runAfterBootstrap(DataEffects),
    // DEBUG: remove Devtools in production
    StoreDevtoolsModule.instrumentOnlyWithExtension()
  ],
  providers: [
    services.LocalStorageService,
    services.HandleDataService,
    services.CompoundDataService,
    services.SignatureDataService,
    services.ZhangDataService,
    services.AnnotatedPlateWellIdsDataService,
    services.TargetFrequencyDataService,
    services.TargetHistogramDataService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
