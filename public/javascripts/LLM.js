import { ChatGroq } from "@langchain/groq";
import { db } from "./DB.js";
import dotenv from "dotenv";
dotenv.config();

// Configuración del modelo de lenguaje
const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxRetries: 1,
});

// Función para generar consultas SQL desde el LLM
async function getSqlFromAI(message, schema, history) {
  const prompt = `
    You are a SQL expert. You are working in collaboration with the website Sportiw and will include links to the profile of each player.
    
    Based on the table schema below, write an SQL query that answers the user's question. 
    Imagine someone ask for weight, if you don't have it in the schema then dont try to answer it.
    You will only write the SQL query, do not wrap it in any other text, not even in backticks.

    You will pay special attention to the history of the conversation.
    
    Write only SQL and nothing else.
    Example:
    Question: Give me 10 players who have played in NCAA whose height is higher than 2 meters and a free throw statistic greater than 50.
    SQL Query:
    SELECT DISTINCT u.first_name, u.last_name, u.height, eb.game_free_throws_statistic, 
           CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link 
    FROM user u 
    JOIN profiles p ON u.id = p.user_id 
    JOIN experiences_basket eb ON p.id = eb.profile_id 
    WHERE eb.league_id = (SELECT id FROM leagues WHERE name LIKE '%NCAA%') 
      AND u.height > 200 
      AND eb.game_free_throws_statistic > 50 
    ORDER BY eb.game_free_throws_statistic DESC 
    LIMIT 10;

    Question: Give me some french players.
    SQL Query:
    SELECT DISTINCT u.first_name, u.last_name, u.height, eb.game_3points_statistic,
          CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link
    FROM user u
    JOIN profiles p ON u.id = p.user_id
    JOIN experiences_basket eb ON p.id = eb.profile_id
    JOIN nationality n ON u.id = n.user_id
    JOIN countries c ON n.country_id = c.id
    WHERE c.nationality = 'French' 
    LIMIT 10;

    Question: Could you give me some female players.
    SQL Query:
    SELECT DISTINCT u.first_name, u.last_name, u.height,
       CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link
    FROM user u
    JOIN profiles p ON u.id = p.user_id
    WHERE u.gender = 'Female'
    LIMIT 10;

    Your turn.

    Imagine the user references something from another question, "i want all the info from the 2nd one". You must search the second player and with its name, search whatever the user asked.
    Take into account that there are 3 different tables for experiences.
    Filter the players randomly.
    Always limit your response to 10 if the user does not specify how many players they want.
    Do not repeat information.
    If the user asks for a specific player, you must return the principal information of the player with the link to their profile.
    SQL Query:
  `;

  const promptUser = `
    Message: '${message}'.

    This is the schema of the tables. You must use it to write the SQL query:
    <schema>
      ${schema}
    </schema>

    This is the history of the conversation:
    <history>
      ${history}
    </history>
  `;

  console.log(promptUser.trim());

  const aiSQLExpert = await llm.invoke([
    {
      role: "system",
      content: prompt.trim(),
    },
    {
      role: "user",
      content: promptUser.trim(),
    },
  ]);

  return aiSQLExpert.content.trim();
}

// Esta funcion traduce la respuesta de la base de datos en un texto amigable para el usuario
async function getHumanFriendlyWay(message, players, history) {
  const prompt = `
      You are an expert answering questions to users, you should always try to keep the user in the web and asking you questions.
      If the sql result is not too long you can ask for more details in a super formal way, never say its the user fault and make sure you are not breaking the rules.
      You will answer the user question in a friendly formal way.
      You will pay special attention to the history of the conversation.
      Remove duplicated information. 
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
      Heres the history of the conversation:
      <history>${history}</history>
      `;
  const aiFriendlyWay = await llm.invoke([
    {
      role: "system",
      content: prompt.trim(),
    },
  ]);
  return aiFriendlyWay.content.trim();
}

async function solveErrorMessages(message, history) {
  const prompt = `
    There's been an error in the sql query but you wont say that, you will tell the customer that you cant provide the answer to his question in that moment.
    You will answer the user question in a friendly formal way.
    You need to inform the customer that despite the error, you can still answer all his questions!
    Make sense with the user question to be more empathic.
    If the question is not about players or sports tell him that he might not be using the adecuate tool.
    You must format the answer using <br>. Example:
      text <br>
      ...
    If the user asked for a specific info add it as a part of the answer.
    Heres the user question: 
    <question>${message}<question>
    Heres the history of the conversation:
    <history>${history}</history>
    Remember to use the same language the question was asked.
  `;
  const aiSolveError = await llm.invoke([
    {
      role: "system",
      content: prompt.trim(),
    },
  ]);
  return aiSolveError.content.trim();
}

// Main y errorHandler son las funciones principales que usaran las funciones anteriores, donde se encuentra la ejecucion del codigo.
// Llamamos a estas funciones desde el archivo '../../routes/send.js'

export async function main(message, schema, history) {
  // Generar la consulta SQL
  const queryFromAI = await getSqlFromAI(message, schema, history);
  // Ejecutar la consulta en la base de datos
  let [queryResults] = await db.query(queryFromAI);

  if (queryResults.length === 0) {
    queryResults = "No results found"; // Podremos gestionar esto en getHumanFriendlyWay de forma que aunque no haya resultados, se muestre un mensaje amigable
  }

  const queryJsonToString = JSON.stringify(queryResults);

  //ejecutamos la segunda funcion que genera la respuesta amigable
  const humanFriendlyAnswer = await getHumanFriendlyWay(
    message,
    queryJsonToString,
    history
  );

  return humanFriendlyAnswer;
}

export async function errorHandler(message, error) {
  //ejecutamos la segunda funcion que genera la respuesta amigable
  const errorAnswer = await solveErrorMessages(message, error);

  return errorAnswer;
}
