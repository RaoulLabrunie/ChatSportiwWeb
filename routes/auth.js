import express from "express";
import { sendMetadata } from "../src/auth/metadata.js";
import { getLogin } from "../src/auth/login.js"; // adjust path as needed

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password, timeZone, language } = req.body;

  try {
    const valid = await getLogin(email, password);

    if ([1, 2, 3].includes(valid.importancia)) {
      // Store auth data in session (using req.session, not global session)
      req.session.isLoggedIn = true;
      req.session.user_id = valid.id_usuario;
      req.session.importancia = valid.importancia;
      req.session.timeZone = timeZone;
      req.session.language = language;

      sendMetadata(req);

      return res.status(200).json({
        message: "Login correcto",
        redirect: "/noChat",
      });
    } else {
      // Send an unauthorized response
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error login servidor",
    });
  }
});

router.get("/logout", (req, res) => {
  // Destruir la sesión

  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({
        message: "Error al cerrar sesión",
      });
    }
    // Redirigir a la página de inicio
    res.redirect("/");
  });
});

export default router;
