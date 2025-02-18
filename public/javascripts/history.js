let history = []; //variable que almacenara el mensaje que sera la request pero solo queremos el body

export function addToHistory(userMessage, aiMessage) {
  const message = {
    User: userMessage,
    You: aiMessage,
  };

  if (history.length >= 3) {
    history.shift();
    history.push(message);
  } else {
    history.push(message);
  }
}

export { history };
