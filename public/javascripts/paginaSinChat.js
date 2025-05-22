import { isAuthenticated } from "../middlewares/auth.js";

// Simple script that will run when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get reference to the buttons
  var loginButton = document.getElementById("loginBtn");
  var chatButton = document.getElementById("chatBtn");

  // Add event listeners for the login button
  if (loginButton) {
    loginButton.onclick = function (e) {
      e.preventDefault();
      window.location.href = "/login";
      return false;
    };
  }

  // Add event listeners for the chat button
  if (chatButton) {
    chatButton.onclick = function (e) {
      e.preventDefault();
      window.location.href = "/chat";
      return false;
    };
  }
});
