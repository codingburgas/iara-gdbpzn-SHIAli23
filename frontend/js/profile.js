document.addEventListener("DOMContentLoaded", () => {
    requireLogin();
    applyRoleBasedMenuVisibility();
    setupEventListeners();
    loadProfile();
});

function requireLogin() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        window.location.href = "../index.html";
        return;
    }
    window.currentUser = JSON.parse(currentUser);
}

function applyRoleBasedMenuVisibility() {
    const role = (window.currentUser?.role || "").toLowerCase();
    document.querySelectorAll('[data-admin-only="true"]').forEach((el) => {
        el.style.display = role === "admin" ? "" : "none";
    });

    // Hide pages that don't exist yet
    ["teams", "vehicles", "shifts", "settings"].forEach((page) => {
        document.querySelectorAll(`[data-page="${page}"]`).forEach((el) => (el.style.display = "none"));
    });
}

function setupEventListeners() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.querySelectorAll(".menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            const page = item.getAttribute("data-page");
            handleMenuNavigation(page, e);
        });
    });

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "../index.html";
    });

    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    });

    document.getElementById("profileForm").addEventListener("submit", handleSaveProfile);

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

function handleMenuNavigation(page, clickEvent) {
    if (clickEvent) {
        document.querySelectorAll(".menu-item").forEach((m) => m.classList.remove("active"));
        clickEvent.target.closest(".menu-item")?.classList.add("active");
    }

    const navigationMap = {
        incidents: "./dashboard.html",
        firefighters: "./firefighters.html",
        profile: "./profile.html",
    };

    if (navigationMap[page]) {
        window.location.href = navigationMap[page];
    }

    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("open");
    }
}

async function loadProfile() {
    const messageEl = document.getElementById("profileMessage");
    messageEl.style.display = "none";

    try {
        const response = await apiClient.get('/users/me');
        if (!response.ok) {
            throw new Error(response.error || "Неуспешно зареждане на профила.");
        }
        const user = response.data.user;
        document.getElementById("fullName").value = user.full_name || "";
        document.getElementById("username").value = user.username || "";
        document.getElementById("phone").value = user.phone || "";
        document.getElementById("role").value = user.role || "";

        // Show status dropdown for firefighters
        if ((user.role || '').toLowerCase() === 'firefighter') {
            document.getElementById("statusGroup").style.display = '';
            // Set status from user object
            document.getElementById("status").value = user.status || 'off_duty';
        } else {
            document.getElementById("statusGroup").style.display = 'none';
        }
    } catch (err) {
        showMessage(err.message, "error");
    }
}

async function handleSaveProfile(e) {
    e.preventDefault();

    const full_name = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const new_password = document.getElementById("newPassword").value;
    const confirm_password = document.getElementById("confirmPassword").value;
    const role = (document.getElementById("role").value || '').toLowerCase();
    const status = document.getElementById("status")?.value;

    if (!full_name || !username) {
        showMessage("Моля, попълнете пълно име и потребителско име.", "error");
        return;
    }

    if ((new_password || confirm_password) && new_password !== confirm_password) {
        showMessage("Паролите не съвпадат.", "error");
        return;
    }

    const saveBtn = document.getElementById("saveProfileBtn");
    const originalBtnHtml = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Запазване...';

    try {
        const payload = {
            full_name,
            username,
            phone: phone || "",
        };
        if (new_password) payload.new_password = new_password;

        // Update profile info
        const response = await apiClient.put('/users/me', payload);
        if (!response.ok) {
            throw new Error(response.error || "Неуспешно обновяване на профила.");
        }

        // If firefighter, update status as well
        if (role === 'firefighter' && status) {
            const statusResp = await apiClient.put('/firefighters/me/status', { status });
            if (!statusResp.ok) {
                throw new Error(statusResp.error || "Неуспешна промяна на статус.");
            }
            // Ensure dropdown stays on the selected value
            document.getElementById("status").value = status;
        }

        // Update localStorage with the latest known values used around the app
        const updatedUser = {
            id: response.data.user.id,
            full_name: response.data.user.full_name,
            role: response.data.user.role,
            username: response.data.user.username,
            phone: response.data.user.phone,
            status: status || response.data.user.status || 'off_duty'
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        window.currentUser = updatedUser;

        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

        showMessage("Профилът е обновен успешно.", "success");
    } catch (err) {
        showMessage(err.message, "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnHtml;
    }
}

function showMessage(text, type) {
    const messageEl = document.getElementById("profileMessage");
    messageEl.classList.remove("success", "error");
    messageEl.classList.add(type);
    messageEl.textContent = text;
    messageEl.style.display = "block";
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
