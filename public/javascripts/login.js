const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;

  if (email && password) {
    fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, timeZone, language }),
    })
      .then((response) => {
        // Check the response status
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((data) => {
            throw new Error(data.message || "Credenciales inválidas");
          });
        }
      })
      .then((data) => {
        if (data.message === "Login correcto") {
          window.location.href = data.redirect;
        } else {
          alert("Error de servidor");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message || "Error de conexión");
      });
  } else {
    alert("Por favor, rellena todos los campos");
  }
});
