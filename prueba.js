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

// Ejemplo de uso
const query =
  "SELECT * FROM users WHERE first_name = 'John' AND last_name = 'Doe\\'s' AND age > 18;";
console.log(extractSqlValues(query));
