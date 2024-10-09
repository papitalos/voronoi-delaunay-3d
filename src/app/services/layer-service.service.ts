// layer.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Layer } from '../interfaces/layer';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private layers: Layer[] = [];
  private layersSubject = new BehaviorSubject<Layer[]>([]);
  private activeLayerSubject = new BehaviorSubject<Layer | null>(null);
  private pointsSubject = new BehaviorSubject<Array<[number, number]>>([]);
  private zHeightSubject = new BehaviorSubject<Layer[]>([]);


  //observables
  points$: Observable<Array<[number, number]>> = this.pointsSubject.asObservable();
  layers$: Observable<Layer[]> = this.layersSubject.asObservable();
  zHeight$: Observable<Layer[]> = this.zHeightSubject.asObservable();
  activeLayer$: Observable<Layer | null> =
    this.activeLayerSubject.asObservable();

  constructor() {
    const defaultLayer = this.addLayer('Layer 1');
    this.setActiveLayer(defaultLayer.id);
  }

  addLayer(name: string, index?: number): Layer {
    const newLayer: Layer = {
      id: this.generateLayerId(),
      name,
      zHeight: 0,
      points: [],
      draggingPoint: null,
    };
    if (index !== undefined && index >= 0 && index <= this.layers.length) {
      this.layers.splice(index, 0, newLayer);
    } else {
      this.layers.push(newLayer);
    }
    this.layersSubject.next(this.layers);
    return newLayer;
  }

  removeLayer(id: number): void {
    this.layers = this.layers.filter((layer) => layer.id !== id);
    this.layersSubject.next(this.layers);

    if (this.activeLayerSubject.value?.id === id) {
      const nextLayer = this.layers.length > 0 ? this.layers[0] : null;
      this.setActiveLayer(nextLayer ? nextLayer.id : null);
    }
  }

  reorderLayers(fromIndex: number, toIndex: number): void {
    const layer = this.layers.splice(fromIndex, 1)[0];
    this.layers.splice(toIndex, 0, layer);
    this.layersSubject.next(this.layers);
  }

  setActiveLayer(id: number | null): void {
    const layer = this.layers.find((layer) => layer.id === id) || null;
    this.activeLayerSubject.next(layer);
  }

  getActiveLayer(): Layer | null {
    return this.activeLayerSubject.value;
  }

  updateLayer(id: number, updatedProperties: Partial<Layer>): void {
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index !== -1) {
      this.layers[index] = { ...this.layers[index], ...updatedProperties };
      this.layersSubject.next([...this.layers]);
    }

    if (updatedProperties.zHeight !== undefined) {
      this.zHeightSubject.next([...this.layers]); 
      console.log('zHeight updated');
    }
  }

  updateLayers(newLayers: Layer[]): void {
    this.layers = [...newLayers];
    this.layersSubject.next(this.layers);
  }

  updateLayerPoints(id: number, points: Array<[number, number]>): void {
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index !== -1) {
      this.layers[index].points = points;
      this.pointsSubject.next(points); 
      this.layersSubject.next([...this.layers]); 
    }
  }

  private generateLayerId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  setEditingLayer(id: number | null): void {
    this.layers = this.layers.map((layer) => ({
      ...layer,
      editing: layer.id === id ? true : false,
    }));
    this.layersSubject.next([...this.layers]);
  }

  //visualizaçao
  private displaySubject = new BehaviorSubject<{
    voronoi: boolean;
    delaunay: boolean;
  }>({ voronoi: false, delaunay: false });
  display$: Observable<{ voronoi: boolean; delaunay: boolean }> =
    this.displaySubject.asObservable();

  setDisplaySettings(display: { voronoi: boolean; delaunay: boolean }) {
    this.displaySubject.next(display);
  }

  //onion

  private numberOfOnionLayers = 2;
  setNumberOfOnionLayers(num: number): void {
    this.numberOfOnionLayers = num;
  }

  getNumberOfOnionLayers(): number {
    return this.numberOfOnionLayers;
  }
}
