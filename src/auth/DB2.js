import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const db2 = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.LOGIN_DB_USER,
    password: process.env.LOGIN_DB_PASSWORD,
    database: process.env.LOGIN_DB_NAME,
    port: process.env.LOGIN_DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
  })
  .promise();

async function getLogin(email, password) {
  const [rows] = await db2.query(
    "SELECT * FROM usuarios WHERE email = ? AND password = ?",
    [email, password]
  );

  const importancia = rows[0].id_importancia;
  if (rows.length > 0) {
    return importancia;
  } else {
    return false;
  }
}

export { db2, getLogin };
