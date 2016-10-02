import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompoundComponent } from './components/compound/compound.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/compound',
    pathMatch: 'full'
  },
  {
    path: 'compound',
    component: CompoundComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: '**', component: CompoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class LuciusWebRoutingModule {}
