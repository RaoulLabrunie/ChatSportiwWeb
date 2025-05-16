import express from "express";
import { getLogin } from "../src/auth/DB2.js"; // adjust path as needed

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const valid = await getLogin(email, password);

    if ([1, 2, 3].includes(valid)) {
      // Store auth data in session (using req.session, not global session)
      req.session.isLoggedIn = true;
      req.session.importancia = valid;

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
