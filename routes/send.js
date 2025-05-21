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
  const { msg: message } = req.body;

  try {
    const finalAnswerFromAI = await main(message, schema, history);

    addToHistory(message, finalAnswerFromAI.humanFriendlyAnswer);

    sendMensajeMetadata(
      req,
      message,
      finalAnswerFromAI.queryFromAI,
      finalAnswerFromAI.humanFriendlyAnswer
    );

    // ✅ Respuesta en JSON
    res.json({
      success: true,
      response: finalAnswerFromAI.humanFriendlyAnswer,
      rawQuery: finalAnswerFromAI.queryFromAI,
    });
  } catch (error) {
    console.error("Error procesando la consulta:", error);

    const errorAnswer = await errorHandler(message, history);
    addToHistory(message, errorAnswer);

    // ✅ Error en JSON
    res.status(500).json({
      success: false,
      response: errorAnswer,
    });
  }
});

export default router;
export { schema };
