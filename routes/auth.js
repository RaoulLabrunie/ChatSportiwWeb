import express from "express";
import { getLogin } from "../src/auth/DB2.js"; // adjust path as needed

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const valid = await getLogin(email, password);
    if (valid) {
      // If login is successful, you can create a session or do additional processing
      // For example, if using express-session:
      // req.session.user = { email };

      // Send a success response that allows client-side redirection
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
      message: "Error del servidor",
    });
  }
});

export default router;
