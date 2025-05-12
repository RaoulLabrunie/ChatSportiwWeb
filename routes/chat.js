import express from "express";
const router = express.Router();

// Basic route logging
router.use((req, res, next) => {
  console.log("Chat Route Accessed:");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  next();
});

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
