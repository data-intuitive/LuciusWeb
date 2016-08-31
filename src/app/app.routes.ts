import { Routes, RouterModule }   from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { DashboardComponent} from './dashboard/dashboard.component';
import { SettingsComponent} from './settings/settings.component';

const appRoutes: Routes = [
    {
        path: '', component: DashboardComponent
    },
    {
        path: 'dashboard', component: DashboardComponent
    },
    {
        path: 'settings', component: SettingsComponent
    },
    {
        path: '**', component: DashboardComponent
    }
]

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
