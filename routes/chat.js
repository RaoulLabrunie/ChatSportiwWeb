import express from "express";
import { hasChatAccess } from "../middlewares/auth.js";

const router = express.Router();

// Aplicar middleware de verificación a todas las rutas de chat
router.use(hasChatAccess);

// Main chat route
router.get("/", (req, res) => {
  console.log("Rendering chat view");
  try {
    res.render("chat");
  } catch (error) {
    console.error("Error rendering chat view:", error);
    res.status(500).send("Error rendering chat view");
  }
});

export default router;
