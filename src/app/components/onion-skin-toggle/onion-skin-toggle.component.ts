// onion-skin-toggle.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Layer } from '../../interfaces/layer';
import { LayerService } from '../../services/layer-service.service';
import { Delaunay } from 'd3-delaunay';

@Component({
  selector: 'app-onion-skin-toggle',
  templateUrl: './onion-skin-toggle.component.html',
  styleUrls: ['./onion-skin-toggle.component.scss'],
})
export class OnionSkinToggleComponent {
  @ViewChildren('voronoiCanvas') voronoiCanvases!: QueryList<
    ElementRef<HTMLCanvasElement>
  >;
  @ViewChildren('delaunayCanvas') delaunayCanvases!: QueryList<
    ElementRef<HTMLCanvasElement>
  >;

  onionSkinActive: boolean = false;
  layers: Layer[] = [];
  activeLayer: Layer | null = null;
  display: any = {
    voronoi: false,
    delaunay: false,
  };

  canvasWidth: number = window.innerWidth;
  canvasHeight: number = window.innerHeight;

  rootStyles = getComputedStyle(document.documentElement);
  txtColor = 'rgba(255, 255, 255, 0.5)';
  clrVoronoiLines = 'rgba(255, 255, 255, 0.25)';
  clrDelaunayLines = 'rgba(255, 255, 255, 0.45)';

  constructor(private layerService: LayerService) {}

  ngOnInit() {
    this.layerService.layers$.subscribe((layers) => {
      this.layers = layers;
      if (this.onionSkinActive) {
        this.updateDiagrams();
      }
    });
    this.layerService.activeLayer$.subscribe((layer) => {
      this.activeLayer = layer;
      if (this.onionSkinActive) {
        this.updateDiagrams();
      }
    });
    this.layerService.display$.subscribe((display) => {
      this.display = display;
      if (this.onionSkinActive) {
        this.updateDiagrams();
      }
    });
  }

  ngAfterViewInit() {
    this.voronoiCanvases.changes.subscribe(() => {
      if (this.onionSkinActive) {
        this.updateDiagrams();
      }
    });
    this.delaunayCanvases.changes.subscribe(() => {
      if (this.onionSkinActive) {
        this.updateDiagrams();
      }
    });
  }

  toggleOnionSkin(): void {
    this.onionSkinActive = !this.onionSkinActive;
    if (this.onionSkinActive) {
      this.updateDiagrams();
    } else {
      this.clearAllCanvases();
    }
  }

  getVisibleLayers(): Layer[] {
    if (!this.onionSkinActive || !this.layers || !this.activeLayer) {
      return [];
    }
  
    const activeLayerIndex = this.layers.findIndex(layer => layer.id === this.activeLayer?.id);
    if (activeLayerIndex === -1) {
      return [];
    }

    const numberOfLayers = this.layerService.getNumberOfOnionLayers();
  
    const visibleLayers = this.layers.slice(activeLayerIndex + 1, activeLayerIndex + 1 + numberOfLayers);
  
    return visibleLayers;
  }

  getOpacityForLayer(index: number): number {
    const opacities = [0.5, 0.25, 0.1]; 
    return opacities[index] || 0.1;
  }

  updateDiagrams() {
    if (!this.onionSkinActive) return;

    const visibleLayers = this.getVisibleLayers();

    if (this.voronoiCanvases.length === 0 || this.delaunayCanvases.length === 0) {
      console.warn('Canvas elements are not yet available.');
      return;
    }

    const voronoiCanvasArray = this.voronoiCanvases.toArray();
    const delaunayCanvasArray = this.delaunayCanvases.toArray();

    const layerCount = Math.min(visibleLayers.length, voronoiCanvasArray.length, delaunayCanvasArray.length);

    for (let i = 0; i < layerCount; i++) {
      if (!voronoiCanvasArray[i] || !delaunayCanvasArray[i]) {
        console.warn(`Canvas element at index ${i} is not available.`);
        continue;
      }
      const layer = visibleLayers[i];
      const voronoiCanvas = voronoiCanvasArray[i].nativeElement;
      const delaunayCanvas = delaunayCanvasArray[i].nativeElement;

      const voronoiContext = voronoiCanvas.getContext('2d')!;
      const delaunayContext = delaunayCanvas.getContext('2d')!;

      // Configurações do canvas
      voronoiCanvas.width = this.canvasWidth;
      voronoiCanvas.height = this.canvasHeight;
      delaunayCanvas.width = this.canvasWidth;
      delaunayCanvas.height = this.canvasHeight;

      // Limpar canvas
      voronoiContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      delaunayContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Desenhar pontos
      this.drawPoints(layer, delaunayContext);

      // Desenhar diagramas
      try {
        const delaunay = Delaunay.from(layer.points);

        if (this.display.delaunay) {
          this.drawDelaunay(delaunay, delaunayContext);
        }

        if (this.display.voronoi) {
          this.drawVoronoi(delaunay, voronoiContext);
        }
      } catch (error) {
        console.error(
          `Error generating diagrams for layer ${layer.name}:`,
          error
        );
      }
    }
  }

  drawPoints(layer: Layer, context: CanvasRenderingContext2D) {
    context.fillStyle = this.txtColor;
    layer.points.forEach((point) => {
      context.beginPath();
      context.arc(point[0], point[1], 5, 0, Math.PI * 2);
      context.fill();
    });
  }

  drawDelaunay(
    delaunay: Delaunay<[number, number]>,
    context: CanvasRenderingContext2D
  ) {
    context.beginPath();
    context.strokeStyle = this.clrDelaunayLines;
    delaunay.render(context);
    context.stroke();
  }

  drawVoronoi(
    delaunay: Delaunay<[number, number]>,
    context: CanvasRenderingContext2D
  ) {
    const voronoi = delaunay.voronoi([
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    ]);
    context.beginPath();
    context.strokeStyle = this.clrVoronoiLines;
    voronoi.render(context);
    context.stroke();
  }

  clearAllCanvases() {
    const voronoiCanvasArray = this.voronoiCanvases.toArray();
    const delaunayCanvasArray = this.delaunayCanvases.toArray();

    for (let i = 0; i < voronoiCanvasArray.length; i++) {
      const voronoiCanvas = voronoiCanvasArray[i].nativeElement;
      const voronoiContext = voronoiCanvas.getContext('2d')!;
      voronoiContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    for (let i = 0; i < delaunayCanvasArray.length; i++) {
      const delaunayCanvas = delaunayCanvasArray[i].nativeElement;
      const delaunayContext = delaunayCanvas.getContext('2d')!;
      delaunayContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }
}
