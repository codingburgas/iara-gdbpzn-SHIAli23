// Global map variable
let incidentMap = null;
let mapMarker = null;
let selectedMapLat = null;
let selectedMapLng = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadTeams();
    setupEventListeners();
    setupModeToggle();
});

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById("addIncidentForm");
    const cancelBtn = document.getElementById("cancelBtn");

    form.addEventListener("submit", handleFormSubmit);
    cancelBtn.addEventListener("click", handleCancel);
}

// Setup location mode toggle
function setupModeToggle() {
    const coordinatesModeBtn = document.getElementById("coordinatesModeBtn");
    const mapModeBtn = document.getElementById("mapModeBtn");

    coordinatesModeBtn.addEventListener("click", () => switchMode("coordinates"));
    mapModeBtn.addEventListener("click", () => switchMode("map"));

    // Add button to use map coordinates
    const useMapCoordsBtn = document.getElementById("useMapCoordsBtn");
    useMapCoordsBtn.addEventListener("click", useSelectedMapCoordinates);
}

// Switch between map and coordinates mode
function switchMode(mode) {
    const coordinatesSection = document.getElementById("coordinatesSection");
    const mapSection = document.getElementById("mapSection");
    const coordinatesModeBtn = document.getElementById("coordinatesModeBtn");
    const mapModeBtn = document.getElementById("mapModeBtn");

    if (mode === "coordinates") {
        coordinatesSection.classList.add("active");
        mapSection.classList.remove("active");
        coordinatesModeBtn.classList.add("active");
        mapModeBtn.classList.remove("active");
    } else if (mode === "map") {
        coordinatesSection.classList.remove("active");
        mapSection.classList.add("active");
        coordinatesModeBtn.classList.remove("active");
        mapModeBtn.classList.add("active");

        // Initialize map when switching to map mode
        setTimeout(() => {
            if (!incidentMap) {
                initializeMap();
            } else {
                incidentMap.invalidateSize();
            }
        }, 100);
    }
}

// Initialize the map
function initializeMap() {
    if (incidentMap) return; // Map already initialized

    // Default location (Sofia, Bulgaria)
    const defaultLat = 42.6977;
    const defaultLng = 23.3219;

    // Create map
    incidentMap = L.map("incidentMap").setView([defaultLat, defaultLng], 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(incidentMap);

    // Add click event to map
    incidentMap.on("click", (e) => {
        selectedMapLat = e.latlng.lat;
        selectedMapLng = e.latlng.lng;

        // Update marker
        if (mapMarker) {
            mapMarker.setLatLng(e.latlng);
        } else {
            mapMarker = L.circleMarker(e.latlng, {
                radius: 8,
                fillColor: "#FF6B35",
                color: "#FF8C42",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(incidentMap);
        }

        // Update display
        document.getElementById("mapLatitude").textContent = selectedMapLat.toFixed(6);
        document.getElementById("mapLongitude").textContent = selectedMapLng.toFixed(6);
    });

    // Try to use coordinates from input fields if available
    const lat = document.getElementById("latitude").value;
    const lng = document.getElementById("longitude").value;

    if (lat && lng && isValidCoordinate(lat) && isValidCoordinate(lng)) {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        incidentMap.setView([latNum, lngNum], 13);

        // Add marker
        selectedMapLat = latNum;
        selectedMapLng = lngNum;
        mapMarker = L.circleMarker([latNum, lngNum], {
            radius: 8,
            fillColor: "#FF6B35",
            color: "#FF8C42",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(incidentMap);

        document.getElementById("mapLatitude").textContent = latNum.toFixed(6);
        document.getElementById("mapLongitude").textContent = lngNum.toFixed(6);
    }
}

// Use selected map coordinates
function useSelectedMapCoordinates() {
    if (selectedMapLat === null || selectedMapLng === null) {
        showError(t('addIncident.clickMap'));
        return;
    }

    // Update input fields
    document.getElementById("latitude").value = selectedMapLat.toFixed(6);
    document.getElementById("longitude").value = selectedMapLng.toFixed(6);

    // Switch to coordinates mode
    switchMode("coordinates");

    showError(t('addIncident.coordinatesSetSuccess'));
}

// Load teams from backend
async function loadTeams() {
    const response = await apiClient.get('/teams/list');
    
    if (!response.ok) {
        console.error("Error loading teams:", response.error);
        // Continue even if teams fail to load - it's optional
        return;
    }

    const data = response.data;
    const teamSelect = document.getElementById("teamId");

    if (data.teams && data.teams.length > 0) {
        data.teams.forEach(team => {
            const option = document.createElement("option");
            option.value = team.id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const type = document.getElementById("incidentType").value;
    const address = document.getElementById("address").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const description = document.getElementById("description").value;
    const teamId = document.getElementById("teamId").value;

    // Validate required fields
    if (!type || !address) {
        showError(t('addIncident.fillRequiredFields'));
        return;
    }

    // Validate GPS coordinates if provided
    if ((latitude && !isValidCoordinate(latitude)) || (longitude && !isValidCoordinate(longitude))) {
        showError(t('addIncident.gpsInvalid'));
        return;
    }

    const requestData = {
        type,
        address,
        description: description || null
    };

    // Add optional GPS coordinates
    if (latitude) requestData.latitude = parseFloat(latitude);
    if (longitude) requestData.longitude = parseFloat(longitude);

    // Disable submit button
    const submitBtn = document.querySelector(".btn-submit");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('addIncident.loading')}`;

    // Send request
    const response = await apiClient.post('/incidents/create', requestData);
    
    if (!response.ok) {
        showError(response.error || t('addIncident.createError'));
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-check"></i> ${t('addIncident.submitButton')}`;
        return;
    }

    // Hide form and show success message
    showSuccessMessage(response.data.incident_id);

    // Redirect after 2 seconds
    setTimeout(() => {
        window.location.href = "./dashboard.html";
    }, 2000);
}

// Validate coordinate format
function isValidCoordinate(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= -180 && num <= 180;
}

// Show success message
function showSuccessMessage(incidentId) {
    const form = document.getElementById("addIncidentForm");
    const successObj = document.getElementById("successMessage");
    const successText = document.getElementById("successText");

    // Hide form
    form.style.display = "none";

    // Show success message
    successObj.style.display = "block";
    successText.textContent = t('addIncident.successRedirect');
}

// Show error message
function showError(message) {
    const errorObj = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");

    errorText.textContent = message;
    errorObj.style.display = "flex";

    // Hide error after 5 seconds
    setTimeout(() => {
        errorObj.style.display = "none";
    }, 5000);
}

// Handle cancel button
function handleCancel() {
    if (confirm(t('addIncident.cancelConfirm'))) {
        window.location.href = "./dashboard.html";
    }
}
