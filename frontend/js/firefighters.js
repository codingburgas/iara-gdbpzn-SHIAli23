// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    if (!checkUserRole()) return;
    applyRoleBasedMenuVisibility();
    loadFirefighters();
    initializeMenuItems();
    setupEventListeners();
});

// Check user role from localStorage - Admin only for firefighters page
function checkUserRole() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = "../index.html";
        return false;
    }
    
    window.currentUser = JSON.parse(currentUser);
    
    // Check if user is admin
    if (window.currentUser.role.toLowerCase() !== 'admin') {
        document.getElementById("firefightersTableBody").innerHTML = '';
        document.getElementById("emptyStateMessage").style.display = 'flex';
        document.getElementById("emptyStateMessage").innerHTML = `
            <i class="fas fa-lock empty-state-icon"></i>
            <h3>Доступ забранен</h3>
            <p>Само администратори могат да видят страницата на пожарниларите</p>
        `;
        const addFirefighterBtn = document.getElementById("addFirefighterBtn");
        if (addFirefighterBtn) addFirefighterBtn.style.display = 'none';
    }

    return true;
}

function applyRoleBasedMenuVisibility() {
    const role = (window.currentUser?.role || "").toLowerCase();

    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
        el.style.display = role === "admin" ? "" : "none";
    });

    ["shifts", "settings"].forEach(page => {
        document.querySelectorAll(`[data-page="${page}"]`).forEach(el => (el.style.display = "none"));
    });
}

// Initialize menu items
function initializeMenuItems() {
    document.querySelectorAll(".menu-item").forEach((item, index) => {
        item.classList.remove("active");
        item.addEventListener("click", (e) => {
            const page = item.getAttribute("data-page");
            handleMenuNavigation(page, e);
        });
    });
    
    // Set firefighters as active
    document.querySelector('[data-page="firefighters"]').classList.add("active");
}

// Handle menu navigation
function handleMenuNavigation(page, clickEvent) {
    document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
    clickEvent?.target.closest(".menu-item")?.classList.add("active");
    
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
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("open");
    }
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
        item.addEventListener("click", () => {
            document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
            item.classList.add("active");
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

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", filterFirefighters);
    }

    // Close sidebar on outside click
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    });

    // Notification button and center
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

    // Close notification center on outside click
    document.addEventListener("click", (e) => {
        if (notificationCenter && !notificationCenter.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationCenter.classList.remove("active");
        }
    });

    // Start notification polling with auto-refresh of firefighter list
    startNotificationPolling();
}

// Load firefighters from backend
async function loadFirefighters() {
    if (!window.currentUser || window.currentUser.role.toLowerCase() !== 'admin') {
        return;
    }

    const tableBody = document.getElementById("firefightersTableBody");
    const emptyStateMessage = document.getElementById("emptyStateMessage");

    // Show loading state
    tableBody.innerHTML = '<tr class="loading-row"><td colspan="6">Зареждане на пожарникари...</td></tr>';
    emptyStateMessage.style.display = "none";

    // Fetch firefighters from backend
    const response = await apiClient.get('/firefighters/list');
    
    if (!response.ok) {
        console.error("Error loading firefighters:", response.error);
        tableBody.innerHTML = `<tr class="loading-row"><td colspan="6" style="color: #ff6b6b;">${response.error}</td></tr>`;
        emptyStateMessage.style.display = "none";
        return;
    }

    const data = response.data;
    window.allFirefighters = data.firefighters || [];
    console.log("Firefighters loaded from backend:", window.allFirefighters);
    
    if (window.allFirefighters.length === 0) {
        tableBody.innerHTML = "";
        emptyStateMessage.style.display = "flex";
        emptyStateMessage.innerHTML = `
            <i class="fas fa-inbox empty-state-icon"></i>
            <h3>Няма пожарникари</h3>
            <p>Добавете първи пожарникар</p>
        `;
        updateStats([]);
        return;
    }

    // Populate table
    renderFirefighterList(window.allFirefighters);
    updateStats(window.allFirefighters);
}

// Render firefighter list
function renderFirefighterList(firefighters) {
    const tableBody = document.getElementById("firefightersTableBody");
    const emptyStateMessage = document.getElementById("emptyStateMessage");
    const recordCount = document.getElementById("recordCount");

    tableBody.innerHTML = "";

    if (firefighters.length === 0) {
        emptyStateMessage.style.display = "flex";
        recordCount.textContent = "0 записа";
        return;
    }

    emptyStateMessage.style.display = "none";

    firefighters.forEach(firefighter => {
        const row = document.createElement("tr");
        const statusBadge = getStatusBadge(firefighter.status || "Активен");

        row.innerHTML = `
            <td>${firefighter.name}</td>
            <td>${firefighter.username}</td>
            <td><span class="role-badge role-firefighter"><i class="fas fa-fire"></i> Пожарникар</span></td>
            <td>${statusBadge}</td>
            <td>${firefighter.phone || 'N/A'}</td>
            <td>
                <button class="btn-edit" onclick="openViewDetailsForm(${firefighter.id})">
                    <i class="fas fa-eye"></i> Преглед
                </button>
                <button class="btn-delete" onclick="openDeleteConfirm(${firefighter.id})">
                    <i class="fas fa-trash"></i> Премахни
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    recordCount.textContent = `${firefighters.length} ${firefighters.length === 1 ? "запис" : "записа"}`;
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        "Активен": { class: "active", icon: "fas fa-check-circle" },
        "Отпуск": { class: "vacation", icon: "fas fa-bed" },
        "Болен": { class: "sick", icon: "fas fa-ambulance" }
    };

    const config = statusMap[status] || { class: "active", icon: "fas fa-check-circle" };
    return `<span class="status-badge ${config.class}"><i class="${config.icon}"></i> ${status}</span>`;
}

// Update statistics
function updateStats(firefighters) {
    let activeCount = 0, vacationCount = 0, sickCount = 0;

    firefighters.forEach(firefighter => {
        if (firefighter.status === "Активен") activeCount++;
        else if (firefighter.status === "Отпуск") vacationCount++;
        else if (firefighter.status === "Болен") sickCount++;
    });

    document.getElementById("totalCount").textContent = firefighters.length;
    document.getElementById("activeCount").textContent = activeCount;
    document.getElementById("vacationCount").textContent = vacationCount;
    document.getElementById("sickCount").textContent = sickCount;
}

// Filter firefighters
function filterFirefighters() {
    if (!window.allFirefighters) return;

    const searchTerm = document.getElementById("searchInput").value.toLowerCase();

    const filtered = window.allFirefighters.filter(firefighter => {
        return 
            firefighter.name.toLowerCase().includes(searchTerm) ||
            firefighter.username.toLowerCase().includes(searchTerm) ||
            (firefighter.phone && firefighter.phone.includes(searchTerm));
    });

    renderFirefighterList(filtered);
}

// Open view details form
function openViewDetailsForm(firefighterId) {
    const firefighter = window.allFirefighters.find(f => f.id === firefighterId);
    if (!firefighter) return;

    window.currentFirefighter = firefighter;
    
    document.getElementById("detailName").textContent = firefighter.name;
    document.getElementById("detailNumber").textContent = firefighter.username;
    document.getElementById("detailRole").textContent = "Пожарникар";
    document.getElementById("detailPhone").textContent = firefighter.phone || "-";
    document.getElementById("detailEmail").textContent = firefighter.email || "-";
    document.getElementById("detailStatus").innerHTML = getStatusBadge(firefighter.status || "Активен");
    
    document.getElementById("firefighterDetailsModal").style.display = "flex";
}

// Delete firefighter via API
async function deleteFirefighter(firefighterId) {
    if (!window.currentUser || window.currentUser.role.toLowerCase() !== 'admin') {
        alert("Нямате достъп да премахнете пожарникар");
        return;
    }

    const response = await apiClient.delete(`/firefighters/delete/${firefighterId}`);
    
    if (!response.ok) {
        alert(response.error || "Грешка при премахване на пожарникар");
        return;
    }

    console.log("Firefighter deleted:", firefighterId);
    showNotification("Пожарникарът е успешно премахнат!", "success");
    closeDetailsModal();
    loadFirefighters();
}

// Open delete confirmation
function openDeleteConfirm(firefighterId) {
    const firefighter = window.allFirefighters.find(f => f.id === firefighterId);
    if (!firefighter) return;

    window.currentFirefighter = firefighter;
    if (confirm(`Сигурни ли сте, че искате да премахнете ${firefighter.name}?`)) {
        deleteFirefighter(firefighterId);
    }
}

// Close firefighter modal
function closeFirefighterModal() {
    document.getElementById("firefighterModal").style.display = "none";
    document.getElementById("firefighterForm").reset();
}

// Close details modal
function closeDetailsModal() {
    document.getElementById("firefighterDetailsModal").style.display = "none";
    window.currentFirefighter = null;
}

// Show notification
function showNotification(message, type = "info") {
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
}

// ============ NOTIFICATION FUNCTIONS ============

// Notification polling interval with auto-refresh (10 seconds)
let notificationPollInterval = null;

function startNotificationPolling() {
    // Initial fetch
    updateNotificationBadge();
    
    // Poll every 10 seconds and refresh firefighter list on status changes
    notificationPollInterval = setInterval(() => {
        updateNotificationBadge();
        // Auto-refresh firefighter list to show updated status
        loadFirefighters();
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
        // extract team id if present
        let teamIdAttr = '';
        if (notif.content && notif.content.startsWith('team_id:')) {
            teamIdAttr = notif.content.split(':')[1];
        }

        return `
            <div class="notification-item unread" data-notification-id="${notif.id}" data-notification-type="${notif.type}" data-team-id="${teamIdAttr}">
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
    
    // Add click handlers to mark notifications as read
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
        // Remove notification from DOM immediately
        const notifElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notifElement) {
            notifElement.remove();
        }
        // Check if there are any unread notifications left
        const remainingNotifs = document.querySelectorAll('.notification-item');
        if (remainingNotifs.length === 0) {
            document.getElementById("notificationList").innerHTML = '<div class="notification-empty">Няма нови уведомления</div>';
        }
        // Update badge count
        updateNotificationBadge();
        try {
            const el = document.querySelector(`[data-notification-id="${notificationId}"]`);
            const type = el?.getAttribute('data-notification-type');
            const teamId = el?.getAttribute('data-team-id');
            if (type === 'team_assigned') {
                const meResp = await apiClient.get('/users/me');
                if (meResp.ok && meResp.data.user) {
                    const u = meResp.data.user;
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: u.id,
                        full_name: u.full_name,
                        role: u.role,
                        username: u.username,
                        phone: u.phone,
                        status: u.status || 'off_duty',
                        team_id: u.team_id || null
                    }));
                }
                window.location.href = './teams.html' + (teamId ? `?team=${teamId}` : '');
            }
        } catch (err) {}
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
        case 'team_assigned':
            return '<i class="fas fa-users"></i>';
        default:
            return '<i class="fas fa-bell"></i>';
    }
}

function formatNotificationTime(dateStr) {
    // Ensure date is parsed as UTC by appending Z if missing
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
    
    // Show actual time in HH:MM format (use date's timezone)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return `${relativeTime} (${timeStr})`;
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
