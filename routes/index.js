import express from "express";
import session from "express-session";
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (session.isLoggedIn) {
    res.redirect("/chat");
  }else {
    res.render("index");
  }
});

router.get("/login", function (req, res, next) {
  res.render("index");
});

export default router;
