# Welcome to my project!

### It allows users to make questions about a database of your choice to a llm and using a prompt and the schema of the database it will generate a SQL query to answer the question, the program will execute the query to the database.

### Another chat bot will translate the SQL result in a human way and in the same language of the question.

### It's important to understand that you must modify the prompt to match your specific needs.

### The chatbot is powered by LangChain and uses the ChatGroq model(llama3-70b-8192) to generate the SQL query, though you can use any other model you want.

## Features

- Chatbot functionality
- Database integration
- SQL query generation
- Response formatting

## Installation

1. Clone the repository:

```bash
git clone https://github.com/raull/ExpressChatBot.git
```

2. Install dependencies:

```bash
npm install
```

3. Configure the database connection and the LLM api key in the `.env` file:

```
groq_api_key=your_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=expresschatbot
DB_PORT=3306
```

4. Start the server:

```
npm start
```

## Usage

To use the chatbot, simply send a message to the server using a POST request. The server will respond with a list of players that match the query.

For example, to get a list of players with a height greater than 200 and a free throw statistic greater than 50, you can send the following message:

```
Give me 10 players who have played in NCAA wich height is higher than 2 meters and a free throw statistic greater than 50?
```

The server will respond with a list of players that match the query:

```
Heres the result from the database:
[{"Firstname":"firstname","Lastname":"lastname","Height":2.0,"GameFreeThrowsStatistic":50,"link":"https://sportiw.com/en/athletes/firstname%20lastname/bjse1a360bfb50jy3voy/"}]
```
