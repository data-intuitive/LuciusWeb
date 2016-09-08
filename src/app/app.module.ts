import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { routing } from './app.routes';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { GraphHistogramComponent } from './graph-histogram/graph-histogram.component';
import { GraphSimilaritiesComponent } from './graph-similarities/graph-similarities.component';
import { KnownTargetsComponent } from './known-targets/known-targets.component';
import { TopCompoundsComponent } from './top-compounds/top-compounds.component';
import { SettingsHeaderComponent } from './settings-header/settings-header.component';
import { InputFormComponent } from './input-form/input-form.component';
import { SidenavbarComponent } from './sidenavbar/sidenavbar.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SettingsComponent,
    DashboardHeaderComponent,
    GraphHistogramComponent,
    GraphSimilaritiesComponent,
    KnownTargetsComponent,
    TopCompoundsComponent,
    SettingsHeaderComponent,
    InputFormComponent,
    SidenavbarComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    routing
  ],
  providers: [

  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule {

}
