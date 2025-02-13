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
    `select table_name, column_name, data_type from information_schema.columns where table_schema = '${process.env.DB_NAME}' order by table_name;`
  );
  return schema;
}

export { db, getSchema };
