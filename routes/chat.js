import express from "express";
import session from "express-session";
const router = express.Router();

router.get("/", (req, res) => {
  console.log("Rendering chat view");
  try {
    if (
      (session.isLoggedIn && session.importancia === 2) ||
      session.importancia === 3
    ) {
      res.render("chat");
    } else if (session.isLoggedIn && session.importancia === 1) {
      res.render("paginaSinChat");
    } else {
      res.render("index");
    }
  } catch (error) {
    console.error("Error rendering chat view:", error);
    res.status(500).send("Error rendering chat view");
  }
});

export default router;
