// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadIncidents();
    initializeMenuItems();
    setupEventListeners();
    checkUserRole();
});

// Check user role from localStorage
function checkUserRole() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = "../index.html";
    }
    window.currentUser = JSON.parse(currentUser);
}

// Initialize menu items
function initializeMenuItems() {
    document.querySelectorAll(".menu-item").forEach((item, index) => {
        item.classList.remove("active");
        if (index === 0) item.classList.add("active");
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Close sidebar when clicking menu items
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
            item.classList.add("active");
            
            // Get page name and navigate
            const page = item.getAttribute("data-page");
            const navigationMap = {
                "incidents": "./dashboard.html",
                "firefighters": "./firefighters.html",
                "teams": "./teams.html",
                "vehicles": "./vehicles.html",
                "shifts": "./shifts.html",
                "settings": "./settings.html"
            };
            
            if (navigationMap[page]) {
                window.location.href = navigationMap[page];
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("open");
            }
        });
    });

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem('currentUser');
        window.location.href = "../index.html";
    });

    // Add Incident
    const addIncidentBtn = document.getElementById("addIncidentBtn");
    addIncidentBtn.addEventListener("click", () => {
        window.location.href = "./add_incident.html";
    });

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", filterIncidents);

    // Filter functionality
    const filterStatus = document.getElementById("filterStatus");
    filterStatus.addEventListener("change", filterIncidents);

    // Close sidebar on outside click
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    });
}

// Fetch and populate incidents
function loadIncidents() {
    const tableBody = document.getElementById("incidentsTableBody");
    const emptyStateMessage = document.getElementById("emptyStateMessage");
    const recordCount = document.getElementById("recordCount");

    // Show loading state
    tableBody.innerHTML = '<tr class="loading-row"><td colspan="6">Зареждане на произшествия...</td></tr>';
    emptyStateMessage.style.display = "none";

    // Fetch incidents
    fetch("http://127.0.0.1:5000/incidents/list")
        .then(response => {
            if (!response.ok) throw new Error("Грешка при зареждане на произшествия");
            return response.json();
        })
        .then(data => {
            if (!data.incidents || data.incidents.length === 0) {
                tableBody.innerHTML = "";
                emptyStateMessage.style.display = "flex";
                recordCount.textContent = "0 записа";
                updateStats([], data.incidents || []);
                return;
            }

            // Store incidents globally for filtering
            window.allIncidents = data.incidents;

            // Update stats
            updateStats(data.incidents, data.incidents);

            // Populate table
            populateTable(data.incidents);

            // Update record count
            recordCount.textContent = `${data.incidents.length} ${data.incidents.length === 1 ? "запис" : "записа"}`;
        })
        .catch(error => {
            console.error("Error loading incidents:", error);
            tableBody.innerHTML = `<tr class="loading-row"><td colspan="6" style="color: #ff6b6b;">Грешка при зареждане на произшествия</td></tr>`;
            emptyStateMessage.style.display = "none";
        });
}

// Update statistics
function updateStats(filtered, all) {
    let activeCount = 0, completedCount = 0, onHoldCount = 0, totalCount = all.length;
    
    filtered.forEach(incident => {
        const statusLower = (incident.status || "активно").toLowerCase();
        if (statusLower === "активно" || statusLower === "в работа") activeCount++;
        else if (statusLower === "приключено") completedCount++;
        else if (statusLower === "приостановено") onHoldCount++;
    });

    document.getElementById("activeCount").textContent = activeCount;
    document.getElementById("completedCount").textContent = completedCount;
    document.getElementById("onHoldCount").textContent = onHoldCount;
    document.getElementById("totalCount").textContent = totalCount;
}

// Populate table with incidents
function populateTable(incidents) {
    const tableBody = document.getElementById("incidentsTableBody");
    const emptyStateMessage = document.getElementById("emptyStateMessage");
    const recordCount = document.getElementById("recordCount");

    tableBody.innerHTML = "";

    if (incidents.length === 0) {
        tableBody.innerHTML = "";
        emptyStateMessage.style.display = "flex";
        recordCount.textContent = "0 записа";
        return;
    }

    emptyStateMessage.style.display = "none";

    incidents.forEach(incident => {
        const row = document.createElement("tr");
        const statusBadge = getStatusBadge(incident.status || "активно");
        const formattedDate = formatDate(incident.date_time || incident.dateTime || new Date().toISOString());

        row.innerHTML = `
            <td>${incident.id || "N/A"}</td>
            <td>${incident.type || "Неизвестен"}</td>
            <td>${incident.address || "N/A"}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td><button class="btn-action" onclick="viewIncidentDetails(${incident.id || 0})">Преглед</button></td>
        `;
        tableBody.appendChild(row);
    });

    recordCount.textContent = `${incidents.length} ${incidents.length === 1 ? "запис" : "записа"}`;
}

// Filter incidents
function filterIncidents() {
    if (!window.allIncidents) return;

    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const filterStatus = document.getElementById("filterStatus").value.toLowerCase();

    const filtered = window.allIncidents.filter(incident => {
        const matchSearch = 
            (incident.id + "").includes(searchTerm) ||
            (incident.type || "").toLowerCase().includes(searchTerm) ||
            (incident.address || "").toLowerCase().includes(searchTerm);

        const incidentStatusLower = (incident.status || "активно").toLowerCase();
        const matchStatus = !filterStatus || incidentStatusLower === filterStatus;

        return matchSearch && matchStatus;
    });

    populateTable(filtered);
    updateStats(filtered, window.allIncidents);
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        "активно": { class: "status-active", text: "Активно" },
        "приключено": { class: "status-completed", text: "Приключено" },
        "в работа": { class: "status-active", text: "В работа" },
        "приостановено": { class: "status-on-hold", text: "Приостановено" },
        "отменено": { class: "status-cancelled", text: "Отменено" }
    };

    const statusLower = (status || "активно").toLowerCase();
    const config = statusMap[statusLower] || statusMap["активно"];

    return `<span class="status-badge ${config.class}">${config.text}</span>`;
}

// Format date time
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch (e) {
        return "N/A";
    }
}

// View incident details
function viewIncidentDetails(incidentId) {
    fetch(`http://127.0.0.1:5000/incidents/${incidentId}`)
        .then(response => {
            if (!response.ok) throw new Error("Грешка при зареждане на детайлите");
            return response.json();
        })
        .then(incident => {
            // Set modal content
            document.getElementById("detailId").textContent = incident.id || "-";
            document.getElementById("detailType").textContent = incident.type || "-";
            document.getElementById("detailAddress").textContent = incident.address || "-";
            document.getElementById("detailDateTime").textContent = formatDate(incident.created_at) || "-";
            document.getElementById("detailDescription").textContent = incident.description || "(Няма описание)";
            
            // GPS coordinates
            if (incident.latitude && incident.longitude) {
                document.getElementById("detailCoordinates").textContent = 
                    `${incident.latitude}, ${incident.longitude}`;
            } else {
                document.getElementById("detailCoordinates").textContent = "-";
            }
            
            document.getElementById("detailTeam").textContent = incident.team_id ? `Екип ID: ${incident.team_id}` : "Не е определен";
            
            // Status
            const statusBadge = getStatusBadge(incident.status);
            document.getElementById("detailStatus").innerHTML = statusBadge;
            
            // Store current incident for updates
            window.currentIncident = incident;
            
            // Show status change controls only for admins
            const statusChangeContainer = document.getElementById("statusChangeContainer");
            const deleteIncidentBtn = document.getElementById("deleteIncidentBtn");
            
            if (window.currentUser && window.currentUser.role && window.currentUser.role.toLowerCase() === 'admin') {
                statusChangeContainer.style.display = "flex";
                deleteIncidentBtn.style.display = "block";
                document.getElementById("newStatusSelect").value = incident.status || "активно";
            } else {
                statusChangeContainer.style.display = "none";
                deleteIncidentBtn.style.display = "none";
            }
            
            // Open modal
            document.getElementById("incidentModal").style.display = "flex";
        })
        .catch(error => {
            console.error("Error loading incident details:", error);
            alert("Грешка при зареждане на детайлите на произшествието");
        });
}

// Close incident modal
function closeIncidentModal() {
    document.getElementById("incidentModal").style.display = "none";
}

// Update incident status
function updateIncidentStatus() {
    if (!window.currentIncident) return;
    
    const newStatus = document.getElementById("newStatusSelect").value;
    const incidentId = window.currentIncident.id;
    
    fetch(`http://127.0.0.1:5000/incidents/${incidentId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: newStatus,
            user_role: window.currentUser.role
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || "Грешка при обновяване на статуса");
                });
            }
            return response.json();
        })
        .then(data => {
            alert("Статусът е успешно обновен!");
            closeIncidentModal();
            loadIncidents();
        })
        .catch(error => {
            console.error("Error updating status:", error);
            alert(error.message);
        });
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    const modal = document.getElementById("incidentModal");
    if (event.target === modal) {
        closeIncidentModal();
    }
});

// Delete incident with confirmation
function deleteIncidentConfirm() {
    if (!window.currentIncident) return;
    
    const incidentId = window.currentIncident.id;
    const confirmDelete = confirm(`Наистина ли искаш да изтриеш произшествието #${incidentId}? Това действие е необратимо.`);
    
    if (!confirmDelete) return;
    
    deleteIncident(incidentId);
}

// Delete incident function
function deleteIncident(incidentId) {
    fetch(`http://127.0.0.1:5000/incidents/${incidentId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "user-role": window.currentUser.role
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || "Грешка при изтриване на произшествието");
                });
            }
            return response.json();
        })
        .then(data => {
            alert("Произшествието е успешно изтрито!");
            closeIncidentModal();
            loadIncidents();
        })
        .catch(error => {
            console.error("Error deleting incident:", error);
            alert(error.message || "Възникна грешка при изтриване на произшествието");
        });
}
