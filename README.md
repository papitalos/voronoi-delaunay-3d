# 🔺 Voronoi-Delaunay 3D

> Projeto Angular showcasing visualização 3D interativa com diagramas de Voronoi e triangulação de Delaunay. Desenvolvido para explorar conceitos matemáticos e algoritmos geométricos em um contexto tridimensional.

![Angular](https://img.shields.io/badge/Angular-17.3-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.169-green)
![pnpm](https://img.shields.io/badge/pnpm-10.6-orange)

## 📋 Sobre o Projeto

Este projeto é uma aplicação Angular interativa que permite visualizar e manipular diagramas de Voronoi e triangulação de Delaunay tanto em 2D quanto em 3D. O objetivo é fornecer uma ferramenta educacional e exploratória para entender algoritmos geométricos fundamentais da computação gráfica.

### 🎯 Principais Funcionalidades

- **📐 Visualização 2D**: Diagrama de Voronoi e triangulação de Delaunay clássicos
- **🔺 Visualização 3D**: Tetrahedrização e estruturas geométricas em três dimensões
- **🎛️ Sistema de Camadas**: Gerenciamento de múltiplas camadas com alturas Z configuráveis
- **🎨 Interface Interativa**: Controles intuitivos para adicionar, remover e organizar pontos
- **⚡ Animações Suaves**: Transições fluidas entre os modos 2D e 3D
- **🎪 Drag & Drop**: Reordenação de camadas através de arrastar e soltar

### 🛠️ Tecnologias Utilizadas

- **[Angular 17.3](https://angular.io/)** - Framework principal
- **[Three.js 0.169](https://threejs.org/)** - Renderização e visualização 3D
- **[D3.js 7.9](https://d3js.org/)** - Algoritmos de Delaunay 2D
- **[PrimeNG 17.18](https://primeng.org/)** - Componentes de UI
- **[Angular CDK](https://material.angular.io/cdk)** - Drag & Drop funcionalidade
- **[Phosphor Icons](https://phosphoricons.com/)** - Iconografia moderna
- **[SCSS](https://sass-lang.com/)** - Estilização avançada

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18+ recomendada)
- **pnpm** (gerenciador de pacotes)

```bash
# Instalar pnpm globalmente (se não tiver)
npm install -g pnpm
```

### 📥 Clonando e Configurando

1. **Clone o repositório:**
```bash
git clone https://github.com/papitalos/voronoi-delaunay-3d.git
```

2. **Entre no diretório do projeto:**
```bash
cd voronoi-delaunay-3d
```

3. **Instale as dependências:**
```bash
pnpm install
```

### 🏃‍♂️ Executando o Projeto

4. **Inicie o servidor de desenvolvimento:**
```bash
pnpm start
```

5. **Acesse a aplicação:**
```
http://localhost:4200/Voronoi-Delaunay-3D
```

A aplicação será recarregada automaticamente quando você fizer alterações no código fonte.

## 🎮 Como Usar

### 🖱️ Modo 2D (Padrão)

1. **Adicionar Pontos**: Clique em qualquer lugar da tela para adicionar pontos
2. **Gerenciar Camadas**: 
   - Use o botão de camadas (📚) para abrir o painel de gerenciamento
   - Adicione novas camadas com o botão ➕
   - Configure a altura Z de cada camada
   - Reorganize camadas arrastando-as
3. **Editar Nomes**: Clique duplo no nome de uma camada para editá-la

### 🔺 Modo 3D

1. **Ativar 3D**: Clique no botão 3D (🎲) para alternar para visualização tridimensional
2. **Navegação 3D**:
   - **Rotacionar**: Clique e arraste para rotacionar a cena
   - **Zoom**: Use a roda do mouse para aproximar/afastar
   - **Orientação**: Eixos coloridos (X=vermelho, Y=verde, Z=azul)

### 🎛️ Controles Adicionais

- **🧅 Onion Skin**: Toggle para visualizar todas as camadas simultaneamente
- **🗑️ Remover**: Exclua camadas desnecessárias
- **🔄 Drag & Drop**: Reordene camadas arrastando-as na lista

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── card/                 # Componente de cartão de informações
│   │   ├── diagram/              # Visualização 2D principal
│   │   ├── layer-list/           # Gerenciamento de camadas
│   │   ├── onion-skin-toggle/    # Toggle de visualização múltipla
│   │   └── three-d/              # Visualização 3D
│   ├── interfaces/
│   │   └── layer.ts              # Interface da camada
│   └── services/
│       └── layer-service.service.ts # Gerenciamento de estado das camadas
└── assets/                       # Recursos estáticos
```

## 🧮 Algoritmos Implementados

### 📐 Diagrama de Voronoi 2D
Utiliza a biblioteca D3-Delaunay para calcular células de Voronoi baseadas nos pontos de entrada.

### 🔺 Triangulação de Delaunay 2D
Implementação eficiente usando algoritmos otimizados do D3.js.

### 🎲 Tetrahedrização 3D
Algoritmo personalizado para triangulação tridimensional:
- Gera tetrahedros conectando pontos no espaço 3D
- Considera coordenadas Z reais para cada camada
- Visualiza arestas dos tetrahedros para compreensão da estrutura

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm start          # Inicia servidor de desenvolvimento
pnpm build          # Build de produção
pnpm watch          # Build com watch mode
pnpm test           # Executa testes unitários

# Angular CLI
pnpm ng generate component nome    # Gera novo componente
pnpm ng build --prod              # Build otimizado
```

## 🎨 Customização

### 🎨 Temas e Cores
O projeto utiliza CSS custom properties para personalização fácil:

```scss
:root {
  --primary: #your-color;
  --accent: #your-accent;
  --background: #your-bg;
  // ... outras variáveis
}
```

### 🔧 Configurações 3D
Ajuste parâmetros da visualização 3D em `three-d.component.ts`:

```typescript
// Configurações da câmera
this.camera.position.set(8, 8, 8);

// Controles de navegação
this.controls.minDistance = 5;
this.controls.maxDistance = 50;
```

## 👨‍💻 Autor

**Italo Filho** - [GitHub](https://github.com/papitalos)

---

⭐ **Gostou do projeto?** Deixe uma estrela no repositório!

