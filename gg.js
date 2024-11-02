// const token = '7545530729:AAFuqvdLCeAM7A6ZJ8NJWkXAXRkCKI64_t0';

const TelegramBot = require('node-telegram-bot-api');
const { topics } = require('./data');

const token = '7545530729:AAFuqvdLCeAM7A6ZJ8NJWkXAXRkCKI64_t0';
const bot = new TelegramBot(token, { polling: true });

let userSessions = {};

// Command to choose a topic
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = { score: 0, questionIndex: 0, topic: null };

  // Display topics as buttons
  const topicOptions = Object.keys(topics).map((topic) => ({
    text: topic,
    callback_data: `select_${topic}`
  }));

  bot.sendMessage(chatId, "Welcome to the Comprehension Quiz Bot! Choose a topic to read and start the quiz:", {
    reply_markup: { inline_keyboard: [topicOptions] }
  });
});

// Handle topic selection to show passage and "Start Quiz" button
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('select_')) {
    // User selected a topic
    const topic = data.split('_')[1];
    userSessions[chatId].topic = topic;
    userSessions[chatId].score = 0;
    userSessions[chatId].questionIndex = 0;

    const passage = topics[topic].passage;

    // Send passage and a "Start Quiz" button
    bot.sendMessage(chatId, `Topic: ${topic}\n\n${passage}`, {
      reply_markup: {
        inline_keyboard: [[{ text: "Start Quiz", callback_data: `start_${topic}` }]]
      }
    });
  } else if (data.startsWith('start_')) {
    // User clicked "Start Quiz" button
    sendQuestion(chatId);
  } else if (data.startsWith('answer_')) {
    // This handles answers during the quiz
    handleAnswer(chatId, data);
  }
});

// Function to send each question
function sendQuestion(chatId) {
  const userSession = userSessions[chatId];
  const topicData = topics[userSession.topic];
  const questionData = topicData.questions[userSession.questionIndex];

  const questionText = questionData.question;
  const options = questionData.options.map((option, index) => [{
    text: String.fromCharCode(65 + index) + ". " + option,
    callback_data: `answer_${index}`
  }]); // Each option is in its own array to create vertical display

  bot.sendMessage(chatId, questionText, {
    reply_markup: { inline_keyboard: options } // The options array is now a 2D array for vertical display
  });
}

// Function to handle answers and provide feedback
function handleAnswer(chatId, data) {
  const userSession = userSessions[chatId];
  const topicData = topics[userSession.topic];
  const questionData = topicData.questions[userSession.questionIndex];

  const selectedOption = parseInt(data.split('_')[1]);
  const correctOption = questionData.answer;
  
  // Provide feedback based on correctness of the answer
  if (selectedOption === correctOption) {
    bot.sendMessage(chatId, "Great job! That’s correct!");
    userSession.score += 1;
  } else {
    const correctAnswerText = String.fromCharCode(65 + correctOption) + ". " + questionData.options[correctOption];
    bot.sendMessage(chatId, `Good try! The correct answer is ${correctAnswerText}.`);
  }

  // Move to the next question or end the quiz
  userSession.questionIndex += 1;
  if (userSession.questionIndex < topicData.questions.length) {
    setTimeout(() => sendQuestion(chatId), 1000); // Show next question after a short delay
  } else {
    bot.sendMessage(chatId, `Quiz complete! Your final score: ${userSession.score}/${topicData.questions.length}`);
    bot.sendMessage(chatId, "Would you like to try another topic? Use /start to choose again.");
    userSessions[chatId] = null; // Reset session
  }
}
