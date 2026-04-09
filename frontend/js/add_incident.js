// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadTeams();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById("addIncidentForm");
    const cancelBtn = document.getElementById("cancelBtn");

    form.addEventListener("submit", handleFormSubmit);
    cancelBtn.addEventListener("click", handleCancel);
}

// Load teams from backend
function loadTeams() {
    fetch("http://127.0.0.1:5000/teams/list")
        .then(response => {
            if (!response.ok) throw new Error("Грешка при зареждане на екипи");
            return response.json();
        })
        .then(data => {
            const teamSelect = document.getElementById("teamId");
            
            if (data.teams && data.teams.length > 0) {
                data.teams.forEach(team => {
                    const option = document.createElement("option");
                    option.value = team.id;
                    option.textContent = team.name;
                    teamSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error("Error loading teams:", error);
            // Continue even if teams fail to load - it's optional
        });
}

// Handle form submission
function handleFormSubmit(e) {
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
        showError("Моля, попълнете всички задължителни полета");
        return;
    }

    // Validate GPS coordinates if provided
    if ((latitude && !isValidCoordinate(latitude)) || (longitude && !isValidCoordinate(longitude))) {
        showError("GPS координатите трябва да са валидни числа");
        return;
    }

    // Prepare request data
    const requestData = {
        type: type,
        address: address,
        description: description || null,
        team_id: teamId || null
    };

    // Add optional GPS coordinates
    if (latitude) requestData.latitude = parseFloat(latitude);
    if (longitude) requestData.longitude = parseFloat(longitude);

    // Disable submit button
    const submitBtn = document.querySelector(".btn-submit");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Зареждане...';

    // Send request
    fetch("http://127.0.0.1:5000/incidents/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || "Грешка при добавяне на произшествието");
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide form and show success message
            showSuccessMessage(data.incident_id);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = "./dashboard.html";
            }, 2000);
        })
        .catch(error => {
            // Show error message
            showError(error.message || "Възникна грешка при добавяне на произшествието");
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Добави произшествие';
        });
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
    successText.textContent = `Произшествието е успешно регистрирано в системата. Пренасочване...`;
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
    if (confirm("Наистина ли искаш да отмениш добавянето на произшествието?")) {
        window.location.href = "./dashboard.html";
    }
}
