// Middleware para verificar si el usuario está autenticado
export function isAuthenticated(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    // Usuario autenticado, permitir acceso
    next();
  } else {
    // Usuario no autenticado, redirigir al login
    res.redirect("/");
  }
}

// Middleware para verificar si el usuario tiene acceso al chat (importancia 2 o 3)
export function hasChatAccess(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    if (req.session.importancia === 2 || req.session.importancia === 3) {
      // Usuario con acceso al chat
      next();
    } else {
      // Usuario sin acceso al chat (importancia 1)
      res.redirect("/noChat");
    }
  } else {
    // Usuario no autenticado
    res.redirect("/login");
  }
}

// Middleware para verificar acceso al chat via API
export function hasChatAccessAPI(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    if (req.session.importancia === 2 || req.session.importancia === 3) {
      next();
    } else {
      res.status(403).json({
        message: "No tienes acceso al chat",
      });
    }
  } else {
    res.status(401).json({
      message: "Sesión no válida o expirada",
    });
  }
}
