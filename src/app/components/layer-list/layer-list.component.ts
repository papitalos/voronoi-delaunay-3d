import { Component, OnInit } from '@angular/core';
import { Layer } from '../../interfaces/layer';
import { LayerService } from '../../services/layer-service.service';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss'],
})
export class LayerListComponent implements OnInit {
  layers: Layer[] = [];
  activeLayerId: number | null = null;
  layerListActive: boolean = false;

  constructor(private layerService: LayerService) {}

  //main lifecycle
  ngOnInit() {
    this.layerService.layers$.subscribe((layers) => {
      this.layers = layers;
    });

    this.layerService.activeLayer$.subscribe((activeLayer) => {
      this.activeLayerId = activeLayer ? activeLayer.id : null;
    });
  }

  selectLayer(id: number): void {
    const editingLayer = this.layers.find(
      (layer) => layer.editing && layer.id !== id
    );
    if (editingLayer) {
      this.finishEditing(editingLayer);
    }
    this.layerService.setActiveLayer(id);
  }

addLayer(): void {
  const activeLayerIndex = this.layers.findIndex(layer => layer.id === this.activeLayerId);
  const indexToInsert = activeLayerIndex >= 0 ? activeLayerIndex : 0;
  const layer = this.layerService.addLayer(`Layer ${this.layers.length + 1}`, indexToInsert);
  this.selectLayer(layer.id);
}

  removeLayer(id: number): void {
    this.layerService.removeLayer(id);
  }

  reorderLayers(event: any): void {
    this.layerService.reorderLayers(event.previousIndex, event.currentIndex);
  }

  //toggle layer list
  onLayerNameClick(layer: Layer): void {
    if (!layer.editing) {
      this.selectLayer(layer.id);
    }
  }

  toggleLayerList(): void {
    this.layerListActive = !this.layerListActive;

    let layerList = document.querySelector('.layer-list') as HTMLElement;

    if (this.layerListActive) {
      layerList.classList.remove('hide');
      layerList.classList.add('show');
    } else {
      layerList.classList.remove('show');
      layerList.classList.add('hide');
    }
  }

  //drag and drop

  drop(event: CdkDragDrop<Layer[]>) {
    this.layerService.reorderLayers(event.previousIndex, event.currentIndex);
  }


  //editing
  get isEditing(): boolean {
    const editing = this.layers.some((layer) => layer.editing);
    return editing;
  }

  editLayerName(layer: Layer): void {
    layer.previousName = layer.name;
    this.layerService.setEditingLayer(layer.id);
  }

  finishEditing(layer: Layer): void {
    layer.name = layer.name.trim();
    if (layer.name) {
      this.layerService.updateLayer(layer.id, {
        name: layer.name,
        editing: false,
      });
    } else {
      layer.name = layer.previousName || `Layer ${this.layers.length + 1}`;
      this.layerService.updateLayer(layer.id, { editing: false });
    }
  }

  getLayerStyles(layer: Layer): { [key: string]: string } {
    let styles: { [key: string]: string } = {};
    if (layer.id === this.activeLayerId) {
      styles['border'] = '2px solid var(--accent)';
    }

    if (layer.editing) {
      styles['border'] = '2px solid var(--primary)';
    }

    return styles;
  }

  //z axis
  updateZHeight(layer: Layer): void {
    this.layerService.updateLayer(layer.id, { zHeight: layer.zHeight });
  }
}
