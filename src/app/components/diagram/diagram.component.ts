import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Delaunay } from 'd3-delaunay';
import { LayerService } from '../../services/layer-service.service';
import { Layer } from '../../interfaces/layer';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrl: './diagram.component.scss',
})
export class DiagramComponent {
  @ViewChild('voronoiCanvas', { static: true })
  voronoiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('delaunayCanvas', { static: true })
  delaunayCanvas!: ElementRef<HTMLCanvasElement>;

  private voronoiContext!: CanvasRenderingContext2D;
  private delaunayContext!: CanvasRenderingContext2D;

  rootStyles = getComputedStyle(document.documentElement);
  txtColor = this.rootStyles.getPropertyValue('--text').trim();
  clrVoronoiLines = this.rootStyles.getPropertyValue('--voronoi-lines').trim();
  clrDelaunayLines = this.rootStyles
    .getPropertyValue('--delaunay-lines')
    .trim();

  activeLayer: Layer | null = null;
  display: any;
  canvasWidth: number = window.innerWidth;
  canvasHeight: number = window.innerHeight;

  constructor(private layerService: LayerService) {}

  //main lifecycle
  ngOnInit() {
    this.layerService.activeLayer$.subscribe((layer) => {
      this.activeLayer = layer;
      this.voronoiContext = this.voronoiCanvas.nativeElement.getContext('2d')!;
      this.delaunayContext =
        this.delaunayCanvas.nativeElement.getContext('2d')!;
      this.setCanvasDimensions();
      this.updateDiagrams();
    });

    this.layerService.display$.subscribe(display => {
      this.display = display;
    });
  }

  onDisplayChange() {
    this.layerService.setDisplaySettings(this.display);
  }

  setCanvasDimensions() {
    this.voronoiCanvas.nativeElement.width = this.canvasWidth;
    this.voronoiCanvas.nativeElement.height = this.canvasHeight;
    this.delaunayCanvas.nativeElement.width = this.canvasWidth;
    this.delaunayCanvas.nativeElement.height = this.canvasHeight;
  }

  addPoint(event: MouseEvent) {
    if (this.activeLayer) {
      const rect = this.delaunayCanvas.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.activeLayer.points.push([x, y]);

      this.layerService.updateLayerPoints(this.activeLayer.id, this.activeLayer.points);

      this.drawPoints();
      this.updateDiagrams();
      
    }
  }

  drawPoints() {
    if (this.activeLayer) {
      this.clearDelaunayCanvas();
      this.delaunayContext.fillStyle = this.txtColor;
      this.activeLayer.points.forEach((point) => {
        this.delaunayContext.beginPath();
        this.delaunayContext.arc(point[0], point[1], 5, 0, Math.PI * 2);
        this.delaunayContext.fill();
      });
    }
  }

  deletePoins() {
    if (this.activeLayer) {
      this.activeLayer.points = [];
      this.layerService.updateLayerPoints(this.activeLayer.id, this.activeLayer.points);
      this.updateDiagrams();
    }
  }

  clearBothCanvases() {
    if (this.activeLayer) {
      this.clearDelaunayCanvas();
      this.clearVoronoiCanvas();
    }
  }
  clearVoronoiCanvas() {
    this.voronoiContext.clearRect(
      0,
      0,
      this.voronoiCanvas.nativeElement.width,
      this.voronoiCanvas.nativeElement.height
    );
  }
  clearDelaunayCanvas() {
    this.delaunayContext.clearRect(
      0,
      0,
      this.delaunayCanvas.nativeElement.width,
      this.delaunayCanvas.nativeElement.height
    );
  }

  updateDiagrams() {
    if (this.activeLayer) {
      const delaunay = Delaunay.from(this.activeLayer.points);

      this.clearBothCanvases();
      this.drawPoints();

      if (this.display.delaunay) {
        this.drawDelaunay(delaunay);
      }

      if (this.display.voronoi) {
        this.drawVoronoi(delaunay);
      }
    }
  }

  drawDelaunay(delaunay: Delaunay<[number, number]>) {
    this.delaunayContext.beginPath();
    this.delaunayContext.strokeStyle = this.clrDelaunayLines;
    delaunay.render(this.delaunayContext);
    this.delaunayContext.stroke();
  }

  drawVoronoi(delaunay: Delaunay<[number, number]>) {
    const voronoi = delaunay.voronoi([
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    ]);
    this.voronoiContext.beginPath();
    this.voronoiContext.strokeStyle = this.clrVoronoiLines;
    voronoi.render(this.voronoiContext);
    this.voronoiContext.stroke();
  }

  //drag and drop
  checkPointEvent(event: MouseEvent, isMouseDown: boolean = false) {
    if (this.activeLayer) {
      const rect = this.delaunayCanvas.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const detectedPoint = this.activeLayer.points.find(
        (point) => Math.hypot(point[0] - x, point[1] - y) < 10
      );

      if (detectedPoint) {
        this.delaunayCanvas.nativeElement.style.cursor = 'pointer';

        if (isMouseDown && event.button === 0) {
          this.activeLayer.draggingPoint = detectedPoint;
        }
      } else {
        this.delaunayCanvas.nativeElement.style.cursor = 'default';

        if (
          isMouseDown &&
          event.button === 0 &&
          this.delaunayCanvas.nativeElement === event.target
        ) {
          this.addPoint(event);
        }
      }
    }
  }

  dragPoint(event: MouseEvent) {
    if (this.activeLayer && this.activeLayer.draggingPoint) {
      const rect = this.delaunayCanvas.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.activeLayer.draggingPoint[0] = x;
      this.activeLayer.draggingPoint[1] = y;
      this.layerService.updateLayerPoints(this.activeLayer.id, this.activeLayer.points);
      this.updateDiagrams();
    }
  }

  endDrag() {
    if (this.activeLayer) {
      this.activeLayer.draggingPoint = null;
      this.delaunayCanvas.nativeElement.style.cursor = 'default';
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.checkPointEvent(event, true);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.activeLayer?.draggingPoint) {
      this.dragPoint(event);
    } else {
      this.checkPointEvent(event);
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.endDrag();
  }

  
}
