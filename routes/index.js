import express from "express";
import { activeIPs } from "../app.js";

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

router.get("/logout", function (req, res, next) {
  const ip = req.ip;
  const sessionId = req.sessionID;

  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    // Eliminar manualmente la sesión del registro de IPs
    if (activeIPs[ip]) {
      activeIPs[ip] = activeIPs[ip].filter((id) => id !== sessionId);
      if (activeIPs[ip].length === 0) {
        delete activeIPs[ip];
      }
    }

    res.redirect("/");
  });
});

export default router;
