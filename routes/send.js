import express from "express";
import { main } from "./LLM.js";
import { getSchema } from "./DB.js";
const router = express.Router();

let history = []; //variable que almacenara el mensaje que sera la request pero solo queremos el body
const schema = await getSchema();
// Ruta principal
router.post("/", async (req, res) => {
  const { msg: message } = req.body; //obtenemos el mensaje enviado por el usuario

  try {
    //intentamos ejecutar la consulta en la base de datos en caso de que de error se informara al usuario
    const formattedResponse = await main(message, schema, history); //llamamos a la funcion main
    res.send(`<ul>${formattedResponse}</ul>`); //enviamos la respuesta formateada en HTML
  } catch (error) {
    console.error("Error procesando la consulta:", error);
    res.status(500).send("Error procesando la consulta.");
  }
});

export default router;
