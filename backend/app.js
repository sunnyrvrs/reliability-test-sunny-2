const express = require('express');
const mongoose = require('mongoose');
const Todo = require('./todoModel');
const cors = require('cors');

const app = express();

app.use(express.json()); // for parsing application/json
app.use(cors()); // This will enable CORS for all routes

// Replace with your MongoDB connection string
mongoose.connect('mongodb+srv://reliability:sunny@reliability-test.ydtqkk3.mongodb.net/?retryWrites=true&w=majority', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


// POST: Create a Todo
app.post('/todos', async (req, res) => {
    try {
        const todo = new Todo(req.body);
        await todo.save();
        res.status(201).send(todo);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET: Retrieve all Todos
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find({});
        res.send(todos);
    } catch (error) {
        res.status(500).send(error);
    }
});

// PATCH: Update a Todo
app.patch('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!todo) {
        return res.status(404).send();
        }
        res.send(todo);
    } catch (error) {
        res.status(400).send(error);
    }
});

// DELETE: Delete a Todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).send();
        }
        res.send(todo);
    } catch (error) {
        res.status(500).send(error);
    }
});