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
// Implementação simples de triangulação 3D por convex hull
function simple3DTriangulation(points: {x: number, y: number, z: number}[]): number[][] {
  const triangles: number[][] = [];
  
  if (points.length < 4) return triangles;
  
  // Para simplicidade, vamos criar tetrahedros conectando pontos próximos
  for (let i = 0; i < points.length - 3; i++) {
    for (let j = i + 1; j < points.length - 2; j++) {
      for (let k = j + 1; k < points.length - 1; k++) {
        for (let l = k + 1; l < points.length; l++) {
          // Criar um tetrahedro com os 4 pontos
          triangles.push([i, j, k, l]);
        }
      }
    }
  }
  
  return triangles.slice(0, Math.min(10, triangles.length)); // Limitar para não sobrecarregar
}

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

    // Eixo X (vermelho)
    const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4444 }); 
    const xPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(axisLength, 0, 0),
    ];
    const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    this.scene.add(xAxis);

    // Eixo Y (verde)
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44 }); 
    const yPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, axisLength, 0),
    ];
    const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    this.scene.add(yAxis);

    // Eixo Z (azul)
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff });
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
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        vertices.push(new THREE.Vector3(point.x, point.y, point.z));
        sphere.position.set(point.x, point.y, point.z);
        this.scene.add(sphere);
      });

             // Triangulação 3D usando implementação simples
       if (normalizedPoints.length > 3) {
         // Executar triangulação 3D (tetrahedros)
         const tetrahedra = simple3DTriangulation(normalizedPoints);
         
         // Desenhar as arestas dos tetrahedros
         const edges: Set<string> = new Set();
         
         tetrahedra.forEach((tetrahedron: number[]) => {
           // Cada tetrahedro tem 4 vértices, criar 6 arestas
           const faces = [
             [tetrahedron[0], tetrahedron[1]],
             [tetrahedron[0], tetrahedron[2]],
             [tetrahedron[0], tetrahedron[3]],
             [tetrahedron[1], tetrahedron[2]],
             [tetrahedron[1], tetrahedron[3]],
             [tetrahedron[2], tetrahedron[3]]
           ];
           
           faces.forEach(([a, b]) => {
             // Evitar arestas duplicadas
             const edgeKey = `${Math.min(a, b)}-${Math.max(a, b)}`;
             if (!edges.has(edgeKey)) {
               edges.add(edgeKey);
               
               const start = vertices[a];
               const end = vertices[b];
               
               if (start && end) {
                 const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
                 const material = new THREE.LineBasicMaterial({ color: 0xffffff });
                 const line = new THREE.Line(geometry, material);
                 this.scene.add(line);
               }
             }
           });
         });
       } else if (normalizedPoints.length === 3) {
        // Para 3 pontos, criar um triângulo
        const edges = [
          [vertices[0], vertices[1]],
          [vertices[1], vertices[2]],
          [vertices[2], vertices[0]]
        ];
        
        edges.forEach(([start, end]) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
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

  private drawSimpleConnections(vertices: THREE.Vector3[]): void {
    // Conecta cada ponto ao próximo (visualização simples para fallback)
    for (let i = 0; i < vertices.length - 1; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([vertices[i], vertices[i + 1]]);
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
    }
    
    // Conecta o último ao primeiro para formar um ciclo
    if (vertices.length > 2) {
      const geometry = new THREE.BufferGeometry().setFromPoints([vertices[vertices.length - 1], vertices[0]]);
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
    }
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
