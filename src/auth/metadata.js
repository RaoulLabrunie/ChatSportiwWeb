import dotenv from "dotenv";
import mysql from "mysql2";
import useragent from "express-useragent";

dotenv.config();

const db2 = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.METADATA_DB_USER,
    password: process.env.METADATA_DB_PASSWORD,
    database: process.env.METADATA_DB_NAME,
    port: process.env.METADATA_DB_PORT,
    connectionLimit: 10,
  })
  .promise();

export async function sendMetadata(req) {
  const inicio = Date.now();
  const id_usuario = req.session.user_id;
  const id_importancia = req.session.importancia;

  const source = req.headers["user-agent"];
  const ua = useragent.parse(source);

  const navegador = source;
  const dispositivo = ua.isMobile
    ? "Móvil"
    : ua.isTablet
    ? "Tablet"
    : ua.isDesktop
    ? "Escritorio"
    : "Desconocido";

  await db2.query(
    "INSERT INTO chatmetadata (id_usuario, id_importancia, entrada, dispositivo, navegador) VALUES (?, ?, ?, ?, ?)",
    [id_usuario, id_importancia, inicio, dispositivo, navegador]
  );
}

export async function sendMensajeMetadata(req, mensaje, sql, respuesta) {
  const id_usuario = req.session.user_id;
  const mensajecompleto = mensaje + respuesta;

  console.log(sql);

  await db2.query(
    "INSERT INTO mensajemetadata (id_usuario, mensajecompleto, datosextraidos) VALUES (?, ?, ?)",
    [id_usuario, mensajecompleto, sql]
  );
}
