import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageService } from './services/localstorage.service';
import { MaterialModule } from '@angular/material';
import { routes } from './app.routes';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreLogMonitorModule } from '@ngrx/store-log-monitor';
import { EffectsModule } from '@ngrx/effects';
import { reducer } from './reducers';
import { SettingsEffects } from './effects/settings';
import { AppComponent } from './app.component';
import {
  CompoundComponent,
  SettingsComponent,
  ToolbarComponent,
  FilterComponent
} from './components';

@NgModule({
  declarations: [
    AppComponent,
    CompoundComponent,
    SettingsComponent,
    ToolbarComponent,
    FilterComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule.forRoot(),

    routes,

    StoreModule.provideStore(reducer),
    EffectsModule.runAfterBootstrap(SettingsEffects),

    // DEBUG: remove Devtools in production
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    StoreLogMonitorModule
  ],
  providers: [
    LocalStorageService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
