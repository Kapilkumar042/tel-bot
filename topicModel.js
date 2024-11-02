const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true }, // Array of options
    answer: { type: Number, required: true } // Index of the correct answer
});

const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    passage: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true }
});

module.exports = mongoose.model('Topic', TopicSchema);
