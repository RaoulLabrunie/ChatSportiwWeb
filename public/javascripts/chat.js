// chat.js - JavaScript para manejar la interacción del chat
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const input = document.querySelector("input");
  const messagesContainer = document.querySelector("#messages");
  const userMsgTemplate = document.querySelector("#userMsgTemplate");
  const systemMsgTemplate = document.querySelector("#systemMsgTemplate");

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

  // Función para añadir mensaje utilizando las nuevas plantillas
  function addMessage(text, sender, isHtml = false) {
    // Seleccionar la plantilla correcta según el remitente
    const template = sender === "user" ? userMsgTemplate : systemMsgTemplate;
    const clonedTemplate = template.content.cloneNode(true);
    const contentP = clonedTemplate.querySelector(".content");

    // Establecer el contenido con HTML o texto plano según corresponda
    if (isHtml) {
      contentP.innerHTML = text;
    } else {
      contentP.textContent = text;
    }

    // Añadir el mensaje al contenedor
    messagesContainer.appendChild(clonedTemplate);

    // Desplazarse hasta el último mensaje
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
