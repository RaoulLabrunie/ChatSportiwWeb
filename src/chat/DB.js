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
  // Obtenemos la estructura de la base de datos para que el LLM pueda generar consultas SQL
  const [rows] = await db.query(
    `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' ORDER BY TABLE_NAME;`
  );

  // Agrupar resultados por tabla
  const schema = rows.reduce((acc, column) => {
    const tableName = column.TABLE_NAME;

    if (!acc[tableName]) {
      acc[tableName] = [];
    }

    acc[tableName].push({
      columnName: column.COLUMN_NAME,
      dataType: column.DATA_TYPE,
    });

    return acc;
  }, {});

  return schema;
}

export { db, getSchema };
