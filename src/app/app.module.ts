import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MdCoreModule } from '@angular2-material/core';
import { MdButtonModule } from '@angular2-material/button';
import { MdSidenavModule } from '@angular2-material/sidenav';
import { MdIconModule } from '@angular2-material/icon';
import { MdToolbarModule } from '@angular2-material/toolbar';
// import { MdCardModule } from '@angular2-material/card';

import { routes, appRoutingProviders } from './app.routes';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';

import { reducers } from './reducers';
import { actions } from './actions';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components';
import { SettingsComponent } from './components';
import { ToolbarComponent } from './components';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SettingsComponent,
    ToolbarComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,

    MdCoreModule.forRoot(),
    MdButtonModule.forRoot(),
    MdSidenavModule.forRoot(),
    MdIconModule.forRoot(),
    MdToolbarModule.forRoot(),

    routes,

    StoreModule.provideStore(
      reducers
    ),
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
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
