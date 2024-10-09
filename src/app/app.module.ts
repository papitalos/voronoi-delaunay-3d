import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DiagramComponent } from './components/diagram/diagram.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { AvatarModule } from 'primeng/avatar';
import { CardComponent } from './components/card/card.component';
import { LayerListComponent } from './components/layer-list/layer-list.component';
import { OnionSkinToggleComponent } from './components/onion-skin-toggle/onion-skin-toggle.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ThreeDComponent } from './components/three-d/three-d.component';

@NgModule({
  declarations: [
    AppComponent, 
    DiagramComponent, 
    CardComponent, 
    LayerListComponent,
    OnionSkinToggleComponent,
    ThreeDComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToggleButtonModule,
    FormsModule,
    AvatarModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
