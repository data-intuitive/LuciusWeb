import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { CompoundComponent } from './components/compound/compound.component';
import { SettingsComponent } from './components/settings/settings.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/compounds',
    pathMatch: 'full'
  },
  {
    path: 'compounds',
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

export const appRoutingProviders: any[] = [

];

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes);
