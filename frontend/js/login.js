document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    });

    const data = await response.json();

    if (response.ok) {
        alert("Успешен вход!");
        window.location.href = "../html/dashboard.html";
    } else {
        alert(data.error);
    }
});
