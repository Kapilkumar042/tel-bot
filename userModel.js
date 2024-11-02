// userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Unique identifier for each user
    topicSelected: { type: String, required: true }, // The chosen comprehension topic
    currentQuestionIndex: { type: Number, default: 0 }, // Track the current question (0-9)
    score: { type: Number, default: 0 } // Track the number of correct answers
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
