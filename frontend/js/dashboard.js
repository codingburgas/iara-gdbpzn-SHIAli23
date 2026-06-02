const t = window.translate || ((key, params) => (window.translate ? window.translate(key, params) : key));

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    if (!checkUserRole()) return;
    applyRoleBasedMenuVisibility();
    loadIncidents();
    initializeMenuItems();
    setupEventListeners();
});

// Check user role from localStorage
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

    // Hide admin-only items for non-admin users
    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
        el.style.display = role === "admin" ? "" : "none";
    });

    // Hide pages that don't exist yet
    ["shifts", "settings"].forEach(page => {
        document.querySelectorAll(`[data-page="${page}"]`).forEach(el => (el.style.display = "none"));
    });
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
                "profile": "./profile.html"
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

    // Task modal overlay click handler
    const taskModal = document.getElementById("taskModal");
    if (taskModal) {
        taskModal.addEventListener("click", (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }

    // Incident modal overlay click handler
    const incidentModal = document.getElementById("incidentModal");
    if (incidentModal) {
        incidentModal.addEventListener("click", (e) => {
            if (e.target === incidentModal) {
                closeIncidentModal();
            }
        });
    }

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

    // Start notification polling
    startNotificationPolling();
}

// Fetch and populate incidents
async function loadIncidents() {
    const tableBody = document.getElementById("incidentsTableBody");
    const emptyStateMessage = document.getElementById("emptyStateMessage");
    const recordCount = document.getElementById("recordCount");

    // Show loading state
    tableBody.innerHTML = `<tr class="loading-row"><td colspan="6">${t('dashboard.loadingIncidents')}</td></tr>`;
    emptyStateMessage.style.display = "none";

    // Fetch incidents
    const response = await apiClient.get('/incidents/list');
    
    if (!response.ok) {
        console.error("Error loading incidents:", response.error);
        tableBody.innerHTML = `<tr class="loading-row"><td colspan="6" style="color: #ff6b6b;">${t('alerts.loadDetailsError')}</td></tr>`;
        emptyStateMessage.style.display = "none";
        return;
    }

    const data = response.data;
    
    if (!data.incidents || data.incidents.length === 0) {
        tableBody.innerHTML = "";
        emptyStateMessage.style.display = "flex";
        recordCount.textContent = formatRecordCount(0);
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
    recordCount.textContent = formatRecordCount(data.incidents.length);
}

// Normalize incident status values for translation and filtering
function normalizeIncidentStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'в работа' || normalized === 'in progress' || normalized === 'inprogress') return 'inProgress';
    if (normalized === 'активно' || normalized === 'active') return 'active';
    if (normalized === 'приключено' || normalized === 'completed') return 'completed';
    if (normalized === 'приостановено' || normalized === 'on hold' || normalized === 'onhold') return 'onHold';
    if (normalized === 'отменено' || normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';
    return 'active';
}

// Update statistics
function updateStats(filtered, all) {
    let activeCount = 0, completedCount = 0, onHoldCount = 0, totalCount = all.length;
    
    filtered.forEach(incident => {
        const status = normalizeIncidentStatus(incident.status);
        if (status === 'active' || status === 'inProgress') activeCount++;
        else if (status === 'completed') completedCount++;
        else if (status === 'onHold') onHoldCount++;
    });

    document.getElementById("activeCount").textContent = activeCount;
    document.getElementById("completedCount").textContent = completedCount;
    document.getElementById("onHoldCount").textContent = onHoldCount;
    document.getElementById("totalCount").textContent = totalCount;
}

function formatRecordCount(count) {
    if (count === 1) {
        return t('recordCount.one');
    }
    return t('recordCount.other', { count });
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
        recordCount.textContent = formatRecordCount(0);
        return;
    }

    emptyStateMessage.style.display = "none";

    incidents.forEach(incident => {
        const row = document.createElement("tr");
        const statusBadge = getStatusBadge(incident.status);
        const formattedDate = formatDate(incident.created_at || new Date().toISOString());

        row.innerHTML = `
            <td>${incident.id || t('detail.unknown')}</td>
            <td>${incident.type || t('detail.unknown')}</td>
            <td>${incident.address || t('detail.unknown')}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-action" onclick="viewIncidentDetails(${incident.id})">${t('table.view')}</button>
                <button class="btn-action" onclick="openTaskModal(${incident.id})" style="margin-left: 6px;"><i class="fas fa-tasks"></i> ${t('table.tasks')}</button>
            </td>

        `;
        tableBody.appendChild(row);
    });

    recordCount.textContent = formatRecordCount(incidents.length);
}

// Filter incidents
function filterIncidents() {
    if (!window.allIncidents) return;

    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const selectedFilter = document.getElementById("filterStatus").value;
    const normalizedFilter = selectedFilter ? normalizeIncidentStatus(selectedFilter) : '';

    const filtered = window.allIncidents.filter(incident => {
        const matchSearch = 
            (incident.id + "").includes(searchTerm) ||
            (incident.type || "").toLowerCase().includes(searchTerm) ||
            (incident.address || "").toLowerCase().includes(searchTerm);

        const incidentStatus = normalizeIncidentStatus(incident.status);
        const matchStatus = !normalizedFilter || incidentStatus === normalizedFilter;

        return matchSearch && matchStatus;
    });

    populateTable(filtered);
    updateStats(filtered, window.allIncidents);
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        active: { class: "status-active", translationKey: "filters.active" },
        inProgress: { class: "status-active", translationKey: "filters.inProgress" },
        completed: { class: "status-completed", translationKey: "filters.completed" },
        onHold: { class: "status-on-hold", translationKey: "filters.onHold" },
        cancelled: { class: "status-cancelled", translationKey: "filters.cancelled" }
    };

    const statusKey = normalizeIncidentStatus(status);
    const config = statusMap[statusKey] || statusMap.active;
    const label = t(config.translationKey);

    return `<span class="status-badge ${config.class}">${label}</span>`;
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
async function viewIncidentDetails(incidentId) {
    const response = await apiClient.get(`/incidents/${incidentId}`);
    
    if (!response.ok) {
        alert(response.error || t('alerts.loadDetailsError'));
        return;
    }

    const incident = response.data;
    
            // Set modal content
            document.getElementById("detailId").textContent = incident.id || "-";
            document.getElementById("detailType").textContent = incident.type || t('detail.unknown');
            document.getElementById("detailAddress").textContent = incident.address || t('detail.unknown');
            document.getElementById("detailDateTime").textContent = formatDate(incident.created_at) || "-";
            document.getElementById("detailDescription").textContent = incident.description || t('detail.noDescription');
            
            // GPS coordinates
            if (incident.latitude && incident.longitude) {
                document.getElementById("detailCoordinates").textContent = 
                    `${incident.latitude}, ${incident.longitude}`;
            } else {
                document.getElementById("detailCoordinates").textContent = "-";
            }
            
            document.getElementById("detailTeam").textContent = incident.team_id ? `${t('detail.teamPrefix')} ${incident.team_id}` : t('detail.notAssigned');
            
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
                document.getElementById("newStatusSelect").value = incident.status || "REGISTERED";
            } else {
                statusChangeContainer.style.display = "none";
                deleteIncidentBtn.style.display = "none";
            }
            
            // Open modal
            document.getElementById("incidentModal").style.display = "flex";
}

// Close incident modal
function closeIncidentModal() {
    document.getElementById("incidentModal").style.display = "none";
}

// Update incident status
async function updateIncidentStatus() {
    if (!window.currentIncident) return;
    
    const newStatus = document.getElementById("newStatusSelect").value;
    const incidentId = window.currentIncident.id;
    
    const response = await apiClient.put(`/incidents/${incidentId}/status`, {
        status: newStatus
    });
    
    if (!response.ok) {
        alert(response.error || t('alerts.statusUpdateError'));
        return;
    }

    alert(t('alerts.statusUpdateSuccess'));
    closeIncidentModal();
    loadIncidents();
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
    const confirmDelete = confirm(t('alerts.deleteConfirm', { id: incidentId }));
    
    if (!confirmDelete) return;
    
    deleteIncident(incidentId);
}

// Delete incident function
async function deleteIncident(incidentId) {
    const response = await apiClient.delete(`/incidents/${incidentId}`);
    
    if (!response.ok) {
        alert(response.error || t('alerts.deleteError'));
        return;
    }

    alert(t('alerts.deleteSuccess'));
    closeIncidentModal();
    loadIncidents();
}

// --- Task Management Modal Logic ---
let currentTaskIncidentId = null;

function openTaskModal(incidentId) {
    currentTaskIncidentId = incidentId;
    const modal = document.getElementById("taskModal");
    modal.classList.add("active");
    modal.style.display = "flex";
    loadTasks(incidentId);
}

function closeTaskModal() {
    const modal = document.getElementById("taskModal");
    modal.classList.remove("active");
    modal.style.display = "none";
    currentTaskIncidentId = null;
    // Clear form fields
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    if (taskTitle) taskTitle.value = "";
    if (taskDescription) taskDescription.value = "";
}

async function loadTasks(incidentId) {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;
    taskList.innerHTML = `<div class="task-empty-state">${t('task.loading')}</div>`;
    
    const response = await apiClient.get(`/incidents/${incidentId}/tasks`);
    if (!response.ok) {
        taskList.innerHTML = `<div class="task-empty-state" style="color: #ff6b6b;">${t('task.loadError')}</div>`;
        return;
    }
    
    const tasks = response.data.tasks || [];
    if (tasks.length === 0) {
        taskList.innerHTML = `<div class="task-empty-state"><i class="fas fa-clipboard-list"></i><p>${t('task.noTasks')}</p></div>`;
        return;
    }
    
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item">
            <h4>${escapeHtml(task.title)}</h4>
            <div class="task-item-description">
                ${task.description ? escapeHtml(task.description) : `<i>${t('task.noDescription')}</i>`}
            </div>
            <div class="task-item-footer">
                <span class="task-status ${task.status === 'done' ? 'done' : 'pending'}">
                    ${task.status === 'done' ? t('task.done') : t('task.pending')}
                </span>
                ${task.status !== 'done' ? `<button class="task-action-button" onclick="updateTaskStatus(${task.id})">${t('task.markDone')}</button>` : ''}
            </div>
        </div>
    `).join("");
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

async function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    if (!title) {
        alert(t('task.enterTitle'));
        return;
    }
    const response = await apiClient.post(`/incidents/${currentTaskIncidentId}/tasks`, {
        title,
        description
    });
    if (!response.ok) {
        alert(t('alerts.taskAddError', { error: response.error || 'Unknown error' }));
        return;
    }
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    loadTasks(currentTaskIncidentId);
}

async function updateTaskStatus(taskId) {
    const response = await apiClient.put(`/tasks/${taskId}/status`, { status: "done" });
    if (!response.ok) {
        alert(t('alerts.taskUpdateError'));
        return;
    }
    loadTasks(currentTaskIncidentId);
}

// ============ NOTIFICATION FUNCTIONS ============

// Notification polling interval (10 seconds)
let notificationPollInterval = null;

function startNotificationPolling() {
    // Initial fetch
    updateNotificationBadge();
    
    // Poll every 10 seconds
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
        notificationList.innerHTML = `<div class="notification-empty">${t('notifications.loadError')}</div>`;
        return;
    }
    
    const notifications = response.data.notifications || [];
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `<div class="notification-empty">${t('notifications.noNotifications')}</div>`;
        return;
    }
    
    notificationList.innerHTML = notifications.filter(notif => !notif.is_read).map(notif => {
        const timeStr = formatNotificationTime(notif.created_at);
        const typeIcon = getNotificationIcon(notif.type);
        // extract team id if present (content format: "team_id:123")
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
            document.getElementById("notificationList").innerHTML = `<div class="notification-empty">${t('notifications.noNotifications')}</div>`;
        }
        // Update badge count
        updateNotificationBadge();
        // If it was a team assignment, refresh current user and navigate to teams
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
        } catch (err) {
            // ignore
        }
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
    if (diffMins < 1) relativeTime = t('notifications.relativeSeconds');
    else if (diffMins < 60) relativeTime = t('notifications.relativeMinutes', { count: diffMins });
    else if (diffHours < 24) relativeTime = t('notifications.relativeHours', { count: diffHours });
    else if (diffDays < 7) relativeTime = t('notifications.relativeDays', { count: diffDays });
    else relativeTime = date.toLocaleDateString(window.currentLanguage === 'en' ? 'en-US' : 'bg-BG');
    
    // Show actual time in HH:MM format (use date's timezone)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return `${relativeTime} (${timeStr})`;
}
