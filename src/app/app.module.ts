import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocalStorageService } from './services/localstorage.service';
import { MdCoreModule } from '@angular2-material/core';
import { MdButtonModule } from '@angular2-material/button';
import { MdSidenavModule } from '@angular2-material/sidenav';
import { MdIconModule } from '@angular2-material/icon';
import { MdToolbarModule } from '@angular2-material/toolbar';
import { MdInputModule } from '@angular2-material/input';
import { MdCardModule } from '@angular2-material/card';
import { MdSliderModule } from '@angular2-material/slider';
import { MdSlideToggleModule } from '@angular2-material/slide-toggle';
import { routes } from './app.routes';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './reducers';
import { actions } from './actions';
import { StoreUtil } from './shared';
import { SettingsEffects } from './effects';
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

    MdCoreModule.forRoot(),
    MdButtonModule.forRoot(),
    MdSidenavModule.forRoot(),
    MdIconModule.forRoot(),
    MdToolbarModule.forRoot(),
    MdInputModule.forRoot(),
    MdCardModule.forRoot(),
    MdSliderModule.forRoot(),
    MdSlideToggleModule.forRoot(),

    routes,

    StoreModule.provideStore(reducers),
    EffectsModule.runAfterBootstrap(SettingsEffects),

    StoreDevtoolsModule.instrumentStore({
      monitor: useLogMonitor({
        position: 'right',
        visible: true
      })
    }),
    StoreLogMonitorModule
  ],
  providers: [
    actions,
    StoreUtil,
    LocalStorageService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
