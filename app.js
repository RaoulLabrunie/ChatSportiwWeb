import express from "express";
import createError from "http-errors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";

import indexRouter from "./routes/index.js";
import sendRouter from "./routes/send.js";
import authRouter from "./routes/auth.js";
import chatRouter from "./routes/chat.js";
import defaultRouter from "./routes/noChat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Object to track active IPs and their associated sessions (now as arrays)
const activeIPs = {};

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuración de sesión
app.use(
  session({
    secret: "chatbot",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 15/*minutos*/ * 60 * 1000 }, // 15 minutos
  })
);


// Middleware para verificar la IP - se aplica antes de las rutas
app.use(function (req, res, next) {
  // Permitimos que todas las rutas de autenticación pasen sin verificar IP
  if (req.path.startsWith("/auth/")) {
    return next();
  }

  const ip = req.ip;

  // Si la sesión ya está autenticada, permitimos el acceso
  if (req.session.isLoggedIn) {
    // Si esta sesión ya tiene una IP registrada o es una nueva sesión, permitimos acceso
    if (!activeIPs[ip] || activeIPs[ip].includes(req.sessionID)) {
      // Registra esta sesión si no está registrada
      if (!activeIPs[ip]) {
        activeIPs[ip] = [req.sessionID];
      } else if (!activeIPs[ip].includes(req.sessionID)) {
        activeIPs[ip].push(req.sessionID);
      }
      req.session.isActive = true;
      return next();
    }
  }

  // Si no existe sesión previa con esta IP o aún no está autenticada, permitir el acceso a rutas públicas
  if (!req.session.isLoggedIn) {
    return next();
  }

  // Si llega aquí es porque hay conflicto de sesión con la misma IP
  res.status(403).send("IP bloqueada");
});

// Clean up session on logout or timeout
app.use(function (req, res, next) {
  const originalEnd = res.end;

  res.end = function () {
    if (req.session && !req.session.isActive) {
      const ip = req.ip;
      if (activeIPs[ip] && activeIPs[ip].includes(req.sessionID)) {
        // Remove just this session ID from the array
        activeIPs[ip] = activeIPs[ip].filter((id) => id !== req.sessionID);

        // Clean up the entry completely if no sessions left
        if (activeIPs[ip].length === 0) {
          delete activeIPs[ip];
        }
      }
    }
    originalEnd.apply(res, arguments);
  };

  next();
});

// Rutas
app.use("/", indexRouter);
app.use("/send", sendRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/noChat", defaultRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
