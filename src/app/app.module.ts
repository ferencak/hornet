import { DashboardComponent } from './components/dashboard/dashboard.component';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { StartupComponent } from './components/startup/startup.component';

import { MenuComponent } from './menu/menu.component';
import { ProxiesComponent } from './proxies/proxies.component';
import { HarvesterComponent } from './harvester/harvester.component';
import { StatsComponent } from './stats/stats.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { FooterComponent } from './footer/footer.component';
import { VersionComponent } from './version/version.component';
import { NgxInputTagModule } from 'ngx-input-tag';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective,
    StartupComponent,
    DashboardComponent,
    MenuComponent,
    ProxiesComponent,
    HarvesterComponent,
    StatsComponent,
    ProfileComponent,
    SettingsComponent,
    FooterComponent,
    VersionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxInputTagModule.forRoot(), 
    NgxCaptchaModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent, VersionComponent]
})
export class AppModule { }
