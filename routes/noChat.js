import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Aplicar middleware de verificación
router.use(isAuthenticated);

// Main route
router.get("/", (req, res) => {
  try {
    res.render("paginaSinChat");
  } catch (error) {
    console.error("Error rendering no-chat view:", error);
    res.status(500).send("Error rendering view");
  }
});

export default router;
