import express from "express";
import { main, errorHandler } from "../public/javascript/LLM.js";
import { getSchema } from "../public/javascript/DB.js";
const router = express.Router();

let history = []; //variable que almacenara el mensaje que sera la request pero solo queremos el body
const gettingSchema = await getSchema();

//llm solo procesa json en string, por ende

const schema = JSON.stringify(gettingSchema);

console.log(schema);

// Ruta principal
router.post("/", async (req, res) => {
  const { msg: message } = req.body; //obtenemos el mensaje enviado por el usuario

  try {
    //intentamos ejecutar la consulta en la base de datos en caso de que de error se informara al usuario
    const formattedResponse = await main(message, schema, history); //llamamos a la funcion main
    res.send(`<ul>${formattedResponse}</ul>`); //enviamos la respuesta formateada en HTML
  } catch (error) {
    const errorAnswer = await errorHandler(message, error);
    res.send(`<ul>${errorAnswer}</ul>`);
    console.error("Error procesando la consulta:", error);
  }
});

export default router;
export { schema };
