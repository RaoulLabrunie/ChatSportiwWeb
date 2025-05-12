import { get } from "http";
import { db2 } from "./DB2.js";
import { getLogin } from "./DB2.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function login(req, res) {
  getLogin(req.body.email, req.body.password);
  res.json({ message: "Login correcto" });
}
