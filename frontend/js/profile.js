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
            // Fetch current status from admin endpoint for consistency
            const statusResp = await apiClient.get('/firefighters/' + user.id);
            if (statusResp.ok && statusResp.data.status) {
                document.getElementById("status").value = statusResp.data.status;
            } else if (user.status) {
                document.getElementById("status").value = user.status;
            }
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
        }

        // Update localStorage with the latest known values used around the app
        const updatedUser = {
            id: response.data.user.id,
            full_name: response.data.user.full_name,
            role: response.data.user.role,
            username: response.data.user.username,
            phone: response.data.user.phone,
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
