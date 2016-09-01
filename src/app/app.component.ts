import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ROUTER_DIRECTIVES} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [DashboardComponent, SettingsComponent, ROUTER_DIRECTIVES]
})
export class AppComponent {
  title = 'Welcome to LuciusWeb!';
}
