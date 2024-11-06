import express from "express"; //importamos el modulo express
var router = express.Router(); //creamos un router
import dotenv from "dotenv"; //importamos el modulo dotenv
import mysql from "mysql2"; //importamos el modulo mysql
import { Groq } from "groq-sdk"; //importamos el modulo groq
dotenv.config();

//nos conectamos a la base e datos
const connection = mysql
  .createPool({
    //todos estos datos estan en el archivo .env
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }) //ponemos el .promise() para que nos devuelva una promesa
  .promise();

//le damos a la ia de groq la clave necesaria para funcionar
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

//funcion que nos devuelve la respuesta de la ia
async function main(message) {
  const prompt = `You are a SQL expert. You are working in colaboration with the web sportiw and will put the links to the profile of each player.
      Based on the table schema below, write an SQL query that would answer the user's question.
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
      Example:
      Question: Give me 10 players who have played in NCAA wich height is higher than 2 meters and a free throw statistic greater than 50?
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, u.Height, pe.GameFreeThrowsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID WHERE pe.League LIKE '%NCAA%' AND u.Height > 200 AND pe.GameFreeThrowsStatistic > 50 ORDER BY pe.GameFreeThrowsStatistic DESC LIMIT 15;
      Question: Give me the top 10 players.
      SQL Query: SELECT DISTINCT u.Firstname, u.Lastname, u.Height, pe.GameFreeThrowsStatistic, CONCAT('https://sportiw.com/en/athletes/', REPLACE(CONCAT(u.Lastname, '.', u.Firstname), ' ', '%20'), '/', p.ProfileID) AS link FROM users u JOIN profile p ON u.ID = p.userID JOIN profile_experiences pe ON p.ProfileID = pe.ProfileID DESC LIMIT 10;
      Your turn.
      SQL Query(hold the backsticks):
  `;
  try {
    const chatCompletion = await getGroqChatCompletion(message, prompt);
    // Print the completion returned by the LLM.
    return chatCompletion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Error al obtener el esquema:", error);
    throw error;
  }
}

// funcion que nos traduce la query a lenguaje humano
async function trauccion(message, query) {
  const prompt = `You need to write the following prompt in a human way, be precise and reduce the text and format it to be clear. Take in count the question ${message} and here is the query from the database: ${query}`;
  try {
    const chatCompletion = await getGroqChatCompletion(message, prompt);
    // Print the completion returned by the LLM.
    return chatCompletion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Error al obtener el esquema:", error);
    throw error;
  }
}

// pregunta x a la ia, tanto la traduccion como la query
async function getGroqChatCompletion(message, prompt) {
  try {
    return await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama3-8b-8192",
      max_tokens: 8192,
    });
  } catch (error) {
    console.error("Error al obtener el esquema:", error);
    throw error;
  }
}

//funcion que ejecuta todas las funciones anteriores y devuelve una respuesta final que nos permite imprimir por pantalla
async function getResponse(message) {
  const response = await main(message);

  // Hacemos un query con la respuesta de la IA
  const [results] = await connection.query(response);

  //console.log(results);

  const formattedResultsString = results
    .map((player) => {
      // Convertir cada objeto en una cadena clave: valor
      return Object.entries(player) // Convertir el objeto en un array de pares [clave, valor]
        .map(([key, value]) => `${key}: ${value}`) // Formatear cada par como 'clave: valor'
        .join(", "); // Unir todos los pares en una sola cadena, separados por coma
    })
    .join("\n"); // Unir cada resultado en una sola cadena, separando por nueva línea

  const finalResult = await trauccion(message, formattedResultsString);
  return finalResult;
}

router.post("/", async function (req, res, next) {
  //el mensaje del usuario sera el cuerpo del request
  const message = req.body.msg;

  //llamamos a la funcion getResponse que nos devuelve la respuesta final
  const response = await getResponse(message);

  // devolvemos por pantalla la respuesta final
  res.render("index", { title: response });
});

export default router;
