// Configuration des salles
const ROOMS = [
  {
    id: 'lobby',
    name: 'Lobby',
    icon: '🏢',
    color: '#f5c16c'
  },
  {
    id: 'women-locker',
    name: 'Women Locker Room',
    icon: '🚪',
    color: '#8faadc'
  },
  {
    id: 'men-locker',
    name: 'Men Locker Room',
    icon: '🚪',
    color: '#8faadc'
  },
  {
    id: 'pool',
    name: 'Swimming Pool',
    icon: '🏊',
    color: '#4da3ff'
  },
  {
    id: 'golf',
    name: 'Golf Court',
    icon: '⛳',
    color: '#7cc576'
  },
  {
    id: 'boxing',
    name: 'Boxing Room',
    icon: '🥊',
    color: '#e57373'
  },
  {
    id: 'stretching',
    name: 'Stretching Room',
    icon: '🧘',
    color: '#ba68c8'
  },
  {
    id: 'weight',
    name: 'Weight Room',
    icon: '🏋️',
    color: '#7cc576'
  }
];

/**
 * Classe principale pour gérer le visualiseur de salle de sport
 */
class GymViewer {
  constructor() {
    this.modelViewer = document.getElementById('modelViewer');
    this.legendContainer = document.getElementById('legend');
    this.hotspots = [];
    this.overlapDetectionTimeout = null;
    
    if (this.modelViewer && this.legendContainer) {
      this.init();
    }
  }

  /**
   * Initialise l'application
   */
  init() {
    console.log('GymViewer initialization started...');
    this.createLegend();
    this.setupHotspotReferences();
    this.setupEventListeners();
    console.log('GymViewer initialization completed!');
  }

  /**
   * Crée la légende avec les salles uniques
   */
  createLegend() {
    const uniqueRooms = {};
    
    ROOMS.forEach(room => {
      if (!uniqueRooms[room.id]) {
        uniqueRooms[room.id] = room;
      }
    });

    Object.values(uniqueRooms).forEach(room => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      
      const color = document.createElement('div');
      color.className = 'legend-item-color';
      color.style.backgroundColor = room.color;
      
      const icon = document.createElement('span');
      icon.className = 'legend-item-icon';
      icon.textContent = room.icon;
      
      const text = document.createElement('span');
      text.textContent = room.name;
      
      item.appendChild(color);
      item.appendChild(icon);
      item.appendChild(text);
      
      this.legendContainer.appendChild(item);
    });
    
    console.log('✓ Légende créée');
  }

  /**
   * Récupère les références des hotspots existants dans le HTML
   */
  setupHotspotReferences() {
    const hotspotElements = this.modelViewer.querySelectorAll('.Hotspot');
    
    hotspotElements.forEach((element) => {
      const label = element.querySelector('.HotspotAnnotation');
      const roomId = element.getAttribute('data-room-id');
      
      if (label && roomId) {
        this.hotspots.push({
          element: element,
          label: label,
          roomId: roomId
        });
      }
    });
    
    console.log(`✓ ${this.hotspots.length} hotspots trouvés`);
  }

  /**
   * Configure tous les event listeners
   */
  setupEventListeners() {
    // Événements de la caméra
    this.modelViewer.addEventListener('camera-change', () => {
      this.scheduleOverlapDetection();
    });

    // Événements de redimensionnement
    window.addEventListener('resize', () => {
      this.scheduleOverlapDetection();
    });

    // Détection périodique
    setInterval(() => this.detectOverlaps(), 500);

    // Événements des hotspots individuels
    this.hotspots.forEach(hotspot => {
      hotspot.element.addEventListener('mouseenter', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('mouseleave', () => {
        this.setHotspotActive(hotspot.element, false);
      });

      hotspot.element.addEventListener('click', () => {
        this.handleHotspotClick(hotspot.roomId);
        this.focusCameraOnHotspot(hotspot.element);
      });

      hotspot.element.addEventListener('focus', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('blur', () => {
        this.setHotspotActive(hotspot.element, false);
      });
    });

    // Legend toggle
    const legendToggle = document.getElementById('legendToggle');
    if (legendToggle) {
      legendToggle.addEventListener('click', () => {
        this.legendContainer.classList.toggle('collapsed');
        legendToggle.textContent = this.legendContainer.classList.contains('collapsed') ? '▲' : '▼';
      });
    }
  }

  /**
   * Active ou désactive l'état d'un hotspot
   */
  setHotspotActive(hotspotElement, isActive) {
    if (isActive) {
      hotspotElement.classList.add('active');
    } else {
      hotspotElement.classList.remove('active');
    }
  }

  /**
   * Programme la détection de chevauchement avec délai
   */
  scheduleOverlapDetection() {
    clearTimeout(this.overlapDetectionTimeout);
    this.overlapDetectionTimeout = setTimeout(() => this.detectOverlaps(), 100);
  }

  /**
   * Détecte les hotspots qui se chevauchent
   */
  detectOverlaps() {
    const visibleLabels = [];

    // Collecter tous les labels visibles
    this.hotspots.forEach(hotspot => {
      const label = hotspot.label;
      if (label.offsetParent !== null) {
        const rect = label.getBoundingClientRect();
        visibleLabels.push({
          hotspot,
          rect: {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          }
        });
      }
    });

    // Réinitialiser les classes overlapping
    this.hotspots.forEach(h => h.element.classList.remove('overlapping'));

    // Détecter les chevauchements
    for (let i = 0; i < visibleLabels.length; i++) {
      for (let j = i + 1; j < visibleLabels.length; j++) {
        if (this.rectsOverlap(visibleLabels[i].rect, visibleLabels[j].rect)) {
          visibleLabels[i].hotspot.element.classList.add('overlapping');
          visibleLabels[j].hotspot.element.classList.add('overlapping');
        }
      }
    }
  }

  /**
   * Vérifie si deux rectangles se chevauchent
   */
  rectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
  }

  /**
   * Gère le clic sur un hotspot
   */
  handleHotspotClick(roomId) {
    console.log(`Room selected: ${roomId}`);
    // Ajouter ici les actions au clic (navigation, modal, etc.)
  }

  /**
   * Oriente la caméra pour regarder un hotspot
   */
  focusCameraOnHotspot(hotspotElement) {
    const position = hotspotElement.getAttribute('data-position');
    if (!position) return;

    // Parse position string (format: "Xm Ym Zm")
    const coords = position.match(/([-\d.]+)m\s+([-\d.]+)m\s+([-\d.]+)m/);
    if (!coords) return;

    const x = parseFloat(coords[1]);
    const y = parseFloat(coords[2]);
    const z = parseFloat(coords[3]);

    // Calculate distance from hotspot (camera will orbit at this distance)
    const distance = 50;

    // Calculate angle based on current camera orbit to create smooth rotation
    const modelViewer = this.modelViewer;
    
    // Animate camera to look at the hotspot
    // Format: "xDeg yDeg distanceM"
    modelViewer.cameraOrbit = `0deg 75deg ${distance}m`;
    modelViewer.cameraTarget = `${x}m ${y}m ${z}m`;

    // Animate rotation around the hotspot
    let rotation = 0;
    const rotationInterval = setInterval(() => {
      rotation += 2;
      if (rotation >= 360) {
        clearInterval(rotationInterval);
        rotation = 0;
      }
      modelViewer.cameraOrbit = `${rotation}deg 75deg ${distance}m`;
    }, 30);
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  new GymViewer();
  
  // Prevent hotspot labels from rotating with camera
  const modelViewer = document.getElementById('modelViewer');
  if (modelViewer) {
    modelViewer.addEventListener('camera-change', () => {
      preventHotspotRotation();
    });
  }
});

// Fallback si le document est déjà chargé
if (document.readyState !== 'loading') {
  new GymViewer();
  
  const modelViewer = document.getElementById('modelViewer');
  if (modelViewer) {
    modelViewer.addEventListener('camera-change', () => {
      preventHotspotRotation();
    });
  }
}

/**
 * Empêche les labels de hotspot de tourner avec la caméra
 */
function preventHotspotRotation() {
  const hotspotLabels = document.querySelectorAll('.HotspotAnnotation');
  hotspotLabels.forEach(label => {
    label.style.transform = 'translateY(-50%) rotateZ(0deg) rotateX(0deg) rotateY(0deg)';
  });
}
