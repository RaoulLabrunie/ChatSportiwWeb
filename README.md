# 🤖 ChatSportiwWeb

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/GPL-3.0-green)

> A natural language interface for database queries that translates user questions into SQL and presents results in a human-friendly format.

## ✨ Overview

**ChatSportiwWeb** transforms the way you interact with databases through natural language. The system:

1. 💬 Takes user questions about database content
2. 🔄 Converts these questions to SQL queries using LLM technology
3. ⚡ Executes the queries against your database
4. 📊 Translates the results back into natural language responses

Built on ChatGroq (powered by llama3-70b-8192), ChatSportiwWeb brings the power of conversational AI to your data infrastructure. Customize with any compatible LLM of your choice.

## 🌟 Features

- **Natural Language Interface**: Ask questions about your data in plain language
- **SQL Query Generation**: Automatically creates optimized SQL from natural language
- **Database Integration**: Connect to your existing database
- **Smart Response Formatting**: Presents results in human-readable format
- **Multilingual Support**: Responds in the same language as the question
- **Secure Authentication**: Login system restricts access to authorized users only
- **Permission-Based Access**: Users can only access chats based on their database permissions

## 🚀 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/raull/ChatSportiwWeb.git
   cd ChatSportiwWeb
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
   DB_NAME=ChatSportiwWeb
   DB_PORT=3306

   # Login database connection
   LOGIN_DB_HOST=localhost
   LOGIN_DB_USER=login_user
   LOGIN_DB_PASSWORD=loginPassword
   LOGIN_DB_NAME=logindb
   LOGIN_DB_PORT=3306


   #Metadata database connection
   METADATA_DB_HOST=localhost
   METADATA_DB_USER=metadata_user
   METADATA_DB_PASSWORD=metadataPassword
   METADATA_DB_NAME=metadatadb
   METADATA_DB_PORT=3306
   ```

4. **Start the server**:
   ```bash
   npm run start
   ```

## ⚙️ Customization

### Authentication Setup

The authentication system is implemented in `src/auth/DB2.js`. The login process works as follows:

1. The user enters their credentials on the login page
2. The system verifies the user exists in the authentication database
3. The system checks the user's rank/permission level in the database
4. **Access control**: Users with a rank greater than 2 are granted access to the chat interface
5. Users with insufficient privileges (rank ≤ 2) cannot view or access the chat functionality

You can customize the authentication logic to work with your own database schema as long as you maintain this core rank-based permission verification. The minimum required structure should include user identification and a numeric rank field.

### Chat Setup

The chat functionality is implemented in `src/chat/LLM.js`. The chat process works as follows:

1. The user submits a natural language question
2. The system generates a SQL query from the question
3. The system executes the query against the database
4. The system returns the results in a human-readable format

### Metadata

The login will automatically send the users id, importance, date, device and browser. This information is stored in the metadata database. In chatmetadata.

Each time the user sends a message, the system will send the message and the sql query to the metadata database. This information is stored in the mesagemetadata table.

### DB structure examples

```sql
CREATE TABLE users(
    user_id,
    name,
    email,
    password
);

CREATE TABLE importance(
    importance_id,
    importance
);

CREATE TABLE chatmetadata(
    chat_id,
    user_id,
    importance_id,
    inDate,
    device,
    browser
);

CREATE TABLE mensajemetadata(
    message_id,
    user_id,
    message,
    extractedsql
);
```

(just a little example of the database structure)

You can customize the chat logic to work with your own database schema and use case requirements. The system uses ChatGroq models (powered by llama3-70b-8192) for SQL generation, though you can configure any model of your choice. Feel fre to modify the prompt templates in `src/chat/LLM.js` to match your specific database schema and use case requirements.

## 📝 Usage

### Authentication Flow

1. Navigate to the login page
2. Enter your username and password
3. The system authenticates against the database in `src/auth/DB2.js`
4. If authenticated, the system checks your user rank
5. Only users with rank > 2 can access the chat interface
6. Users with insufficient rank (≤ 2) will be denied access

### Chat Interaction

Once authenticated with sufficient privileges:

1. Use the web interface to submit natural language questions
2. The system generates a SQL query from your question
3. Executes it against the database
4. Returns the results in a human-readable format

To access the chat functionality, users must:

- Have a valid account in the authentication database
- Have a user rank greater than 2

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
ChatSportiwWeb/
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

## 📋 Requirements

- Node.js v14 or higher
- MySQL database (or compatible alternative)
  - Main database for chat functionality
  - Authentication database for user management and permissions
- API key for your chosen LLM provider

---

<div align="center">
  Made with ❤️ by Raoul
</div>
