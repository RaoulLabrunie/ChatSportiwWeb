# 🤖 ChatSportiwAPI

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/GPL-3.0-green)

> A natural language API for database queries that translates user questions into SQL and returns results in a human-friendly format.

## ✨ Overview

**ChatSportiwAPI** transforms database interactions through natural language. The system:

1. 💬 Takes user questions about sports database content
2. 🔄 Converts these questions to SQL queries using LLM technology
3. ⚡ Executes the queries against your database
4. 📊 Translates the results back into natural language responses

Built on ChatGroq (powered by llama3-70b-8192), ChatSportiwAPI provides a powerful conversational AI interface for your sports database. Customize with any compatible LLM of your choice.

## 🌟 Features

- **Natural Language Processing**: Translates plain language questions into SQL
- **SQL Query Generation**: Automatically creates optimized SQL from natural language
- **Database Integration**: Connect to your existing sports database
- **Smart Response Formatting**: Presents results in human-readable format
- **Multilingual Support**: Responds in the same language as the question
- **Conversation History**: Maintains context across multiple queries
- **RESTful API**: Simple integration with any client application

## 🚀 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/raull/ChatSportiwAPI.git
   cd ChatSportiwAPI
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root with the following:

   ```
   GROQ_API_KEY=your_api_key

   # Main database connection
   DB_HOST=localhost
   DB_USER=user
   DB_PASSWORD=userPassword
   DB_NAME=ChatSportiwAPI
   DB_PORT=3306
   ```

4. **Start the server**:
   ```bash
   npm run start
   ```

## ⚙️ Customization

### API Configuration

The API is simple and focused on the core functionality:

1. Accepts natural language questions via POST requests
2. Processes the question using the LLM
3. Generates and executes SQL queries on your database
4. Returns human-friendly responses

You can customize the LLM prompts in `src/chat/LLM.js` to match your specific database schema and use case requirements.

## 📝 Usage

### API Endpoint

The API exposes a single POST endpoint at `/send`:

**Request:**

```json
{
  "msg": "Give me 10 players who have played in NCAA with height greater than 2 meters and a free throw statistic greater than 50?"
}
```

**Response:**

```json
{
  "success": true,
  "response": "Here are the 10 players you requested: <br>- <a href=\"https://sportiw.com/en/athletes/player1\" target=\"_blank\">John Smith</a><br>...",
  "rawQuery": "SELECT DISTINCT u.first_name, u.last_name, u.height, eb.game_free_throws_statistic..."
}
```

### Example PHP Client

```php
<?php
$url = 'http://localhost:3000/send';
$data = ['msg' => 'Give me French players under 25 years old'];

$options = [
  'http' => [
    'header'  => "Content-Type: application/json\r\n",
    'method'  => 'POST',
    'content' => json_encode($data),
    'ignore_errors' => true
  ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
  die('Error connecting to API');
}

$response = json_decode($result, true);

if (isset($response['success']) && $response['success']) {
  echo "Response: " . $response['response'] . PHP_EOL;
} else {
  echo "API Error: " . ($response['response'] ?? 'Invalid response') . PHP_EOL;
}
```

## 🗂️ Project Structure

```
ChatSportiwAPI/
├── bin/
├── php/                            # API call proxy
│   ├── main.php
│   └── responsive_chat.html
├── routes/                         # Express route handlers
│   └── send.js
├── src/
│   └── chat/                       # Chat functionality
│       ├── DB.js                   # Database interface
│       ├── history.js              # Conversation history management
│       └── LLM.js                  # Language model (LLM) integration
├── .env                            # Environment variables
├── .gitignore                      # Files/Directories ignored by Git
├── app.js                          # Main application entry point
├── package-lock.json               # Dependency lock file
├── package.json                   # Project metadata and dependencies
└── README.md                      # Project documentation
```

## 📋 Requirements

- Node.js v14 or higher
- MySQL database (or compatible alternative)
- API key for your chosen LLM provider (Groq recommended)

---

<div align="center">
  Made with ❤️ by Raoul
</div>
