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
  // Query mejorada que obtiene más información útil del esquema
  const [rows] = await db.query(
    `
    SELECT 
      c.TABLE_NAME, 
      c.COLUMN_NAME, 
      c.DATA_TYPE,
      c.IS_NULLABLE,
      c.COLUMN_KEY,
      CASE 
        WHEN kcu.REFERENCED_TABLE_NAME IS NOT NULL 
        THEN CONCAT(kcu.REFERENCED_TABLE_NAME, '.', kcu.REFERENCED_COLUMN_NAME)
        ELSE NULL 
      END AS FOREIGN_KEY_REFERENCE
    FROM INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
      ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA 
      AND c.TABLE_NAME = kcu.TABLE_NAME 
      AND c.COLUMN_NAME = kcu.COLUMN_NAME 
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    WHERE c.TABLE_SCHEMA = ?
    ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
  `,
    [process.env.DB_NAME]
  );

  // Agrupar resultados por tabla con información mejorada
  const schema = rows.reduce((acc, column) => {
    const tableName = column.TABLE_NAME;

    if (!acc[tableName]) {
      acc[tableName] = [];
    }

    acc[tableName].push({
      columnName: column.COLUMN_NAME,
      dataType: column.DATA_TYPE,
      nullable: column.IS_NULLABLE === "YES",
      key: column.COLUMN_KEY,
      foreignKey: column.FOREIGN_KEY_REFERENCE,
    });

    return acc;
  }, {});

  return schema;
}

const gettingSchema = await getSchema();
const schema = JSON.stringify(gettingSchema);

export { db, schema };
