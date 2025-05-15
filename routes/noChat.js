import express from "express";
const router = express.Router();

// Main chat route
router.get("/", (req, res) => {
  try {
    res.render("paginaSinChat");
  } catch (error) {
    console.error("Error rendering chat view:", error);
    res.status(500).send("Error rendering chat view");
  }
});
export default router;
