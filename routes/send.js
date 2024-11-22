import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2";
import { ChatGroq } from "@langchain/groq";

dotenv.config();

const router = express.Router();

//creamos la variable que gestionara el historial de cada sesión
let history = [];

// Configuración de la conexión a la base de datos
const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  })
  .promise();

//obtenemos el esquema de la base de datos
const schema = await db.query(
  "select column_name, data_type, table_name from information_schema.columns where table_schema = 'bjse1a360bfb50jy3voy' order by table_name;"
);
console.log(schema);

// Configuración del modelo de lenguaje
const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  maxTokens: 8000,
  maxRetries: 2,
});

// Función para generar consultas SQL desde el LLM
async function generateSQLQuery(message) {
  const aiMsg = await llm.invoke([
    {
      role: "system",
      content: `You are a SQL expert. You are working in colaboration with the web sportiw and will put the links to the profile of each player.
      Based on the table schema below, write an SQL query that would answer the user's question.
      You will only write the SQL query do not wrap it in any other text, not even in backticks.
      Take into acount the history of the conversation:
      <history>
        ${history}
      </history>
      This is the schema of the tables, you must use it to write the SQL query:
      <schema>
        ${schema}
      <schema>
      Write only SQL and nothing else.
      Example:
      Question: Give me 10 players who have played in NCAA wich height is higher than 2 meters and a free throw statistic greater than 50?
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, u.Height, pe.GameFreeThrowsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID WHERE pe.League LIKE '%NCAA%' AND u.Height > 200 AND pe.GameFreeThrowsStatistic > 50 ORDER BY pe.GameFreeThrowsStatistic DESC LIMIT 15;
      Question: Give me the top 10 players.
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, u.Height, pe.Game3pointsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID DESC LIMIT 10;
      Question: Im looking for the shortest player.
      SQL Query: SELECT u.Firstname, u.Lastname, u.Height, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID ORDER BY u.Height LIMIT 1;
      Question: Im looking for a player with a brilliant three point statistic.
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, pe.Game3pointsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID WHERE pe.Game3pointsStatistic > 40 ORDER BY pe.Game3pointsStatistic DESC LIMIT 1;
      Question: Im looking for a player between 200 and 210 with best pass statistic.
      SQL Query:SELECT DISTINCT u.Firstname, u.Lastname, pe.GamePassesStatistic, u.Height, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID WHERE u.Height BETWEEN 200 AND 210 AND pe.GamePassesStatistic IS NOT NULL ORDER BY pe.GamePassesStatistic DESC LIMIT 10
      Your turn.
      Always limit your response to 10 if the user does not specify how many players he wants.
      Do not repeat information.
      If the user asks for a specific player, you must return the principal information of the player with the link to the profile of that player.
      SQL Query(hold the backsticks):`,
    },
    { role: "user", content: message },
  ]);
  return aiMsg.content.trim();
}

// Función para generar respuesta amigable al usuario
async function formatResponse(message, players) {
  const aiFriendlyWay = await llm.invoke([
    {
      role: "system",
      content: `You will answer the user question in a friendly formal way.
      You must follow the next format: "- <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>".
      You must format the answer using <br>. Example:
        Here are the 10 players you requested: <br>
        - <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>
        etc <br>
        etc <br>
      If the user asked for a specific info add it as a part of the answer.
      Heres the user question: 
      <question>${message}<question>.
      Heres the result from the database: 
      <sqlquery>${players}</sqlquery>
      If there is no result, say it in a friendly way.
      Remember to use the same language the question was asked.
      `,
    },
  ]);
  return aiFriendlyWay.content.trim();
}

// Ruta principal
router.post("/", async (req, res) => {
  const { msg: message } = req.body;
  history.push("user: " + message);

  //intentamos ejecutar la consulta en la base de datos en caso de que de error se informara al usuario
  try {
    const query = await generateSQLQuery(message, schema[0]);
    console.log(query);
    // Ejecutar la consulta en la base de datos
    let [queryResults] = await db.query(query);

    //si la longitud de la consulta es 0 significa que no hay resultados, esto puede deberse a un error sql asi que repetiremos la consulta para asegurarnos
    if (queryResults.length === 0) {
      // Generar la consulta SQL
      const query = await generateSQLQuery(message, schema[0]);
      // Ejecutar la consulta en la base de datos
      let [queryResults] = await db.query(query);

      return queryResults;
    }

    // Transformar resultados y generar respuesta amigable
    const players = JSON.stringify(queryResults);
    const formattedResponse = await formatResponse(message, players);

    // Enviar respuesta formateada en HTML
    history.push("system: " + formattedResponse);
    console.log(history);
    res.send(`<ul>${formattedResponse}</ul>`);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

export default router;
