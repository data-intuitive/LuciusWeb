import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { CompoundComponent } from './components/compound/compound.component';
import { SettingsComponent } from './components/settings/settings.component';

const appRoutes: Routes = [
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

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes);
