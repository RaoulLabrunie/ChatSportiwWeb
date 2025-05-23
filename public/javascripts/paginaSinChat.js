document.addEventListener("DOMContentLoaded", function () {
  // Get reference to the buttons
  var loginButton = document.getElementById("loginBtn");
  var chatButton = document.getElementById("chatBtn");

  // Check if user is authenticated and update button accordingly
  fetch("/api/is-authenticated")
    .then((res) => res.json())
    .then((data) => {
      if (data.authenticated) {
        loginButton.innerHTML = "Logout";
        loginButton.classList.add("logged-in");
      }
    });

  if (loginButton) {
    loginButton.onclick = function (e) {
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

      return false;
    };
  }

  if (chatButton) {
    chatButton.onclick = function (e) {
      e.preventDefault();
      window.location.href = "/chat";
      return false;
    };
  }
});
