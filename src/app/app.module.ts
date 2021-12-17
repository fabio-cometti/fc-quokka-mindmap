import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapItemComponent } from './components/map-item/map-item.component';
import { MapComponent } from './components/map/map.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MapNodeComponent } from './components/map-node/map-node.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MapDashboardComponent } from './components/map-dashboard/map-dashboard.component';
import { QuokkerizeComponent } from './components/quokkerize/quokkerize.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'; 
import { FlexLayoutModule } from '@angular/flex-layout';
import { SaveAsDialogComponent } from './components/save-as-dialog/save-as-dialog.component'; 
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    MapItemComponent,   
    MapComponent,
    MapNodeComponent,
    MapDashboardComponent,
    QuokkerizeComponent,
    SaveAsDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatDialogModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
