const ROOMS = [
  { id: 'cycling', name: 'Cycling Room', icon: '🚴', color: '#ffb74d' },
  { id: 'stretching', name: 'Stretching Room', icon: '🧘', color: '#ba68c8' },
  { id: 'boxing', name: 'Boxing Room', icon: '🥊', color: '#e57373' },
  { id: 'golf', name: 'Golf Court', icon: '⛳', color: '#7cc576' },
  { id: 'lobby', name: 'Lobby', icon: '🏢', color: '#f5c16c' },
  { id: 'men-change', name: 'Men Changing Room', icon: '🚪', color: '#90a4ae' },
  { id: 'women-change', name: 'Women Changing Room', icon: '🚪', color: '#90a4ae' },
  { id: 'women-locker', name: 'Women Locker Room', icon: '🚪', color: '#8faadc' },
  { id: 'men-locker', name: 'Men Locker Room', icon: '🚪', color: '#8faadc' },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', color: '#4da3ff' },
  { id: 'squash', name: 'Squash Courts', icon: '🏸', color: '#aed581' },
  { id: 'weight', name: 'Weight Room', icon: '🏋️', color: '#7cc576' }
];

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

  init() {
    this.createLegend();
    this.setupHotspotReferences();
    this.setupEventListeners();
  }

  createLegend() {
    const uniqueRooms = {};
    ROOMS.forEach(room => {
      if (!uniqueRooms[room.id]) uniqueRooms[room.id] = room;
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
  }

  setupHotspotReferences() {
    const hotspotElements = this.modelViewer.querySelectorAll('.Hotspot');

    hotspotElements.forEach(element => {
      const label = element.querySelector('.HotspotAnnotation');
      const roomId = element.getAttribute('data-room-id');
      if (label && roomId) {
        this.hotspots.push({ element, label, roomId });
      }
    });
  }

  setupEventListeners() {
    this.modelViewer.addEventListener('camera-change', () => {
      this.scheduleOverlapDetection();
    });

    window.addEventListener('resize', () => {
      this.scheduleOverlapDetection();
    });

    setInterval(() => this.detectOverlaps(), 500);

    this.hotspots.forEach(hotspot => {
      hotspot.element.addEventListener('mouseenter', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('mouseleave', () => {
        this.setHotspotActive(hotspot.element, false);
      });

      hotspot.element.addEventListener('click', () => {
        this.focusCameraOnHotspot(hotspot.element);
      });

      hotspot.element.addEventListener('focus', () => {
        this.setHotspotActive(hotspot.element, true);
      });

      hotspot.element.addEventListener('blur', () => {
        this.setHotspotActive(hotspot.element, false);
      });
    });

    const legendToggle = document.getElementById('legendToggle');
    if (legendToggle) {
      legendToggle.addEventListener('click', () => {
        this.legendContainer.classList.toggle('collapsed');
        legendToggle.textContent =
          this.legendContainer.classList.contains('collapsed') ? '▲' : '▼';
      });
    }
  }

  setHotspotActive(hotspotElement, isActive) {
    if (isActive) hotspotElement.classList.add('active');
    else hotspotElement.classList.remove('active');
  }

  scheduleOverlapDetection() {
    clearTimeout(this.overlapDetectionTimeout);
    this.overlapDetectionTimeout = setTimeout(() => this.detectOverlaps(), 100);
  }

  detectOverlaps() {
    const visibleLabels = [];

    this.hotspots.forEach(hotspot => {
      const label = hotspot.label;
      if (label.offsetParent !== null) {
        const rect = label.getBoundingClientRect();
        visibleLabels.push({ hotspot, rect });
      }
    });

    this.hotspots.forEach(h => h.element.classList.remove('overlapping'));

    for (let i = 0; i < visibleLabels.length; i++) {
      for (let j = i + 1; j < visibleLabels.length; j++) {
        if (this.rectsOverlap(visibleLabels[i].rect, visibleLabels[j].rect)) {
          visibleLabels[i].hotspot.element.classList.add('overlapping');
          visibleLabels[j].hotspot.element.classList.add('overlapping');
        }
      }
    }
  }

  rectsOverlap(r1, r2) {
    return !(r1.right < r2.left ||
             r1.left > r2.right ||
             r1.bottom < r2.top ||
             r1.top > r2.bottom);
  }

  focusCameraOnHotspot(hotspotElement) {
    const position = hotspotElement.getAttribute('data-position');
    if (!position) return;

    const coords = position.match(/([-\d.]+)m\s+([-\d.]+)m\s+([-\d.]+)m/);
    if (!coords) return;

    const x = parseFloat(coords[1]);
    const y = parseFloat(coords[2]);
    const z = parseFloat(coords[3]);

    const distance = 50;
    this.modelViewer.cameraOrbit = `0deg 75deg ${distance}m`;
    this.modelViewer.cameraTarget = `${x}m ${y}m ${z}m`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GymViewer();
});
