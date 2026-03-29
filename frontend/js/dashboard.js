// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    loadIncidents();
    document.querySelectorAll(".menu-item").forEach((item, index) => {
        item.classList.remove("active");
        if (index === 0) item.classList.add("active");
    });
});

// Toggle sidebar with content shift
document.getElementById("menuBtn").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    const content = document.querySelector(".content");
    sidebar.classList.toggle("open");
    
    // Shift content when sidebar opens
    if (sidebar.classList.contains("open")) {
        content.style.marginLeft = "270px";
    } else {
        content.style.marginLeft = "0";
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
});

// Send to Create Incident Page
document.getElementById("addIncidentBtn").addEventListener("click", () => {
    window.location.href = "./create_incident.html";
});

// Fetch and populate incidents
function loadIncidents() {
    const grid = document.getElementById("incidentsGrid");
    const emptyStateMessage = document.getElementById("emptyStateMessage");

    // Clear grid
    grid.innerHTML = '<div class="loading-card">Зареждане на произшествия...</div>';
    emptyStateMessage.style.display = "none";

    // Fetch incidents
    fetch("http://127.0.0.1:5000/incidents/list")
        .then(response => {
            if (!response.ok) throw new Error("Грешка при зареждане на произшествия");
            return response.json();
        })
        .then(data => {
            grid.innerHTML = "";

            if (!data.incidents || data.incidents.length === 0) {
                emptyStateMessage.style.display = "block";
                return;
            }

            // Calculate stats
            let activeCount = 0, completedCount = 0, onHoldCount = 0;
            
            data.incidents.forEach(incident => {
                const statusLower = (incident.status || "активно").toLowerCase();
                if (statusLower === "активно" || statusLower === "в работа") activeCount++;
                else if (statusLower === "приключено") completedCount++;
                else if (statusLower === "приостановено") onHoldCount++;
            });

            // Update stats
            document.getElementById("activeCount").textContent = activeCount;
            document.getElementById("completedCount").textContent = completedCount;
            document.getElementById("onHoldCount").textContent = onHoldCount;
            document.getElementById("totalCount").textContent = data.incidents.length;

            // Create incident cards
            data.incidents.forEach(incident => {
                const card = document.createElement("div");
                card.className = "incident-card";
                const statusBadge = getStatusBadge(incident.status || "активно");
                const formattedDate = formatDate(incident.date_time || incident.dateTime || new Date().toISOString());

                card.innerHTML = `
                    <div class="incident-header">
                        <div>
                            <div class="incident-id">#${incident.id || "N/A"}</div>
                            <div class="incident-type">${incident.type || "Неизвестен тип"}</div>
                            <div class="incident-address">${incident.address || "Адрес не е посочен"}</div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    <div class="incident-meta">
                        <div class="incident-datetime">${formattedDate}</div>
                        <button class="btn-details" onclick="viewIncidentDetails(${incident.id || 0})">
                            Детайли
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading incidents:", error);
            grid.innerHTML = `
                <div class="loading-card" style="color: #ff6b6b; text-align: center;">
                    Грешка при зареждане на произшествия. Проверете връзката с сървъра.
                </div>
            `;
        });
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
    console.log("Viewing incident:", incidentId);
    // TODO: implement navigation to incident details page
    alert(`Детайли на произшествие ${incidentId} (към разработка)`);
}
