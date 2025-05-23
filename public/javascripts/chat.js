// chat.js - JavaScript para manejar la interacción del chat
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const input = document.querySelector("input");
  const messagesContainer = document.querySelector("#messages");
  const messagesWrapper = document.querySelector(
    ".row.flex-grow-1.overflow-auto"
  );
  const userMsgTemplate = document.querySelector("#userMsgTemplate");
  const systemMsgTemplate = document.querySelector("#systemMsgTemplate");
  const loadingMsgTemplate = document.querySelector("#loadingMsgTemplate");

  var logoutButton = document.getElementById("logoutBtn");

  let loadingMessageElement = null;

  if (logoutButton) {
    logoutButton.onclick = function (e) {
      e.preventDefault();

      fetch("/api/is-authenticated")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            fetch("/logout").then((response) => {
              if (response.ok) {
                window.location.href = "/";
              }
            });
          } else {
            window.location.href = "/login";
          }
        });
    };
  }

  // Evento de envío de mensaje
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const messageText = input.value.trim();

    if (messageText != "") {
      addMessage(messageText, "user");
      input.value = "";

      // Mostrar indicador de carga
      showLoadingIndicator();

      // se hace un fetch a la ruta /send para enviar el mensaje (send.js)
      try {
        const response = await fetch("/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ msg: messageText }),
        });

        const data = await response.text();

        // Eliminar el indicador de carga
        removeLoadingIndicator();

        // Mostrar la respuesta del bot como HTML (enlaces clicables)
        addMessage(data, "system", true);
      } catch (error) {
        // Eliminar el indicador de carga en caso de error
        removeLoadingIndicator();

        console.error("Hubo un problema con la solicitud:", error);
        addMessage(
          "Lo siento, ha ocurrido un error al procesar tu mensaje.",
          "system"
        );
      }
    }
  });

  // Función para mostrar el indicador de carga
  function showLoadingIndicator() {
    const clonedTemplate = loadingMsgTemplate.content.cloneNode(true);
    loadingMessageElement = clonedTemplate.querySelector("li");
    messagesContainer.appendChild(clonedTemplate);

    // Desplazarse hasta el indicador de carga
    scrollToBottom();
  }

  // Función para eliminar el indicador de carga
  function removeLoadingIndicator() {
    if (loadingMessageElement && loadingMessageElement.parentNode) {
      loadingMessageElement.parentNode.removeChild(loadingMessageElement);
      loadingMessageElement = null;
    }
  }

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
    scrollToBottom();
  }

  // Función para desplazarse al final de los mensajes
  function scrollToBottom() {
    setTimeout(() => {
      // El scroll debe aplicarse al div con overflow-auto
      messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
    }, 10);
  }
});
