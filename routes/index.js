import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

/* GET home page. */
router.get("/login", function (req, res, next) {
  if (req.session.isLoggedIn) {
    res.redirect("/noChat");
  } else {
    res.render("index");
  }
});

router.get("/", function (req, res, next) {
  res.render("paginaSinChat");
});

export default router;
