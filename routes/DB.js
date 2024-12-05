import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  })
  .promise();

async function getSchema() {
  const schema = await db.query(
    `select column_name, data_type, table_name from information_schema.columns where table_schema = '${process.env.DB_NAME}' order by table_name;`
  );
  return schema;
}

async function query(query) {
  const result = await db.query(query);
  return result;
}

export { db, getSchema };
