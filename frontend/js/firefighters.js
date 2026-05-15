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

    ["teams", "vehicles", "shifts", "settings"].forEach(page => {
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
