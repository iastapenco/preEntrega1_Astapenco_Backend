import { Router } from "express";
import SessionManager from "../dao/managers_mongo/sessionManagerMongo.js";

const sessionRouter = Router();
const sessionManager = new SessionManager();

sessionRouter.get("/login", async (req, res) => {
  res.render("login", {
    js: "session.js",
  });
});

sessionRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (req.session.login) {
      res.status(200).send({ resultado: "Login ya existente" });
    }
    const validUser = await sessionManager.validUser(email, password);

    if (validUser) {
      req.session.login = true;
      res.redirect("/products", 200, { resultado: "Login válido" });
    } else {
      res
        .status(401)
        .send({ resultado: "Email o Contraseña no válida", mensaje: password });
    }
  } catch (error) {
    res.status(400).send({ mensaje: "Error en login", error: error });
  }
});

sessionRouter.get("/logout", async (req, res) => {
  if (req.session.login) {
    req.session.destroy();
  }
  res.redirect("/api/sessions/login", 200, {
    resultado: "Usuario deslogueado",
  });
});

export default sessionRouter;
