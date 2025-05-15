# 🤖 ChatSportiwWeb

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/GPL-3.0-green)

> A natural language interface for database queries that translates user questions into SQL and presents results in a human-friendly format.

## ✨ Overview

**ExpressChatBot** transforms the way you interact with databases through natural language. The system:

1. 💬 Takes user questions about database content
2. 🔄 Converts these questions to SQL queries using LLM technology
3. ⚡ Executes the queries against your database
4. 📊 Translates the results back into natural language responses

Built on LangChain and ChatGroq (powered by llama3-70b-8192), ExpressChatBot brings the power of conversational AI to your data infrastructure. Customize with any compatible LLM of your choice.

## 🌟 Features

- **Natural Language Interface**: Ask questions about your data in plain language
- **SQL Query Generation**: Automatically creates optimized SQL from natural language
- **Database Integration**: Connect to your existing database
- **Smart Response Formatting**: Presents results in human-readable format
- **Multilingual Support**: Responds in the same language as the question

## 🚀 Installation

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

## 📝 Usage

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
  }
  // Additional players...
]
```

**Formatted Response:**

```html
Here are the 10 players you requested: <br />
- <a href="player.link" target="_blank">player.Firstname player.Lastname</a>
<br />
- [Additional players listed here] <br />
Hope it was helpful! <br />
```

## 🖼️ Example Output

![Screenshot 2024-11-22 184101](https://github.com/user-attachments/assets/2411a5a5-27c1-48e7-bfbd-4995e8aec211)

## 🗂️ Project Structure

```
ExpressChatBot/
├── bin/                    # Binary executable files
├── node_modules/           # Node.js dependencies
├── public/                 # Static assets
│   ├── images/             # Image assets
│   ├── javascripts/        # Client-side scripts
│   └── stylesheets/        # CSS styling files
│       ├── styleMobile.css # Mobile-specific styles
│       └── stylePC.css     # Desktop-specific styles
├── routes/                 # Express route handlers
│   ├── auth.js             # Authentication routes
│   ├── chat.js             # Chat functionality routes
│   ├── index.js            # Main application routes
│   ├── noChat.js           # Non-chat routes
│   ├── send.js             # Message sending handlers
│   └── users.js            # User management routes
├── src/                    # Source code
│   ├── auth/               # Authentication logic
│   │   └── DB2.js          # Database auth interface
│   ├── chat/               # Chat functionality
│   │   ├── DB.js           # Database chat interface
│   │   ├── history.js      # Chat history management
│   │   └── LLM.js          # LLM integration service
│   └── views/              # View templates
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── app.js                  # Main application entry point
├── dockerfile              # Docker configuration
├── package-lock.json       # Dependency lock file
├── package.json            # Project metadata
└── README.md               # Project documentation
```

## ⚙️ Customization

You can modify the LLM integration in `src/chat/LLM.js` to adjust the prompt templates to match your specific database schema and use case requirements.

## 📋 Requirements

- Node.js v14 or higher
- MySQL database (or compatible alternative)
- API key for your chosen LLM provider

---

<div align="center">
  Made with ❤️ by Raoul
</div>
