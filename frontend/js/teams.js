// Teams Management JavaScript

document.addEventListener("DOMContentLoaded", () => {
    if (!checkUserRole()) return;
    applyRoleBasedMenuVisibility();
    setupEventListeners();
    loadTeamsData();
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

    ["vehicles", "shifts", "settings"].forEach(page => {
        document.querySelectorAll(`[data-page="${page}"]`).forEach(el => {
            if (page === "vehicles") el.style.display = "";
            else el.style.display = "none";
        });
    });

    // Show create team button for admins
    const createTeamBtn = document.getElementById('createTeamBtn');
    if (createTeamBtn) {
        createTeamBtn.style.display = role === 'admin' ? 'inline-block' : 'none';
    }
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

    const createTeamBtn = document.getElementById("createTeamBtn");
    if (createTeamBtn) {
        createTeamBtn.addEventListener("click", openCreateTeamModal);
    }

    const createTeamForm = document.getElementById("createTeamForm");
    if (createTeamForm) {
        createTeamForm.addEventListener("submit", handleCreateTeam);
    }

    const editTeamForm = document.getElementById("editTeamForm");
    if (editTeamForm) {
        editTeamForm.addEventListener("submit", handleEditTeam);
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

    // Firefighter search
    const firefighterSearch = document.getElementById("firefighterSearch");
    if (firefighterSearch) {
        firefighterSearch.addEventListener("input", filterFirefighters);
    }
}

async function loadTeamsData() {
    const role = (window.currentUser?.role || "").toLowerCase();
    
    if (role === 'firefighter') {
        const refreshedUser = await refreshCurrentUser();
        if (refreshedUser && refreshedUser.team_id) {
            loadMyTeam();
        } else {
            loadMyTeam();
        }
    } else if (role === 'admin') {
        loadAllTeams();
    }
}

async function refreshCurrentUser() {
    try {
        const response = await apiClient.get('/users/me');
        if (!response.ok) {
            return null;
        }

        const updatedUser = response.data.user;
        if (updatedUser) {
            const currentUser = {
                id: updatedUser.id,
                full_name: updatedUser.full_name,
                username: updatedUser.username,
                role: updatedUser.role,
                phone: updatedUser.phone || "",
                team_id: updatedUser.team_id || null
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.currentUser = currentUser;
            return currentUser;
        }
    } catch (error) {
        console.error('Failed to refresh current user:', error);
    }
    return null;
}

async function loadMyTeam() {
    const teamId = window.currentUser?.team_id;
    
    if (!teamId) {
        document.getElementById("firefighterView").style.display = "none";
        document.getElementById("adminView").style.display = "none";
        document.getElementById("noTeamView").style.display = "block";
        return;
    }

    try {
        const response = await apiClient.get(`/teams/${teamId}`);
        
        if (!response.ok) {
            throw new Error(t('teams.loadTeamError'));
        }

        const team = response.data;
        
        // Display team info
        document.getElementById("myTeamName").textContent = team.name || t('teams.myTeamName');
        document.getElementById("myTeamStation").textContent = team.station || "-";
        document.getElementById("myTeamType").textContent = getTeamTypeLabel(team.type);
        document.getElementById("myTeamStatusText").textContent = getStatusLabel(team.status);
        document.getElementById("myTeamStatus").textContent = getStatusLabel(team.status);
        document.getElementById("myTeamCommander").textContent = team.commander_name || "-";

        // Load team members
        const membersResponse = await apiClient.get(`/teams/${teamId}/members`);
        if (membersResponse.ok) {
            displayTeamMembers(membersResponse.data.members || []);
        }

        // Load assigned vehicle
        if (team.vehicle_id) {
            const vehicleResponse = await apiClient.get(`/vehicles/${team.vehicle_id}`);
            if (vehicleResponse.ok) {
                displayAssignedVehicle(vehicleResponse.data);
            }
        } else {
            document.getElementById("assignedVehicleContainer").innerHTML = `<div class="empty-state">${t('teams.assignedVehicleNone')}</div>`;
        }

        document.getElementById("firefighterView").style.display = "block";
        document.getElementById("adminView").style.display = "none";
        document.getElementById("noTeamView").style.display = "none";
    } catch (error) {
        console.error("Error loading team:", error);
        document.getElementById("noTeamView").style.display = "block";
    }
}

function displayTeamMembers(members) {
    const container = document.getElementById("teamMembersContainer");
    
    if (members.length === 0) {
        container.innerHTML = `<div class="empty-state">${t('teams.noMembers')}</div>`;
        return;
    }

    container.innerHTML = members.map(member => `
        <div class="team-member-card">
            <div class="member-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-name">${escapeHtml(member.full_name || member.name)}</div>
            <div class="member-role">${member.role === 'firefighter' ? t('teams.firefighterRole') : escapeHtml(member.role)}</div>
            <div class="member-status">${getStatusLabel(member.status || 'off_duty')}</div>
        </div>
    `).join('');
}

function displayAssignedVehicle(vehicle) {
    const container = document.getElementById("assignedVehicleContainer");
    container.innerHTML = `
        <div class="vehicle-card-small">
            <div class="vehicle-icon-large">
                <i class="fas fa-fire-truck"></i>
            </div>
            <div class="vehicle-info">
                <p class="vehicle-callsign">${escapeHtml(vehicle.callsign)}</p>
                <p class="vehicle-plate">${escapeHtml(vehicle.plate_number)}</p>
                <span class="vehicle-type">${getVehicleTypeLabel(vehicle.type)}</span>
            </div>
        </div>
    `;
}

async function loadAllTeams() {
    try {
        const response = await apiClient.get('/teams/list');
        
        if (!response.ok) {
            throw new Error(t('teams.loadTeamsError'));
        }

        const teams = response.data.teams || [];
        displayTeamsGrid(teams);

        document.getElementById("firefighterView").style.display = "none";
        document.getElementById("adminView").style.display = "block";
        document.getElementById("noTeamView").style.display = "none";
    } catch (error) {
        console.error("Error loading teams:", error);
    }
}

function displayTeamsGrid(teams) {
    const container = document.getElementById("teamsGrid");
    
    if (teams.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">${t('teams.noTeams')}</div>`;
        return;
    }

    container.innerHTML = teams.map(team => `
        <div class="team-card">
            <h3 class="team-card-title">${escapeHtml(team.name)}</h3>
            <div class="team-card-meta">
                <i class="fas fa-map-marker-alt"></i>
                <span>${escapeHtml(team.station || '-')}</span>
            </div>
            <div class="team-card-meta">
                <i class="fas fa-tag"></i>
                <span>${getTeamTypeLabel(team.type)}</span>
            </div>
            <div class="team-card-meta">
                <i class="fas fa-circle"></i>
                <span>${getStatusLabel(team.status)}</span>
            </div>
            <div class="team-card-meta">
                <i class="fas fa-users"></i>
                <span>${t('teams.memberCount', { count: team.member_count || 0 })}</span>
            </div>
            <div class="team-card-actions">
                <button class="btn-small btn-small-primary" onclick="openEditTeamModal(${team.id})">
                    <i class="fas fa-edit"></i> ${t('teams.editButton')}
                </button>
                <button class="btn-small btn-small-danger" onclick="deleteTeam(${team.id})">
                    <i class="fas fa-trash"></i> ${t('teams.deleteButton')}
                </button>
            </div>
        </div>
    `).join('');
}

async function openCreateTeamModal() {
    document.getElementById("createTeamForm").reset();
    document.getElementById("selectedFirefighters").innerHTML = `<div class="empty-message">${t('teams.noSelectedFirefighters')}</div>`;
    
    // Load firefighters
    await loadFirefightersForSelector();
    
    // Load vehicles
    await loadVehiclesForSelector();
    
    document.getElementById("createTeamModal").style.display = "flex";
}

function closeCreateTeamModal() {
    document.getElementById("createTeamModal").style.display = "none";
}

async function loadFirefightersForSelector() {
    try {
        const response = await apiClient.get('/firefighters/list');
        
        if (!response.ok) return;

        const firefighters = response.data.firefighters || [];
        const container = document.getElementById("firefighterList");
        const commanderSelect = document.getElementById("teamCommander");

        // Clear and repopulate
        container.innerHTML = firefighters.map(ff => `
            <div class="selectable-item" data-firefighter-id="${ff.id}">
                <input type="checkbox" class="firefighter-checkbox" value="${ff.id}">
                <div class="selectable-item-text">
                    <div class="selectable-item-name">${escapeHtml(ff.name)}</div>
                    <div class="selectable-item-info">${escapeHtml(ff.username)}</div>
                </div>
            </div>
        `).join('');

        commanderSelect.innerHTML = `<option value="">${t('teams.selectCommander')}</option>` + firefighters.map(ff => `
            <option value="${ff.id}">${escapeHtml(ff.name)}</option>
        `).join('');

        // Add checkbox listeners
        document.querySelectorAll('.firefighter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedFirefighters);
        });

    } catch (error) {
        console.error("Error loading firefighters:", error);
    }
}

async function loadVehiclesForSelector() {
    try {
        const response = await apiClient.get('/vehicles/list');
        
        if (!response.ok) return;

        const vehicles = response.data.vehicles || [];
        const container = document.getElementById("vehicleList");

        container.innerHTML = vehicles.filter(v => v.status === 'AVAILABLE').map(v => `
            <div class="selectable-item" data-vehicle-id="${v.id}">
                <input type="radio" name="selectedVehicle" value="${v.id}">
                <div class="selectable-item-text">
                    <div class="selectable-item-name">${escapeHtml(v.callsign)}</div>
                    <div class="selectable-item-info">${escapeHtml(v.plate_number)}</div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('input[name="selectedVehicle"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.querySelectorAll('#vehicleList .selectable-item').forEach(item => {
                    item.classList.remove('selected');
                });
                if (this.checked) {
                    this.closest('.selectable-item').classList.add('selected');
                }
            });
        });

    } catch (error) {
        console.error("Error loading vehicles:", error);
    }
}

function updateSelectedFirefighters() {
    const selected = Array.from(document.querySelectorAll('.firefighter-checkbox:checked'))
        .map(cb => {
            const item = cb.closest('.selectable-item');
            const name = item.querySelector('.selectable-item-name').textContent;
            return { id: cb.value, name };
        });

    const container = document.getElementById("selectedFirefighters");
    
    if (selected.length === 0) {
        container.innerHTML = `<div class="empty-message">${t('teams.noSelectedFirefighters')}</div>`;
    } else {
        container.innerHTML = selected.map(ff => `
            <div class="selected-tag">
                ${escapeHtml(ff.name)}
                <button type="button" onclick="deselectFirefighter(${ff.id})">×</button>
            </div>
        `).join('');
    }
}

function deselectFirefighter(firefighterId) {
    const checkbox = document.querySelector(`.firefighter-checkbox[value="${firefighterId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedFirefighters();
    }
}

function filterFirefighters() {
    const searchTerm = document.getElementById("firefighterSearch").value.toLowerCase();
    document.querySelectorAll('#firefighterList .selectable-item').forEach(item => {
        const name = item.querySelector('.selectable-item-name').textContent.toLowerCase();
        const username = item.querySelector('.selectable-item-info').textContent.toLowerCase();
        item.style.display = (name.includes(searchTerm) || username.includes(searchTerm)) ? '' : 'none';
    });
}

async function handleCreateTeam(e) {
    e.preventDefault();

    const name = document.getElementById("teamName").value.trim();
    const station = document.getElementById("teamStation").value.trim();
    const type = document.getElementById("teamType").value;
    const commanderId = document.getElementById("teamCommander").value;
    const selectedVehicle = document.querySelector('input[name="selectedVehicle"]:checked')?.value;
    const selectedFirefighters = Array.from(document.querySelectorAll('.firefighter-checkbox:checked')).map(cb => cb.value);

    if (!name) {
        alert(t('teams.enterTeamName'));
        return;
    }

    try {
        const payload = {
            name,
            station: station || null,
            type,
            commander_id: commanderId || null,
            member_ids: selectedFirefighters,
            vehicle_id: selectedVehicle || null
        };

        const response = await apiClient.post('/teams/create', payload);

        if (!response.ok) {
            throw new Error(response.error || t('teams.createTeamError'));
        }

        alert(t('teams.createTeamSuccess'));
        closeCreateTeamModal();
        loadAllTeams();
    } catch (error) {
        alert(`${t('alerts.errorPrefix')}: ${error.message}`);
    }
}

async function openEditTeamModal(teamId) {
    try {
        const response = await apiClient.get(`/teams/${teamId}`);
        if (!response.ok) throw new Error(response.error || t('teams.loadTeamError'));

        const team = response.data;

        const idInput = document.getElementById('editTeamId');
        const nameInput = document.getElementById('editTeamName');
        const stationInput = document.getElementById('editTeamStation');
        const typeInput = document.getElementById('editTeamType');
        const statusInput = document.getElementById('editTeamStatus');

        if (idInput) idInput.value = team.id;
        if (nameInput) nameInput.value = team.name || '';
        if (stationInput) stationInput.value = team.station || '';
        if (typeInput) typeInput.value = team.type || '';
        if (statusInput) statusInput.value = team.status || '';

        document.getElementById('editTeamModal').style.display = 'flex';
    } catch (error) {
        alert(`${t('teams.loadTeamError')}: ${error.message || error}`);
    }
}

async function handleEditTeam(e) {
    e.preventDefault();
    const id = document.getElementById('editTeamId')?.value;
    if (!id) return alert(t('teams.invalidTeam'));

    const name = document.getElementById('editTeamName')?.value.trim();
    const station = document.getElementById('editTeamStation')?.value.trim();
    const type = document.getElementById('editTeamType')?.value;
    const status = document.getElementById('editTeamStatus')?.value;

    try {
        const payload = {
            name,
            station: station || null,
            type: type || null,
            status: status || null
        };

        const response = await apiClient.put(`/teams/${id}`, payload);
        if (!response.ok) throw new Error(response.error || t('teams.updateTeamError'));

        alert(t('teams.updateTeamSuccess'));
        closeEditTeamModal();
        loadAllTeams();
    } catch (error) {
        alert(`${t('alerts.errorPrefix')}: ${error.message || error}`);
    }
}

function closeEditTeamModal() {
    document.getElementById("editTeamModal").style.display = "none";
}

async function deleteTeam(teamId) {
    if (!confirm(t('teams.confirmDelete'))) return;

    try {
        const response = await apiClient.delete(`/teams/${teamId}`);

        if (!response.ok) {
            throw new Error(response.error || t('teams.deleteTeamError'));
        }

        alert(t('teams.deleteTeamSuccess'));
        loadAllTeams();
    } catch (error) {
        alert(`${t('alerts.errorPrefix')}: ${error.message}`);
    }
}

function getTeamTypeLabel(type) {
    const labels = {
        'OPERATIONAL': t('teams.teamTypeOperational'),
        'SUPPORT': t('teams.teamTypeSupport'),
        'RESCUE': t('teams.teamTypeRescue')
    };
    return labels[type] || type;
}

function getVehicleTypeLabel(type) {
    const labels = {
        'FIRE_TRUCK': t('vehicles.filters.fireTruck'),
        'CISTERN': t('vehicles.filters.cistern'),
        'SUPPORT': t('vehicles.filters.support')
    };
    return labels[type] || type;
}

function getStatusLabel(status) {
    const labels = {
        'AVAILABLE': t('teams.statusAvailable'),
        'ON_MISSION': t('teams.statusOnMission'),
        'MAINTENANCE': t('teams.statusMaintenance'),
        'off_duty': t('teams.statusOffDuty'),
        'on_duty': t('teams.statusOnDuty'),
        'on_mission': t('teams.statusOnMission'),
        'vacation': t('teams.statusVacation'),
        'sick_leave': t('teams.statusSickLeave')
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
            document.getElementById("notificationList").innerHTML = `<div class="notification-empty">${t('notifications.noNotifications')}</div>`;
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
    if (diffMins < 1) relativeTime = t('notifications.relativeSeconds');
    else if (diffMins < 60) relativeTime = t('notifications.relativeMinutes', { count: diffMins });
    else if (diffHours < 24) relativeTime = t('notifications.relativeHours', { count: diffHours });
    else if (diffDays < 7) relativeTime = t('notifications.relativeDays', { count: diffDays });
    else {
        const locale = window.currentLanguage === 'en' ? 'en-US' : 'bg-BG';
        relativeTime = date.toLocaleDateString(locale);
    }
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return `${relativeTime} (${timeStr})`;
}
