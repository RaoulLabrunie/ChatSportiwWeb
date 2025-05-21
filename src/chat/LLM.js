import groq from "groq-sdk";
import { db } from "./DB.js";
import dotenv from "dotenv";

dotenv.config();
// Configuración del modelo de lenguaje
const llm = new groq({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAnswerFromAI(prompt, promptUser) {
  return await llm.chat.completions.create({
    messages: [
      {
        role: "system",
        content: prompt.trim(),
      },
      {
        role: "user",
        content: promptUser ? promptUser.trim() : "",
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  });
}
// Función para generar consultas SQL desde el LLM
async function getSqlFromAI(message, schema, history) {
  const prompt = `
    You are a SQL expert. You are working in collaboration with the website Sportiw and will include links to the profile of each player.
    
    Based on the table schema below, write an SQL query that answers the user's question. 
    Imagine someone ask for weight, if you don't have it in the schema then dont try to answer it.
    You will only write the SQL query, do not wrap it in any other text, not even in backticks.

    ONLY use SELECT queries. Never include DELETE, INSERT, UPDATE, DROP, or any schema-changing SQL.

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

    Question: Give me some french players under 25 years old.
    SQL Query:
    SELECT DISTINCT u.first_name, u.last_name, u.height, u.birth_date, eb.game_3points_statistic,
          CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link
    FROM user u
    JOIN profiles p ON u.id = p.user_id
    JOIN experiences_basket eb ON p.id = eb.profile_id
    JOIN nationality n ON u.id = n.user_id
    JOIN countries c ON n.country_id = c.id
    WHERE c.nationality = 'French' 
    AND u.birth_date > DATE_SUB(CURDATE(), INTERVAL 25 YEAR)
    LIMIT 10;

    Question: Could you give me some female players.
    SQL Query:
    SELECT DISTINCT u.first_name, u.last_name, u.height,
       CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link
    FROM user u
    JOIN profiles p ON u.id = p.user_id
    WHERE u.gender = 'Female'
    LIMIT 10;

    Question: I want football players with few yellow cards.
    SQL Query: 
    SELECT DISTINCT 
        u.first_name, 
        u.last_name, 
        ef.yellow_statistic,
        CONCAT(
            'https://sportiw.com/en/athletes/', 
            REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), 
            '/', 
            p.id
        ) AS link
    FROM user u
    JOIN profiles p ON u.id = p.user_id
    JOIN experiences_football ef ON p.id = ef.profile_id
    JOIN sports s ON p.sport_id = s.id AND s.name = 'Football'
    WHERE ef.yellow_statistic < 5 
    ORDER BY RAND()
    LIMIT 10;

    Question: Give me all the info from x player;
    SQL Query:
    SELECT u.*, 
          p.*,
          c.name AS country_name, 
          c.nationality,
          s.name AS sport_name,
          sp.name AS position_name,
          sl.category AS sportive_level,
          cl.name AS club_name,
          CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS profile_link
    FROM user u
    JOIN profiles p ON u.id = p.user_id
    LEFT JOIN countries c ON u.country_id = c.id
    LEFT JOIN sports s ON p.sport_id = s.id
    LEFT JOIN sport_positions sp ON p.main_position_id = sp.id
    LEFT JOIN sportive_levels sl ON p.sportive_level_id = sl.id
    LEFT JOIN clubs cl ON p.club_situation = cl.id
    WHERE u.first_name = ? AND u.last_name = ?
    LIMIT 1;

    Question: How well did x player do in the last season?
    SQL Query:
    SELECT
        ef.season_id,
        s.name AS season_name,
        ef.league_id,
        ef.club_id,
        ef.played_statistic,
        ef.time_statistic,
        ef.goal_statistic,
        ef.assist_statistic,
        ef.yellow_statistic,
        ef.red_statistic,
        CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link
    FROM
        user u
    JOIN
        profiles p ON u.id = p.user_id
    JOIN
        experiences_football ef ON p.id = ef.profile_id
    LEFT JOIN
        seasons s ON ef.season_id = s.id
    WHERE
        u.first_name = ? AND u.last_name = ?
    ORDER BY
        ef.id DESC
    LIMIT 5;

    Question: I was searching someone that have played recently.
    SQL Query:
    SELECT
        ef.season_id,
        s.name AS season_name,
        ef.league_id,
        ef.club_id,
        ef.played_statistic,
        ef.time_statistic,
        ef.goal_statistic,
        ef.assist_statistic,
        ef.yellow_statistic,
        ef.red_statistic,
        CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.last_name, '.', u.first_name), ' ', '%20'), '/', p.id) AS link
    FROM
        user u
    JOIN
        profiles p ON u.id = p.user_id
    JOIN
        experiences_football ef ON p.id = ef.profile_id
    LEFT JOIN
        seasons s ON ef.season_id = s.id
    ORDER BY
        s.name DESC
    LIMIT 5;


    Your turn.

    Imagine the user references something from another question, "i want all the info from the 2nd one". You must search the second player and with its name, search whatever the user asked.
    Take into account that there are 3 different tables for experiences.
    Filter the players randomly.
    Always limit your response to 1-10 players if the user does not specify how many players they want.
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

  const sqlQueryFromAI = await getAnswerFromAI(prompt, promptUser);

  return sqlQueryFromAI.choices[0].message.content.trim();
}

// Esta funcion traduce la respuesta de la base de datos en un texto amigable para el usuario
async function getHumanFriendlyWay(message, players, history) {
  const prompt = `
      You are an expert answering questions to users, you should always try to keep the user in the web and asking you questions.
      If the sql result is not too long you can ask for more details in a super formal way.
      You will answer the user question in a friendly formal way.
      You will pay special attention to the history of the conversation.
      You will not say the information you got is not enough, never, but if you consider so you will ask if the user wants more info.
      Remove duplicated information. 
      You will understand the user question, for example, if the user says thanks and you receive a list of players, you will not show the players and just say thanks.
      You must follow the next format: "- <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>".
      You must format the answer using <br>. Example:
        Here are the 10 players you requested: <br>
        - <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>
        ...
      If the user asked for a specific info add it as a part of the answer.
      Heres the result from the database: 
      <sqlquery>${players}</sqlquery>
      Remember to use the same language the question was asked.
      Heres the history of the conversation:
      <history>${history}</history>
      `;
  const promptUser = `
    Message: '${message}'.
  `;
  const aiFriendlyWay = await getAnswerFromAI(prompt, promptUser);

  return aiFriendlyWay.choices[0].message.content.trim();
}

async function solveErrorMessages(message, history) {
  const prompt = `
    There's been an error in the sql query but you wont say that, you will tell the customer that you cant provide the answer to his question in that moment.
    You will answer the user question in a friendly formal way.
    NEVER SAY THE ERROR MESSAGE, YOU WILL NEVER SPECIGY THE ERROR MESSAGE.
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
  const aiSolveError = await getAnswerFromAI(prompt);
  return aiSolveError.choices[0].message.content.trim();
}

// Main y errorHandler son las funciones principales que usaran las funciones anteriores, donde se encuentra la ejecucion del codigo.
// Llamamos a estas funciones desde el archivo '../../routes/send.js'

export async function main(message, schema, history) {
  // Generar la consulta SQL
  const queryFromAI = await getSqlFromAI(message, schema, history);

  console.log(queryFromAI);

  // Extraer los valores y obtener la consulta parametrizada
  const { query: parameterizedQuery, values } = extractSqlValues(queryFromAI);

  let queryResults;

  try {
    // Ejecutar la consulta en la base de datos de forma segura
    // usando la consulta parametrizada y los valores extraídos
    queryResults = await db.query(parameterizedQuery, values);

    if (!queryResults || queryResults.length === 0) {
      queryResults = "No results found"; // Mensaje para consultas sin resultados
    } else {
      queryResults = JSON.stringify(queryResults);
    }

    let extracted = extractStringFromBrackets(queryResults);

    // Ejecutamos la segunda función que genera la respuesta amigable
    const humanFriendlyAnswer = await getHumanFriendlyWay(
      message,
      extracted,
      history
    );

    return { humanFriendlyAnswer, queryFromAI };
  } catch (error) {
    console.error("Error executing database query:", error);
    return `Lo siento, ocurrió un error al consultar la base de datos: ${error.message}`;
  }
}

export async function errorHandler(message, error) {
  //ejecutamos la segunda funcion que genera la respuesta amigable
  const errorAnswer = await solveErrorMessages(message, error);

  return errorAnswer;
}

function extractSqlValues(query) {
  // Verifica si la entrada es válida
  if (!query || typeof query !== "string") {
    return { error: "La consulta debe ser una cadena de texto válida" };
  }

  // Inicialización de variables
  const values = [];
  let queryWithPlaceholders = "";
  let currentPos = 0;

  // Regex para encontrar cadenas entre comillas simples
  // Nota: Esta regex maneja casos donde hay comillas escapadas con \'
  const stringRegex = /'(?:[^'\\]|\\.)*'/g;
  let match;

  // Procesar cada coincidencia de string en comillas
  while ((match = stringRegex.exec(query)) !== null) {
    // Añadir texto anterior al valor encontrado
    queryWithPlaceholders += query.substring(currentPos, match.index);

    // Añadir el marcador de posición
    queryWithPlaceholders += "?";

    // Guardar el valor sin las comillas
    const value = match[0]
      .substring(1, match[0].length - 1)
      .replace(/\\'/g, "'"); // Manejar comillas escapadas
    values.push(value);

    // Actualizar posición actual
    currentPos = match.index + match[0].length;
  }

  // Añadir el resto de la consulta
  queryWithPlaceholders += query.substring(currentPos);

  return {
    query: queryWithPlaceholders,
    values: values,
  };
}

function extractStringFromBrackets(queryResults) {
  let brackets = 0;
  let extracted = null;

  for (let i = 0; i < queryResults.length; i++) {
    if (queryResults[i] === "[" && brackets === 0) {
      brackets++;
    } else if (queryResults[i] === "[" && brackets === 1) {
      for (let j = i + 1; j < queryResults.length; j++) {
        if (queryResults[j] === "]") {
          extracted = queryResults.slice(i, j + 1);
          break;
        }
      }
      break;
    }
  }

  return extracted;
}
