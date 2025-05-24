import express from "express";
import { main, errorHandler } from "../src/chat/LLM.js";
import { schema } from "../src/chat/DB.js";
import { history, addToHistory } from "../src/chat/history.js";
import { hasChatAccessAPI } from "../middlewares/auth.js";
import { sendMensajeMetadata } from "../src/auth/metadata.js";

const router = express.Router();

// Aplicar middleware de verificación para API
router.use(hasChatAccessAPI);

// Ruta principal
router.post("/", async (req, res) => {
  const { msg: message } = req.body; //obtenemos el mensaje enviado por el usuario

  try {
    const finalAnswerFromAI = await main(message, schema, history); //Esta funcion se encuentra en ../src/chat/javascript/LLM.js\

    addToHistory(message, finalAnswerFromAI.humanFriendlyAnswer); //agregamos el mensaje al historial, esto se encuentra en ../src/chat/javascript/history.js

    try {
      await sendMensajeMetadata(
        req,
        message,
        finalAnswerFromAI.queryFromAI,
        finalAnswerFromAI.humanFriendlyAnswer
      ); //Esta funcion se encuentra en ../src/auth/metadata.js
    } catch (error) {
      console.error("Error enviando metadata:", error);
    }

    res.send(`<ul>${finalAnswerFromAI.humanFriendlyAnswer}</ul>`);
  } catch (error) {
    console.error("Error procesando la consulta:", error);

    const errorAnswer = await errorHandler(message, history); //Esta funcion se encuentra en ../src/chat/javascript/LLM.js
    addToHistory(message, errorAnswer); //agregamos el mensaje al historial

    res.send(`<ul>${errorAnswer}</ul>`);
  }
});

export default router;
export { schema };
