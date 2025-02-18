import express from "express";
import { main } from "../public/javascripts/LLM.js";
import { getSchema } from "../public/javascripts/DB.js";
const router = express.Router();

// llamamos a esta funcion de DB.js para obtener la estructura de la base de datos
const gettingSchema = await getSchema();
// Como sabemos que el LLM solo puede procesar JSON, pasamos la estructura de la base de datos a JSON
const schema = JSON.stringify(gettingSchema);

// Ruta principal
router.post("/", async (req, res) => {
  const { msg: message } = req.body; //obtenemos el mensaje enviado por el usuario
  try {
    const formattedResponse = await main(message, schema); //llamamos a main, alojada en LLM.js, para procesar el mensaje
    res.send(`<ul>${formattedResponse}</ul>`); //reenviamos la respuesta ya formateada
  } catch (error) {
    console.error("Error procesando la consulta:", error);
    res.status(500).send("Error procesando la consulta.");
  }
});

export default router;
export { schema }; // exportamos la variable schema para que pueda ser utilizada en el archivo LLM.js
