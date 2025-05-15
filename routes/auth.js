import express from "express";
import session from "express-session";
import { getLogin } from "../src/auth/DB2.js"; // adjust path as needed

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const valid = await getLogin(email, password);

    if ([1, 2, 3].includes(valid)) {
      session.isLoggedIn = true;
      session.importancia = valid;

      return res.status(200).json({
        message: "Login correcto",
        redirect: "/chat",
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

export default router;
