Welcome to my project!

This is a simple chatbot built with Node.js, Express, and LangChain.

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