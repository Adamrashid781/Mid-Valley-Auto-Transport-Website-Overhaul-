// js/authorize.js — Create Account and Login forms (used by account.html and login.html)

// SETTING: where the server is. This is the only line to change when going live.
//   ""                          = this same website (local testing, or server.js on the live host)
//   "https://api.yoursite.com"  = a separate live server (must start with https://)
const API_URL = "";

// Send data to the server and return its reply, or { error } if something failed.
async function post(path, data) {
    if (API_URL.startsWith("http://")) {
        return { error: "API_URL must start with https:// so passwords are encrypted." };
    }
    try {
        const response = await fetch(API_URL + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const reply = await response.json();
        return response.ok ? reply : { error: reply.error || "Something went wrong." };
    } catch {
        return { error: "Can't reach the server. Is server.js running?" };
    }
}

// Show a green (success) or red (error) message in the card.
function showMessage(text, isError) {
    const msg = document.getElementById("form-message");
    msg.textContent = text;
    msg.classList.toggle("error", isError);
}

// Create Account page
const accountForm = document.querySelector("form.account-box");
if (accountForm) {
    accountForm.addEventListener("submit", async (event) => {
        event.preventDefault();                       // stop the page reloading
        const f = accountForm;

        if (f["password"].value !== f["confirm-password"].value) {
            return showMessage("Passwords do not match.", true);
        }

        const reply = await post("/api/register", {
            firstName: f["first-name"].value,
            lastName:  f["last-name"].value,
            email:     f["email"].value,
            password:  f["password"].value
        });
        if (reply.error) return showMessage(reply.error, true);

        showMessage("Account created! Taking you to the login page…", false);
        f.reset();
        setTimeout(() => { location.href = "login.html"; }, 1500);
    });
}

// Login page
const loginForm = document.querySelector("form.login-box");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const reply = await post("/api/login", {
            email:    loginForm["email"].value,
            password: loginForm["password"].value
        });
        if (reply.error) return showMessage(reply.error, true);
        showMessage("Welcome back, " + reply.firstName + "!", false);
    });
}