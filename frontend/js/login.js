document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalHtml = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';

    try {
        const response = await apiClient.post('/auth/login', { username, password });

        if (!response.ok) {
            alert(response.error || "Грешка при вход");
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalHtml;
            return;
        }

        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        alert("Успешен вход!");
        window.location.href = "../html/dashboard.html";
    } catch (error) {
        alert("Грешка при вход: " + error.message);
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalHtml;
    }
});
