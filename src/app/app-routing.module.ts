import { ProfileComponent } from './profile/profile.component';
import { StatsComponent } from './stats/stats.component';
import { HarvesterComponent } from './harvester/harvester.component';
import { ProxiesComponent } from './proxies/proxies.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartupComponent } from './components/startup/startup.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
    {
        path: '',
        component: StartupComponent
    },
    {
        path: 'dashboard', 
        component: DashboardComponent
    },
    {
        path: 'proxies', 
        component: ProxiesComponent
    },
    {
        path: 'harvester', 
        component: HarvesterComponent
    },
    {
        path: 'stats', 
        component: StatsComponent
    },
    {
        path: 'profile', 
        component: ProfileComponent
    },
    {
        path: 'settings', 
        component: SettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
