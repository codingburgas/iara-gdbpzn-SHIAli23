document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    
    const registerBtn = e.target.querySelector('button[type="submit"]');
    const originalHtml = registerBtn.innerHTML;
    registerBtn.disabled = true;
    registerBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('auth.registerButtonLoading')}`;

    try {
        const response = await apiClient.post('/auth/register', {
            full_name,
            username,
            password,
            role
        });

        if (!response.ok) {
            alert(response.error || t('alerts.registerError'));
            registerBtn.disabled = false;
            registerBtn.innerHTML = originalHtml;
            return;
        }

        alert(t('alerts.registerSuccess'));
        window.location.href = "login.html";
    } catch (error) {
        alert(`${t('alerts.registerError')}: ${error.message}`);
        registerBtn.disabled = false;
        registerBtn.innerHTML = originalHtml;
    }
});
