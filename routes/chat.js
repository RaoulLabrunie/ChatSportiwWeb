import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  console.log("Rendering chat view");
  try {
    if ((req.isLoggedIn && req.importancia === 2) || req.importancia === 3) {
      res.render("chat");
    } else if (req.isLoggedIn && req.importancia === 1) {
      res.render("noChat");
    } else {
      res.render("index");
    }
  } catch (error) {
    console.error("Error rendering chat view:", error);
    res.status(500).send("Error rendering chat view");
  }
});
export default router;
