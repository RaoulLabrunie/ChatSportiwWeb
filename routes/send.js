import express from "express";
import { main, errorHandler } from "../src/chat/LLM.js";
import { getSchema } from "../src/chat/DB.js";
import { history } from "../src/chat/history.js"; //variable
import { addToHistory } from "../src/chat/history.js"; //funcion
const router = express.Router();

const gettingSchema = await getSchema(); //Se encuentra en ../src/chat/javascript/DB.js
//al pasar el schema en JSON al LLM da error y el valo se pasa como nulo por ello pasamos el tipo a string
const schema = JSON.stringify(gettingSchema);

// Ruta principal
router.post("/", async (req, res) => {
  const { msg: message } = req.body; //obtenemos el mensaje enviado por el usuario

  try {
    const finalAnswerFromAI = await main(message, schema, history); //Esta funcion se encuentra en ../src/chat/javascript/LLM.js
    addToHistory(message, finalAnswerFromAI); //agregamos el mensaje al historial, esto se encuentra en ../src/chat/javascript/history.js

    res.send(`<ul>${finalAnswerFromAI}</ul>`); //enviamos la respuesta formateada en HTML
  } catch (error) {
    console.error("Error procesando la consulta:", error);

    const errorAnswer = await errorHandler(message, history); //Esta funcion se encuentra en ../src/chat/javascript/LLM.js
    addToHistory(message, errorAnswer); //agregamos el mensaje al historial

    res.send(`<ul>${errorAnswer}</ul>`);
  }
});

export default router;
export { schema };
