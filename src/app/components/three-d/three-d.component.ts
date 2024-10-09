import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { Layer } from '../../interfaces/layer';
import { Subscription } from 'rxjs';
import { LayerService } from '../../services/layer-service.service';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Delaunay } from 'd3-delaunay';

@Component({
  selector: 'app-three-d',
  templateUrl: './three-d.component.html',
  styleUrls: ['./three-d.component.scss'],
})
export class ThreeDComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas3D', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private pointsSubscription!: Subscription;
  private zHeightSubscription!: Subscription;

  private controls!: OrbitControls; // Controles de navegação

  layers: Layer[] = [];
  is3DActive: boolean = false;

  constructor(private layerService: LayerService) {}

  ngAfterViewInit() {
    this.initScene();
    this.animate();

    // Assina as mudanças no Observable de layers
    this.pointsSubscription = this.layerService.layers$.subscribe(
      (layers: Layer[]) => {
        this.layers = layers;
        this.updateScene();
      }
    );

    this.zHeightSubscription = this.layerService.zHeight$.subscribe(
      (layers: Layer[]) => {
        this.layers = layers;
        this.updateScene();
      }
    );

    // Adiciona o listener para redimensionar a tela
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  ngOnDestroy() {
    if (this.pointsSubscription) {
      this.pointsSubscription.unsubscribe();
    }
    if (this.zHeightSubscription) {
      this.zHeightSubscription.unsubscribe();
    }
  }

  private initScene(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1a1a1a, 1);
    this.scene = new THREE.Scene();

    // Configuração da câmera - Coloca a câmera na lateral para visualizar de lado
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(8, 8, 8); // Posição mais adequada para ver a camada de lado

    // Adicionar luzes para iluminar bem todos os objetos
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight1.position.set(5, 5, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight2.position.set(-5, 5, 5);
    this.scene.add(directionalLight2);

    // Configuração dos controles de navegação
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0, 0);

    
  
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private normalizePoints(layer: Layer): { x: number; y: number; z: number }[] {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    const scaleFactor = 0.01;

    return layer.points.map((point) => {
      const normalizedX = (point[0] - canvasWidth / 2) * scaleFactor;
      const normalizedY = layer.zHeight * 0.25; // Use zHeight da camada
      const normalizedZ = -(point[1] - canvasHeight / 2) * scaleFactor;
      return { x: normalizedX, y: normalizedY, z: normalizedZ };
    });
  }

  private updateScene(): void {
    console.log(this.layers);

    this.scene.children = this.scene.children.filter(
      (child) => !(child instanceof THREE.Mesh) && !(child instanceof THREE.Line)
    );


    const axisLength = 5; //comprimento dos eixos

    // Eixo X
    const xMaterial = new THREE.LineBasicMaterial({ color: 0x333333 }); 
    const xPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(axisLength, 0, 0),
    ];
    const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    this.scene.add(xAxis);

    // Eixo Y
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x444444 }); 
    const yPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, axisLength, 0),
    ];
    const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    this.scene.add(yAxis);

    // Eixo Z 
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
    const zPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, axisLength),
    ];
    const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
    const zAxis = new THREE.Line(zGeometry, zMaterial);
    this.scene.add(zAxis);


    this.layers.forEach((layer) => {
      const normalizedPoints = this.normalizePoints(layer);
      const vertices: THREE.Vector3[] = [];
      normalizedPoints.forEach((point: { x: number; y: number; z: number }) => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        vertices.push(new THREE.Vector3(point.x, point.y, point.z));
        cube.position.set(point.x, point.y, point.z);
        this.scene.add(cube);
      });

      if (normalizedPoints.length > 2) {
        const delaunay = Delaunay.from(normalizedPoints.map((p) => [p.x, p.z]));
        const edges: THREE.Vector3[][] = [];

        for (let i = 0; i < delaunay.triangles.length; i += 3) {
          const a = delaunay.triangles[i];
          const b = delaunay.triangles[i + 1];
          const c = delaunay.triangles[i + 2];
          edges.push([vertices[a], vertices[b]]);
          edges.push([vertices[b], vertices[c]]);
          edges.push([vertices[c], vertices[a]]);
        }

        edges.forEach(([start, end]) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            start,
            end,
          ]);
          const material = new THREE.LineBasicMaterial({ color: 0xffffff });
          const line = new THREE.Line(geometry, material);
          this.scene.add(line);
        });
      }

      for (let i = 0; i < this.layers.length - 1; i++) {
        const lowerLayer = this.layers[i];
        const upperLayer = this.layers[i + 1];

        const lowerPoints = this.normalizePoints(lowerLayer);
        const upperPoints = this.normalizePoints(upperLayer);

        const lowerVertices = lowerPoints.map(
          (p) => new THREE.Vector3(p.x, p.y, p.z)
        );
        const upperVertices = upperPoints.map(
          (p) => new THREE.Vector3(p.x, p.y, p.z)
        );

        lowerVertices.forEach((lowerVertex) => {
          let minDistance = Infinity;
          let closestVertex = null;

          upperVertices.forEach((upperVertex) => {
            const distance = lowerVertex.distanceTo(upperVertex);
            if (distance < minDistance) {
              minDistance = distance;
              closestVertex = upperVertex;
            }
          });

          if (closestVertex) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
              lowerVertex,
              closestVertex,
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0xffffff });
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
          }
        });
      }
    });
  }

  activate3DView() {
    const threeDCanva = document.getElementById('canvas3D') as HTMLElement;
    const threeDButton = document.querySelector('.btn-3d') as HTMLElement;
    const diagram = document.querySelector('app-diagram') as HTMLElement;
    const layerList = document.querySelector('app-layer-list') as HTMLElement;

    if (threeDCanva.style.display === 'block') {
      this.is3DActive = false;
      threeDCanva.style.display = 'none';
      threeDButton.style.backgroundColor = 'var(--disabled)';
      threeDButton.style.color = 'var(--text-secondary)';
      threeDButton.style.border = '1px solid var(--border)';

      diagram.classList.remove('hide3D');
      diagram.classList.add('show3D');
      layerList.classList.remove('hide3D');
      layerList.classList.add('show3D');

      diagram.style.display = 'flex';
      layerList.style.display = 'flex';
    } else {
      this.is3DActive = true;

      threeDButton.style.backgroundColor = 'var(--background-secondary)';
      threeDButton.style.color = 'var(--text)';
      threeDButton.style.border = '2px solid var(--text)';

      diagram.classList.add('hide3D');
      diagram.classList.remove('show3D');
      layerList.classList.add('hide3D');
      layerList.classList.remove('show3D');

      setTimeout(() => {
        threeDCanva.style.display = 'block';
        diagram.style.display = 'none';
        layerList.style.display = 'none';
      }, 200);
    }
  }
}
