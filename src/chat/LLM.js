import groq from "groq-sdk";
import { db } from "./DB.js";
import dotenv from "dotenv";
import fs from "fs";

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
  const prompt = fs.readFileSync("public/prompts/iaSQL.txt", "utf8");

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
  const prompt =
    fs.readFileSync("public/prompts/iaFriendlyway.txt", "utf8") +
    `result from the database: ${players} and the history of the conversation: ${history}`;
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
