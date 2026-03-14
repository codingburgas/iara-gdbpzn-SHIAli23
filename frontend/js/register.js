document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const response = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({full_name, username, password, role})
    });

    const data = await response.json();

    if (response.ok) {
        alert("Успешна регистрация!");
        window.location.href = "login.html";
    } else {
        alert(data.error);
    }
});
