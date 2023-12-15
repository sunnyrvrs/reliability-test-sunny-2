const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' }
});

module.exports = mongoose.model('Todo', todoSchema);