// Toggle sidebar
document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
});
