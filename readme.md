# Telegram Quiz Bot

This is a Telegram Quiz Bot that delivers quizzes on various topics to users, with passages and multiple-choice questions on topics like Nature, Science, History, and Technology. Users can select a topic, read a passage, and answer quiz questions. The bot tracks user scores and resets for new quiz rounds.

## Features

- **Topic Selection**: Users can choose from predefined topics.
- **Passage Display**: Each topic has an informational passage.
- **Quiz Questions**: Multiple-choice questions related to the passage.
- **Score Tracking**: The bot tracks user scores and displays results after the quiz.

## Technologies

- **Node.js** and **Express.js** for server-side scripting.
- **MongoDB** for storing user sessions and quiz questions.
- **node-telegram-bot-api** for Telegram Bot API integration.

## Prerequisites

Before you begin, make sure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v20 or later)
- [MongoDB](https://www.mongodb.com/try/download/community)
- A Telegram account

## Getting Started

### Step 1: Set up the Telegram Bot API Token

1. Open Telegram and start a chat with [BotFather](https://t.me/botfather).
2. Type `/newbot` and follow the prompts to create a new bot.
3. Copy the API token provided by BotFather.

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/telegram-quiz-bot.git
cd telegram-quiz-bot

Step 3: Install Dependencies
npm install

Step 4: Seed the Database
node seed.js

Step 5: Run the Bot
node bot.js


