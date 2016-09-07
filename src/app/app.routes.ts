import { Routes, RouterModule }   from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { DashboardComponent} from './dashboard/dashboard.component';
import { SettingsComponent} from './settings/settings.component';

const appRoutes: Routes = [
    {
        path: '', redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    },
    {
        path: '**', component: DashboardComponent
    }
]

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
