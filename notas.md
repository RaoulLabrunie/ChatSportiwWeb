Este documento comenta alguna de las principales problematicas de este proyecto:

- En primera instancia, cada usuario tendra que tener su propia clave de groq, dado que esta es gratuita simplemente se pueden ir creando cada vez que se loguea un usuario.

- Hay que gestionar el tema de los logs, se tiene que hacer un documento en el que se guarde el log de cada chat, y se puede hacer una consulta para ver el log de un chat.

- A veces el chat falla por el numero de request al minuto, esto hay que mirarlo.

- Las sintaxis se van afilando pero ultimamente no he tenido esa clase de problema.

Algunas de las cosas que se van a hacer:

- Crear un logueo de forma que solo las personas que yo quiera se conectan al bot.
- Historial de chat de forma que este tenga consciencia de lo que ha estado hablando.
- Verificar si los modelos de lenguaje funcionan distinto en js que en python.
- Formatear el texto de los mensajes de forma que se vea mejor.
- Añadir un boton de satisfaccion para añadir los querys exitosos a la base de datos.
- Añadir una base de datos de querys que permita verificar al bot si la pregunta ha sido hecha previamente.
- Mejorar la interaccion con la IA intentando limitar su uso a 1 vez y luego formatear la respuesta.
