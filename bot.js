// const token = '7545530729:AAFuqvdLCeAM7A6ZJ8NJWkXAXRkCKI64_t0';

// bot.js
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const connectDB = require('./db'); 
const User = require('./userModel');
const Topic = require('./topicModel'); 
const token = '7545530729:AAFuqvdLCeAM7A6ZJ8NJWkXAXRkCKI64_t0'; 
const bot = new TelegramBot(token, { polling: true });


connectDB();


// Command to choose a topic
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // Create a new user entry in the database if not exists
    let userSession = await User.findOne({ userId: chatId });
    if (!userSession) {
        userSession = new User({ userId: chatId });
        await userSession.save().catch(err => console.error("Error saving user session:", err));
    }

    // Display topics as buttons
    const topics = await Topic.find(); // Retrieve topics from the database
    const topicOptions = topics.map((topic) => ({
        text: topic.name,
        callback_data: `select_${topic.name}`
    }));

    bot.sendMessage(chatId, "Welcome to the Comprehension Quiz Bot! Choose a topic to read and start the quiz:", {
        reply_markup: { inline_keyboard: [topicOptions] }
    });
});


// Handle topic selection to show passage and "Start Quiz" button
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const userSession = await User.findOne({ userId: chatId });

    if (data.startsWith('select_')) {
        const topicName = data.split('_')[1];
        const topic = await Topic.findOne({ name: topicName });

        if (!topic) {
            return bot.sendMessage(chatId, "Sorry, that topic does not exist.");
        }

        userSession.topicSelected = topicName;
        userSession.score = 0; // Reset score for new topic
        userSession.currentQuestionIndex = 0; // Reset question index for new topic
        await userSession.save(); // Save user session data

        const passage = topic.passage;

        // Send passage and a "Start Quiz" button
        bot.sendMessage(chatId, `Topic: ${topicName}\n\n${passage}`, {
            reply_markup: {
                inline_keyboard: [[{ text: "Start Quiz", callback_data: `start_${topicName}` }]]
            }
        });
    } else if (data.startsWith('start_')) {
        // User clicked "Start Quiz" button
        if (!userSession.topicSelected) {
            bot.sendMessage(chatId, "Please select a topic first before starting the quiz.");
            return;
        }
        sendQuestion(chatId);
    } else if (data.startsWith('answer_')) {
        // This handles answers during the quiz
        handleAnswer(chatId, data);
    }
});

// Function to send each question
async function sendQuestion(chatId) {
    const userSession = await User.findOne({ userId: chatId });
    const topicData = await Topic.findOne({ name: userSession.topicSelected });
    const questionData = topicData.questions[userSession.currentQuestionIndex];

    if (!questionData) {
        return bot.sendMessage(chatId, "No more questions available for this topic.");
    }

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
async function handleAnswer(chatId, data) {
    const userSession = await User.findOne({ userId: chatId });
    const topicData = await Topic.findOne({ name: userSession.topicSelected });
    const questionData = topicData.questions[userSession.currentQuestionIndex];

    const selectedOption = parseInt(data.split('_')[1]);
    const correctOption = questionData.answer;

    // Provide feedback based on correctness of the answer
    if (selectedOption === correctOption) {
        bot.sendMessage(chatId, "Great job! That’s correct!");
        userSession.score += 1; // Increment score
    } else {
        const correctAnswerText = String.fromCharCode(65 + correctOption) + ". " + questionData.options[correctOption];
        bot.sendMessage(chatId, `Good try! The correct answer is ${correctAnswerText}.`);
    }

    // Move to the next question or end the quiz
    userSession.currentQuestionIndex += 1; // Move to the next question
    await userSession.save(); // Save updated user session data
    if (userSession.currentQuestionIndex < topicData.questions.length) {
        setTimeout(() => sendQuestion(chatId), 1000); // Show next question after a short delay
    } else {
        bot.sendMessage(chatId, `Quiz complete! Your final score: ${userSession.score}/${topicData.questions.length}`);
        bot.sendMessage(chatId, "Would you like to try another topic? Use /start to choose again.");
        // Reset user session for next quiz
        userSession.currentQuestionIndex = 0;
        userSession.score = 0;
        await userSession.save(); // Save reset user session data
    }
};

// Error handling for unexpected inputs
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    // Check if the user is in an active quiz session
    const userSession = await User.findOne({ userId: chatId });

    // If the user sends a message that is not a command, we only respond to known commands or inputs
    if (!userSession) {
        return bot.sendMessage(chatId, "Please start the quiz by sending /start.");
    }
    
    // const text = msg.text.toLowerCase();
    // if (text === 'cancel') {
    //     bot.sendMessage(chatId, "Quiz cancelled. You can start again with /start.");
    // } else {
    //     bot.sendMessage(chatId, "I didn't understand that. Please select a topic using the buttons provided or type /start.");
    // }
});

// Start the bot
console.log("Bot started...");
