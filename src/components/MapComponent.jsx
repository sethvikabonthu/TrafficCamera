import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapComponent({ cameras, favorites, onToggleFavorite }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Calgary coordinates: Latitude = 51.0447, Longitude = -114.0719
    const map = L.map(mapContainerRef.current, {
      center: [51.0447, -114.0719],
      zoom: 11,
      minZoom: 10,
      maxZoom: 16,
      zoomControl: true,
    });

    // Use CartoDB Dark Matter tile layer for premium dark aesthetics
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markerGroupRef.current = markerGroup;

    // Fix leaflet zoom position to bottom right to keep top clear
    map.zoomControl.setPosition("bottomright");

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when cameras or favorites change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    // Clear old markers
    markerGroup.clearLayers();

    const bounds = [];

    cameras.forEach((camera) => {
      if (camera.latitude === null || camera.longitude === null) return;

      const isFav = favorites.includes(camera.id);
      
      // Define a custom div icon
      const iconHtml = `
        <div class="marker-container ${isFav ? "is-fav" : ""}">
          <div class="pulse-ring"></div>
          <div class="marker-core">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });

      // Create marker
      const marker = L.marker([camera.latitude, camera.longitude], {
        icon: customIcon,
      });

      // Custom HTML Popup content
      const popupContent = document.createElement("div");
      popupContent.className = "map-popup-content";
      popupContent.innerHTML = `
        <div class="popup-header">
          <span class="popup-quadrant ${camera.quadrant.toLowerCase()}">${camera.quadrant}</span>
          <h4 class="popup-title">${camera.location}</h4>
        </div>
        <div class="popup-img-wrapper">
          <div class="popup-skeleton skeleton"></div>
          <img src="${camera.imageUrl}" alt="${camera.location}" class="popup-img" />
        </div>
        <div class="popup-actions">
          <button class="popup-fav-btn ${isFav ? "active" : ""}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>${isFav ? "Favorited" : "Favorite"}</span>
          </button>
        </div>
      `;

      // Set up click handler for the favorite button inside the popup
      const favBtn = popupContent.querySelector(".popup-fav-btn");
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onToggleFavorite(camera.id);
        
        // Toggle active visual state in real-time inside the popup
        const wasFav = favBtn.classList.contains("active");
        if (wasFav) {
          favBtn.classList.remove("active");
          favBtn.querySelector("svg").setAttribute("fill", "none");
          favBtn.querySelector("span").textContent = "Favorite";
        } else {
          favBtn.classList.add("active");
          favBtn.querySelector("svg").setAttribute("fill", "currentColor");
          favBtn.querySelector("span").textContent = "Favorited";
        }
      });

      // Handle image load
      const img = popupContent.querySelector(".popup-img");
      const skel = popupContent.querySelector(".popup-skeleton");
      img.onload = () => {
        skel.style.display = "none";
        img.style.opacity = 1;
      };
      img.onerror = () => {
        skel.style.display = "none";
        img.style.display = "none";
        const errorText = document.createElement("div");
        errorText.className = "popup-error";
        errorText.innerHTML = "<span>Camera Offline</span>";
        img.parentNode.appendChild(errorText);
      };

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        minWidth: 260,
      });

      markerGroup.addLayer(marker);
      bounds.push([camera.latitude, camera.longitude]);
    });

    // Zoom map to fit markers if cameras count is not empty
    if (bounds.length > 0 && cameras.length < 50) {
      // Fit bounds if we're viewing a filtered set (e.g. favorites or single search result)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [cameras, favorites]);

  return <div ref={mapContainerRef} className="map-container" />;
}

export default MapComponent;
