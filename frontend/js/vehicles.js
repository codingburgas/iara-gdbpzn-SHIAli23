// Vehicles Management JavaScript

document.addEventListener("DOMContentLoaded", () => {
    if (!checkUserRole()) return;
    applyRoleBasedMenuVisibility();
    setupEventListeners();
    loadVehicles();
    startNotificationPolling();
});

function checkUserRole() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = "../index.html";
        return false;
    }
    window.currentUser = JSON.parse(currentUser);
    return true;
}

function applyRoleBasedMenuVisibility() {
    const role = (window.currentUser?.role || "").toLowerCase();

    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
        el.style.display = role === "admin" ? "" : "none";
    });

    ["teams", "shifts", "settings"].forEach(page => {
        document.querySelectorAll(`[data-page="${page}"]`).forEach(el => {
            if (page === "teams") el.style.display = "";
            else el.style.display = "none";
        });
    });
}

function setupEventListeners() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
            item.classList.add("active");
            
            const page = item.getAttribute("data-page");
            const navigationMap = {
                "incidents": "./dashboard.html",
                "firefighters": "./firefighters.html",
                "teams": "./teams.html",
                "vehicles": "./vehicles.html",
                "profile": "./profile.html"
            };
            
            if (navigationMap[page]) {
                window.location.href = navigationMap[page];
            }
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("open");
            }
        });
    });

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem('currentUser');
        window.location.href = "../index.html";
    });

    const registerVehicleBtn = document.getElementById("registerVehicleBtn");
    if (registerVehicleBtn) {
        registerVehicleBtn.addEventListener("click", openRegisterVehicleModal);
    }

    const registerVehicleForm = document.getElementById("registerVehicleForm");
    if (registerVehicleForm) {
        registerVehicleForm.addEventListener("submit", handleRegisterVehicle);
    }

    // Search and filters
    const vehicleSearch = document.getElementById("vehicleSearch");
    if (vehicleSearch) {
        vehicleSearch.addEventListener("input", filterVehicles);
    }

    const vehicleStatusFilter = document.getElementById("vehicleStatusFilter");
    if (vehicleStatusFilter) {
        vehicleStatusFilter.addEventListener("change", filterVehicles);
    }

    const vehicleTypeFilter = document.getElementById("vehicleTypeFilter");
    if (vehicleTypeFilter) {
        vehicleTypeFilter.addEventListener("change", filterVehicles);
    }

    // Notification
    const notificationBtn = document.getElementById("notificationBtn");
    const notificationCenter = document.getElementById("notificationCenter");
    const closeNotificationCenter = document.getElementById("closeNotificationCenter");
    const markAllReadBtn = document.getElementById("markAllReadBtn");

    if (notificationBtn) {
        notificationBtn.addEventListener("click", () => {
            notificationCenter.classList.toggle("active");
            if (notificationCenter.classList.contains("active")) {
                loadNotifications();
            }
        });
    }

    if (closeNotificationCenter) {
        closeNotificationCenter.addEventListener("click", () => {
            notificationCenter.classList.remove("active");
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener("click", markAllNotificationsRead);
    }

    document.addEventListener("click", (e) => {
        if (notificationCenter && !notificationCenter.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationCenter.classList.remove("active");
        }
    });

    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    });
}

let allVehicles = [];

async function loadVehicles() {
    try {
        const response = await apiClient.get('/vehicles/list');
        
        if (!response.ok) {
            throw new Error("Грешка при зареждане на автомобили");
        }

        allVehicles = response.data.vehicles || [];
        displayVehicles(allVehicles);
    } catch (error) {
        console.error("Error loading vehicles:", error);
        document.getElementById("vehiclesGrid").innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">Грешка при зареждане на автомобили</div>`;
    }
}

function displayVehicles(vehicles) {
    const container = document.getElementById("vehiclesGrid");
    
    if (vehicles.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Няма автомобили</div>';
        return;
    }

    container.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-card">
            <div class="vehicle-card-header">
                <h3 class="vehicle-card-callsign">${escapeHtml(vehicle.callsign)}</h3>
                <p class="vehicle-card-plate">${escapeHtml(vehicle.plate_number)}</p>
            </div>
            <div class="vehicle-card-body">
                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">Тип:</span>
                    <span class="vehicle-info-value">${getVehicleTypeLabel(vehicle.type)}</span>
                </div>
                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">Статус:</span>
                    <span class="vehicle-info-value">${getStatusLabel(vehicle.status)}</span>
                </div>
                <div class="vehicle-info-row">
                    <span class="vehicle-info-label">Екип:</span>
                    <span class="vehicle-info-value">${vehicle.team_name || '-'}</span>
                </div>
                ${vehicle.capacity_water ? `<div class="vehicle-info-row">
                    <span class="vehicle-info-label">Вода:</span>
                    <span class="vehicle-info-value">${vehicle.capacity_water}л</span>
                </div>` : ''}
                ${vehicle.capacity_foam ? `<div class="vehicle-info-row">
                    <span class="vehicle-info-label">Пяна:</span>
                    <span class="vehicle-info-value">${vehicle.capacity_foam}л</span>
                </div>` : ''}
                <div style="margin-top: 10px;">
                    <span class="vehicle-type-badge">${getVehicleTypeLabel(vehicle.type)}</span>
                    <span class="vehicle-status-badge ${vehicle.status.toLowerCase()}">${getStatusLabel(vehicle.status)}</span>
                </div>
            </div>
            <div class="vehicle-card-footer">
                <button onclick="openVehicleDetails(${vehicle.id})">
                    <i class="fas fa-info-circle"></i> Детайли
                </button>
            </div>
        </div>
    `).join('');
}

function filterVehicles() {
    const searchTerm = document.getElementById("vehicleSearch").value.toLowerCase();
    const statusFilter = document.getElementById("vehicleStatusFilter").value;
    const typeFilter = document.getElementById("vehicleTypeFilter").value;

    const filtered = allVehicles.filter(vehicle => {
        const matchSearch = vehicle.callsign.toLowerCase().includes(searchTerm) || 
                           vehicle.plate_number.toLowerCase().includes(searchTerm);
        const matchStatus = !statusFilter || vehicle.status === statusFilter;
        const matchType = !typeFilter || vehicle.type === typeFilter;
        
        return matchSearch && matchStatus && matchType;
    });

    displayVehicles(filtered);
}

function openRegisterVehicleModal() {
    document.getElementById("registerVehicleForm").reset();
    document.getElementById("registerVehicleModal").style.display = "flex";
}

function closeRegisterVehicleModal() {
    document.getElementById("registerVehicleModal").style.display = "none";
}

async function handleRegisterVehicle(e) {
    e.preventDefault();

    const callsign = document.getElementById("vehicleCallsign").value.trim();
    const plate = document.getElementById("vehiclePlate").value.trim();
    const type = document.getElementById("vehicleType").value;
    const waterCapacity = document.getElementById("vehicleWaterCapacity").value;
    const foamCapacity = document.getElementById("vehicleFoamCapacity").value;

    if (!callsign || !plate || !type) {
        alert("Моля, попълнете всички задължителни полета");
        return;
    }

    try {
        const payload = {
            callsign,
            plate_number: plate,
            type,
            capacity_water: waterCapacity ? parseInt(waterCapacity) : null,
            capacity_foam: foamCapacity ? parseInt(foamCapacity) : null
        };

        const response = await apiClient.post('/vehicles/register', payload);

        if (!response.ok) {
            throw new Error(response.error || "Грешка при регистриране на автомобил");
        }

        alert("Автомобилът е успешно регистриран!");
        closeRegisterVehicleModal();
        loadVehicles();
    } catch (error) {
        alert("Грешка: " + error.message);
    }
}

async function openVehicleDetails(vehicleId) {
    try {
        const response = await apiClient.get(`/vehicles/${vehicleId}`);

        if (!response.ok) {
            throw new Error("Грешка при зареждане на детайли");
        }

        const vehicle = response.data;

        document.getElementById("detailCallsign").textContent = escapeHtml(vehicle.callsign);
        document.getElementById("detailPlate").textContent = escapeHtml(vehicle.plate_number);
        document.getElementById("detailType").textContent = getVehicleTypeLabel(vehicle.type);
        document.getElementById("detailStatus").textContent = getStatusLabel(vehicle.status);
        document.getElementById("detailWaterCapacity").textContent = vehicle.capacity_water ? `${vehicle.capacity_water}л` : '-';
        document.getElementById("detailFoamCapacity").textContent = vehicle.capacity_foam ? `${vehicle.capacity_foam}л` : '-';
        document.getElementById("detailAssignedTeam").textContent = vehicle.team_name || '-';
        document.getElementById("detailLocation").textContent = vehicle.latitude && vehicle.longitude 
            ? `${vehicle.latitude.toFixed(4)}, ${vehicle.longitude.toFixed(4)}` 
            : '-';

        document.getElementById("vehicleDetailsModal").style.display = "flex";
    } catch (error) {
        alert("Грешка: " + error.message);
    }
}

function closeVehicleDetailsModal() {
    document.getElementById("vehicleDetailsModal").style.display = "none";
}

function getVehicleTypeLabel(type) {
    const labels = {
        'FIRE_TRUCK': 'Пожарен автомобил',
        'CISTERN': 'Цистерна',
        'SUPPORT': 'Подпомагащ'
    };
    return labels[type] || type;
}

function getStatusLabel(status) {
    const labels = {
        'AVAILABLE': 'Disponibel',
        'ON_MISSION': 'На задача',
        'MAINTENANCE': 'Поддържане'
    };
    return labels[status] || status;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============ NOTIFICATION FUNCTIONS ============

let notificationPollInterval = null;

function startNotificationPolling() {
    updateNotificationBadge();
    notificationPollInterval = setInterval(() => {
        updateNotificationBadge();
    }, 10000);
}

async function updateNotificationBadge() {
    if (!window.currentUser) return;
    
    const response = await apiClient.get('/notifications/unread-count');
    
    if (response.ok) {
        const count = response.data.unread_count || 0;
        const badge = document.getElementById("unreadBadge");
        
        if (count > 0) {
            badge.textContent = count;
            badge.classList.add("active");
        } else {
            badge.classList.remove("active");
        }
    }
}

async function loadNotifications() {
    const notificationList = document.getElementById("notificationList");
    const response = await apiClient.get('/notifications?limit=20&offset=0');
    
    if (!response.ok) {
        notificationList.innerHTML = '<div class="notification-empty">Грешка при зареждане на уведомления</div>';
        return;
    }
    
    const notifications = response.data.notifications || [];
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="notification-empty">Няма уведомления</div>';
        return;
    }
    
    notificationList.innerHTML = notifications.filter(notif => !notif.is_read).map(notif => {
        const timeStr = formatNotificationTime(notif.created_at);
        const typeIcon = getNotificationIcon(notif.type);
        
        return `
            <div class="notification-item unread" data-notification-id="${notif.id}">
                <div class="notification-item-icon">
                    ${typeIcon}
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-title">${escapeHtml(notif.title)}</div>
                    ${notif.content ? `<div class="notification-item-content">${escapeHtml(notif.content)}</div>` : ''}
                    <div class="notification-item-time">${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notifId = item.getAttribute('data-notification-id');
            markNotificationRead(notifId);
        });
    });
}

async function markNotificationRead(notificationId) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`, {});
    
    if (response.ok) {
        const notifElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notifElement) {
            notifElement.remove();
        }
        const remainingNotifs = document.querySelectorAll('.notification-item');
        if (remainingNotifs.length === 0) {
            document.getElementById("notificationList").innerHTML = '<div class="notification-empty">Няма уведомления</div>';
        }
        updateNotificationBadge();
    }
}

async function markAllNotificationsRead() {
    const response = await apiClient.put('/notifications/mark-all-read', {});
    
    if (response.ok) {
        loadNotifications();
        updateNotificationBadge();
    }
}

function getNotificationIcon(type) {
    switch(type) {
        case 'firefighter_status_changed':
            return '<i class="fas fa-user-check"></i>';
        case 'new_task':
            return '<i class="fas fa-tasks"></i>';
        case 'new_incident':
            return '<i class="fas fa-bell"></i>';
        default:
            return '<i class="fas fa-bell"></i>';
    }
}

function formatNotificationTime(dateStr) {
    let isoStr = dateStr;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
        isoStr = dateStr + 'Z';
    }
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let relativeTime = '';
    if (diffMins < 1) relativeTime = 'Преди несолко секунди';
    else if (diffMins < 60) relativeTime = `Преди ${diffMins} мин.`;
    else if (diffHours < 24) relativeTime = `Преди ${diffHours} ч.`;
    else if (diffDays < 7) relativeTime = `Преди ${diffDays} д.`;
    else relativeTime = date.toLocaleDateString('bg-BG');
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return `${relativeTime} (${timeStr})`;
}
