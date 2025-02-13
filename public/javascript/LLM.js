import { ChatGroq } from "@langchain/groq";
import { db } from "./DB.js";
import dotenv from "dotenv";
dotenv.config();

// Configuración del modelo de lenguaje
const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  maxTokens: 8000,
  maxRetries: 2,
});

// Función para generar consultas SQL desde el LLM
async function getInfoFromDB(message, schema, history) {
  const aiSQLExpert = await llm.invoke([
    {
      role: "system",
      content: `You are a SQL expert. You are working in colaboration with the web sportiw and will put the links to the profile of each player.
      Based on the table schema below, write an SQL query that would answer the user's question.
      You will only write the SQL query do not wrap it in any other text, not even in backticks.
      If the user asks for some info you dont have in the schema, dont try to query it in the database it will bring errors and we dont want the user to see errors.
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
  return aiSQLExpert.content.trim();
}

// Función para generar respuesta amigable al usuario
async function getHumanFriendlyWay(message, players) {
  const aiFriendlyWay = await llm.invoke([
    {
      role: "system",
      content: `
        You are an expert answering questions to users, you should always try to keep the user in the web and asking you questions.
        If the sql result is not too long you can ask for more details in a super formal way, never say its the user fault and make sure you are not breaking the rules.
        You will answer the user question in a friendly formal way.
        Remove duplicated information. 
        If you get an empty result, say that you dont found anything.
        You will understand the user question, for example, if the user says thanks and you receive a list of players, you will not show the players and just say thanks.
        You must follow the next format: "- <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>".
        You must format the answer using <br>. Example:
          Here are the 10 players you requested: <br>
          - <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>
          ...
        If the user asked for a specific info add it as a part of the answer.
        Heres the user question: 
        <question>${message}<question>.
        Heres the result from the database: 
        <sqlquery>${players}</sqlquery>
        Remember to use the same language the question was asked.
      `,
    },
  ]);
  return aiFriendlyWay.content.trim();
}

export async function main(message, schema, history) {
  //metemos el mensaje en el historial como pregunta del usuario
  history.push("user: " + message);

  // Generar la consulta SQL
  const query = await getInfoFromDB(message, schema[0], history);
  console.log(query); //imprimimos la consulta generada (esto solo esta para poder leer si el query esta bien hechgo y errores en produccion)

  // Ejecutar la consulta en la base de datos
  let [queryResults] = await db.query(query);

  if (queryResults.length === 0) {
    queryResults = "No results found";
  }

  // Transformar resultados y generar respuesta en formato string, esto se debe a que llm no puede procesar json
  const queryFormated = JSON.stringify(queryResults);

  //ejecutamos la segunda funcion que genera la respuesta amigable
  const formattedResponse = await getHumanFriendlyWay(message, queryFormated);

  history.push("system: " + formattedResponse);
  return formattedResponse;
}
