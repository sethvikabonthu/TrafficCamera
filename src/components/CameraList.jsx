import React, { useEffect, useState, useRef } from "react";
import { getCameras } from "../services/cameraService";
import CameraCard from "./CameraCard";
import MapComponent from "./MapComponent";

function CameraList() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & View states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState("ALL");
  const [filterFavsOnly, setFilterFavsOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  
  // Favorites persistence
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("calgary_traffic_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Lightbox Modal state
  const [lightboxCamera, setLightboxCamera] = useState(null);

  // Auto-refresh states (30 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const timerRef = useRef(null);

  // Load cameras on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getCameras();
        setCameras(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load cameras", err);
        setError("Could not connect to the backend server. Make sure server.js is running.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("calgary_traffic_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Auto-refresh timer logic
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger reload of camera images by updating timestamp
          setRefreshTrigger(Date.now());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, refreshTrigger]);

  // Handle manual reload of data
  const handleManualReload = async () => {
    try {
      setLoading(true);
      const data = await getCameras();
      setCameras(data);
      setRefreshTrigger(Date.now());
      setCountdown(30);
      setError(null);
    } catch (err) {
      setError("Failed to refresh cameras. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  // Filter cameras based on user inputs
  const filteredCameras = cameras.filter((cam) => {
    // 1. Filter by Favorites Tab
    if (filterFavsOnly && !favorites.includes(cam.id)) return false;
    
    // 2. Filter by Quadrant Tab
    if (selectedQuadrant !== "ALL" && cam.quadrant.toUpperCase() !== selectedQuadrant) return false;
    
    // 3. Filter by Search Query
    if (
      searchTerm &&
      !cam.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });

  // Count summaries
  const totalCount = cameras.length;
  const favCount = favorites.length;
  const nwCount = cameras.filter((c) => c.quadrant.toUpperCase() === "NW").length;
  const neCount = cameras.filter((c) => c.quadrant.toUpperCase() === "NE").length;
  const swCount = cameras.filter((c) => c.quadrant.toUpperCase() === "SW").length;
  const seCount = cameras.filter((c) => c.quadrant.toUpperCase() === "SE").length;

  return (
    <div className="traffic-viewer-content">
      {/* Dashboard Stats */}
      {!loading && !error && (
        <div className="dashboard-stats fade-in">
          <div className="stat-card glass-panel">
            <span className="stat-label">Total Cameras</span>
            <span className="stat-value">{totalCount}</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-label">Favorites</span>
            <span className="stat-value text-heart">{favCount}</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-label">Quadrants</span>
            <div className="quadrant-mini-stats">
              <span>NW: {nwCount}</span>
              <span>NE: {neCount}</span>
              <span>SW: {swCount}</span>
              <span>SE: {seCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="control-panel glass-panel">
        {/* Search Input */}
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="camera-search"
            type="text"
            placeholder="Search by street name or intersection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              &times;
            </button>
          )}
        </div>

        {/* View Switcher & Controls */}
        <div className="control-actions">
          {/* Refresh Timer */}
          <div className="refresh-control">
            <button 
              className={`refresh-btn ${loading ? "loading" : ""}`}
              onClick={handleManualReload}
              title="Reload all cameras"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
            <div className="auto-refresh-toggle">
              <label className="switch">
                <input
                  id="auto-refresh-checkbox"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="auto-refresh-label">
                {autoRefresh ? `Auto-Refresh (${countdown}s)` : "Auto-Refresh Off"}
              </span>
            </div>
          </div>

          {/* View Toggle (Grid / Map) */}
          <div className="view-toggle-group">
            <button
              id="btn-view-grid"
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Grid</span>
            </button>
            <button
              id="btn-view-map"
              className={`toggle-btn ${viewMode === "map" ? "active" : ""}`}
              onClick={() => setViewMode("map")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu (All/Favs & Quadrants) */}
      <div className="tabs-bar">
        <div className="tab-group flex-wrap">
          <button
            className={`tab-item ${!filterFavsOnly ? "active" : ""}`}
            onClick={() => setFilterFavsOnly(false)}
          >
            All Cameras
          </button>
          <button
            className={`tab-item ${filterFavsOnly ? "active" : ""}`}
            onClick={() => setFilterFavsOnly(true)}
          >
            ★ Favorites <span className="tab-count">{favCount}</span>
          </button>
        </div>

        <div className="divider-vr"></div>

        <div className="tab-group flex-wrap quadrant-tabs">
          {["ALL", "NW", "NE", "SW", "SE"].map((quad) => (
            <button
              key={quad}
              className={`tab-item ${selectedQuadrant === quad ? "active" : ""}`}
              onClick={() => setSelectedQuadrant(quad)}
            >
              {quad}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-panel glass-panel fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleManualReload}>
            Try Connecting Again
          </button>
        </div>
      )}

      {/* Main Content View (Grid or Map) */}
      {!error && (
        <>
          {loading ? (
            /* Skeleton Loading State */
            <div className="camera-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel camera-card skeleton-card">
                  <div className="skeleton-header skeleton" style={{ height: "24px", marginBottom: "16px" }}></div>
                  <div className="skeleton-img skeleton" style={{ height: "220px", borderRadius: "10px" }}></div>
                </div>
              ))}
            </div>
          ) : filteredCameras.length === 0 ? (
            /* Empty State */
            <div className="empty-state glass-panel fade-in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <h3>No Cameras Found</h3>
              <p>
                {filterFavsOnly
                  ? "You haven't added any cameras to your favorites yet. Heart a camera to display it here!"
                  : "We couldn't find any cameras matching your search or filters. Try adjusting your query."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="camera-grid">
              {filteredCameras.map((camera) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                  isFavorite={favorites.includes(camera.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={setLightboxCamera}
                />
              ))}
            </div>
          ) : (
            /* Map View */
            <div className="fade-in">
              <MapComponent
                cameras={filteredCameras}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}
        </>
      )}

      {/* Lightbox / Modal View */}
      {lightboxCamera && (
        <div 
          className="lightbox-overlay fade-in"
          onClick={() => setLightboxCamera(null)}
        >
          <div 
            className="lightbox-content glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div>
                <span className={`quadrant-badge badge-${lightboxCamera.quadrant.toLowerCase()}`}>
                  {lightboxCamera.quadrant}
                </span>
                <h2>{lightboxCamera.location}</h2>
              </div>
              <button className="close-lightbox" onClick={() => setLightboxCamera(null)}>
                &times;
              </button>
            </div>
            
            <div className="lightbox-body">
              <img 
                src={`${lightboxCamera.imageUrl}?t=${refreshTrigger}`} 
                alt={lightboxCamera.location} 
                className="lightbox-img"
              />
            </div>

            <div className="lightbox-footer">
              <button 
                className={`fav-button-lightbox ${favorites.includes(lightboxCamera.id) ? "active" : ""}`}
                onClick={() => handleToggleFavorite(lightboxCamera.id)}
              >
                <svg viewBox="0 0 24 24" fill={favorites.includes(lightboxCamera.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{favorites.includes(lightboxCamera.id) ? "Favorited" : "Add to Favorites"}</span>
              </button>
              <div className="lightbox-refresh">
                Auto-updates with traffic feed
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CameraList;
