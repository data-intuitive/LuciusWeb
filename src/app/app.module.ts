import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageService } from './services/localstorage.service';
import { HandleDataService } from './services/handle-data.service';
import { FetchDataService } from './services/fetch-data.service';
import { MaterialModule } from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { LuciusWebRoutingModule } from './app-routing.module';
import { reducer } from './reducers';
import { SettingsEffects } from './effects/settings';
import { ServerEffects } from './effects/server';
import { DataEffects } from './effects/data';
import { AppComponent } from './app.component';

import {
  CompoundComponent,
  SettingsComponent,
  ToolbarComponent,
  SimilarityChartsComponent,
  TopCompoundsComponent,
  KnownTargetsComponent,
  SimilarityHistogramComponent,
  SimilarityScatterComponent,
  KnownTargetsHistogramComponent
} from './components';

@NgModule({
  declarations: [
    AppComponent,
    CompoundComponent,
    SettingsComponent,
    ToolbarComponent,
    SimilarityChartsComponent,
    TopCompoundsComponent,
    KnownTargetsComponent,
    SimilarityHistogramComponent,
    SimilarityScatterComponent,
    KnownTargetsHistogramComponent
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
    LocalStorageService,
    FetchDataService,
    HandleDataService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
