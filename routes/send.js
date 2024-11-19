import express, { query } from "express"; //importamos el modulo express
var router = express.Router(); //creamos un router
import dotenv from "dotenv";
import mysql from "mysql2";
import { ChatGroq } from "@langchain/groq";

dotenv.config(); //configuramos el dotenv

//creamos la conexion de la base de datos a la que posteriormente le haremos los queries
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

//nuevo llm que usara el usuario, en este caso llamamos llama3 que es un modelo de lenguaje de alta capacidad.
const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  maxTokens: 8000,
  maxRetries: 2,
  // other params...
});

//obtenemos la petición del usuario con su mensaje
router.post("/", async function (req, res) {
  const message = req.body.msg;

  //obtenemos el SQL query generado por el LLM
  const aiMsg = await llm.invoke([
    {
      role: "system",
      content: `You are a SQL expert. You are working in colaboration with the web sportiw and will put the links to the profile of each player.
      Based on the table schema below and avoiding inventing new columns, write an SQL query that would answer the user's question.
      You will only write the SQL query do not wrap it in any other text, not even in backticks.
      Write in a single line as a string without any other text.
      The schema is:
      <schema>
        Table users
        +-----------------+------+------+-----+---------+-------+
        | Field           | Type | Null | Key | Default | Extra |
        +-----------------+------+------+-----+---------+-------+
        | ID              | text | YES  |     | NULL    |       |
        | Firstname       | text | YES  |     | NULL    |       |
        | Lastname        | text | YES  |     | NULL    |       |
        | Email           | text | YES  |     | NULL    |       |
        | PreferredLocale | text | YES  |     | NULL    |       |
        | BirthDate       | text | YES  |     | NULL    |       |
        | Height          | text | YES  |     | NULL    |       |
        +-----------------+------+------+-----+---------+-------+
      
        Table profile_experiences
        +----------------------------+------+------+-----+---------+-------+
        | Field                      | Type | Null | Key | Default | Extra |
        +----------------------------+------+------+-----+---------+-------+
        | ExperienceID               | text | YES  |     | NULL    |       |
        | ClubName                   | text | YES  |     | NULL    |       |
        | Game2pointsStatistic       | text | YES  |     | NULL    |       |
        | Game3pointsStatistic       | text | YES  |     | NULL    |       |
        | GameBlocksStatistic        | text | YES  |     | NULL    |       |
        | GameEvaluationStatistic    | text | YES  |     | NULL    |       |
        | GameFreeThrowsStatistic    | text | YES  |     | NULL    |       |
        | GameGamesPlayedStatistic   | text | YES  |     | NULL    |       |
        | GameInterceptionsStatistic | text | YES  |     | NULL    |       |
        | GamePassesStatistic        | text | YES  |     | NULL    |       |
        | GamePointsStatistic        | text | YES  |     | NULL    |       |
        | GameReboundsStatistic      | text | YES  |     | NULL    |       |
        | GameTimeStatistic          | text | YES  |     | NULL    |       |
        | League                     | text | YES  |     | NULL    |       |
        | ProfileID                  | text | YES  |     | NULL    |       |
        | Season                     | text | YES  |     | NULL    |       |
        +----------------------------+------+------+-----+---------+-------+

        Table profile
        +-----------+------+------+-----+---------+-------+
        | Field     | Type | Null | Key | Default | Extra |
        +-----------+------+------+-----+---------+-------+
        | ProfileID | text | YES  |     | NULL    |       |
        | SportID   | text | YES  |     | NULL    |       |
        | userID    | text | YES  |     | NULL    |       |
        | Country   | text | YES  |     | NULL    |       |
        +-----------+------+------+-----+---------+-------+
      <schema>
      Write only SQL and nothing else.
      If the user ask por a specific player, you must return the link to the profile of that player.
      Example:
      Question: Give me 10 players who have played in NCAA wich height is higher than 2 meters and a free throw statistic greater than 50?
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, u.Height, pe.GameFreeThrowsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID WHERE pe.League LIKE '%NCAA%' AND u.Height > 200 AND pe.GameFreeThrowsStatistic > 50 ORDER BY pe.GameFreeThrowsStatistic DESC LIMIT 15;
      Question: Give me the top 10 players.
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, u.Height, pe.GameFreeThrowsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID DESC LIMIT 10;
      Your turn.
      Always limit your response to 10 if the user does not specify how many players he wants.
      Do not repeat information.
      If the user asks for a specific player, you must return the principal information of the player with the link to the profile of that player.
      SQL Query(hold the backsticks):`,
    },
    { role: "user", content: `${message}` },
  ]);

  const query = await aiMsg.content;

  //ejecutamos el query en la base de datos
  const queryResults = await db.promise().query(query);

  //transformamos los resultados en un formato legible
  const players = queryResults[0];
  console.log(queryResults[0]);
  //creamos una respuesta en HTML con los enlaces
  const htmlResponse = players
    .map(
      (player) =>
        `<li><a href="${player.link}" target="_blank">${player.Firstname} ${player.Lastname}</a></li>`
    )
    .join("");

  //envolvemos los enlaces en una lista
  const finalHtml = `<ul>${htmlResponse}</ul>`;

  //enviamos la respuesta formateada
  res.send(finalHtml);
});

export default router;
