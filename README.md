# ExpressChatBot

A natural language interface for database queries that translates user questions into SQL and presents results in a human-friendly format.

## Overview

ExpressChatBot allows users to interact with databases through natural language. The system:

1. Takes user questions about database content
2. Converts these questions to SQL queries using LLM technology
3. Executes the queries against your database
4. Translates the results back into natural language responses

The chatbot uses LangChain and ChatGroq (powered by llama3-70b-8192) for SQL generation, though you can configure any model of your choice.

## Features

- **Natural Language Interface**: Ask questions about your data in plain language
- **SQL Query Generation**: Automatically creates optimized SQL from natural language
- **Database Integration**: Connect to your existing database
- **Smart Response Formatting**: Presents results in human-readable format
- **Multilingual Support**: Responds in the same language as the question

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/raull/ExpressChatBot.git
   cd ExpressChatBot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root with the following:
   ```
   GROQ_API_KEY=your_api_key
   DB_HOST=localhost
   DB_USER=user
   DB_PASSWORD=userPassword
   DB_NAME=expresschatbot
   DB_PORT=3306
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Usage

Send questions to the server using POST requests. The system will:
1. Generate a SQL query from your question
2. Execute it against the database
3. Format the results in a human-readable way

### Example

**User Query:**
```
Give me 10 players who have played in NCAA with height greater than 2 meters and a free throw statistic greater than 50?
```

**Database Result:**
```json
[
  {
    "Firstname": "firstname",
    "Lastname": "lastname",
    "Height": 2.0,
    "GameFreeThrowsStatistic": 50,
    "link": "https://sportiw.com/en/athletes/firstname%20lastname/bjse1a360bfb50jy3voy/"
  },
  // Additional players...
]
```

**Formatted Response:**
```html
Here are the 10 players you requested: <br>
- <a href="player.link" target="_blank">player.Firstname player.Lastname</a> <br>
- [Additional players listed here] <br>
Hope it was helpful! <br>
```

Here is an example of the output:

![Screenshot 2024-11-22 184101](https://github.com/user-attachments/assets/2411a5a5-27c1-48e7-bfbd-4995e8aec211)

## Customization

You can modify the prompt templates in the codebase to match your specific database schema and use case requirements.

## Requirements

- Node.js
- MySQL database (or compatible)
- API key for your chosen LLM provider

## License

[License information here]