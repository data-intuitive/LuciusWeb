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

import { LocalStorageService,
         HandleDataService,
         FetchDataService
} from './services';

import { SettingsEffects,
         ServerEffects,
         DataEffects }
from './effects';

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
