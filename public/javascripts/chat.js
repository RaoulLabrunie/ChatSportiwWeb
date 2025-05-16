const form = document.querySelector("form");
const input = document.querySelector("input");
const messagesContainer = document.querySelector("#messages");
const msgTemplate = document.querySelector("#msgTemplate");

// Evento de envío de mensaje
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const messageText = input.value.trim();

  if (messageText != "") {
    addMessage(messageText, "user");
    input.value = "";

    // se hace un fetch a la ruta /send para enviar el mensaje (send.js)
    try {
      const response = await fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg: messageText }),
      });

      const data = await response.text();

      // Mostrar la respuesta del bot como HTML (enlaces clicables)
      addMessage(data, "system", true);
    } catch (error) {
      console.error("Hubo un problema con la solicitud:", error);
    }
  }
});

// Modificar addMessage para aceptar HTML
function addMessage(text, sender, isHtml = false) {
  const clonedTemplate = msgTemplate.content.cloneNode(true);
  const roleSpan = clonedTemplate.querySelector(".role");
  const contentP = clonedTemplate.querySelector(".content");

  roleSpan.textContent = sender === "system" ? "System" : "user";

  if (isHtml) {
    contentP.innerHTML = text;
  } else {
    contentP.textContent = text;
  }

  messagesContainer.appendChild(clonedTemplate);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
