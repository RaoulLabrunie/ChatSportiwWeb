import express from "express";
import { getLogin } from "../src/auth/DB2.js"; // adjust path as needed

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password, cargo } = req.body;

  try {
    const valid = await getLogin(email, password);

    console.log(valid);

    if (valid === 1) {
      return res.status(200).json({
        message: "Login correcto sin cargo",
        redirect: "/noChat",
      });
    } else if (valid === 2) {
      return res.status(200).json({
        message: "Login correcto",
        redirect: "/chat",
      });
    } else if (valid === 3) {
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
