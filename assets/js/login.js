
const msgError = document.querySelector(".msgError");

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await login();
    } catch (error) {
        msgError.textContent = "An unexpected error occurred";
        console.error("Unexpected error:", error);
    }
});

async function login() {
    try {
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error("Email or Password incorrect");
        }

        const data = await response.json();
        window.sessionStorage.setItem("token", data.token);
        window.location.href = "./index.html";
    } catch (error) {
        msgError.textContent = "Email or password incorrect";
        // console.error("Error:", error);
    }
}
