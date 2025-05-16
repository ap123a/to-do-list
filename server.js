const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB savienojums
mongoose.connect('mongodb+srv://sluzisnime:Parole123!@todo.qpltizw.mongodb.net/?retryWrites=true&w=majority&appName=todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Savienojums izveidots ar MongoDB!'))
.catch(err => console.error('Savienojuma kļūda:', err));

// API maršruti
app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    const newTask = new Task(req.body);
    await newTask.save();
    res.json(newTask);
});

app.put('/tasks/:id', async (req, res) => {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
});

app.delete('/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Uzdevums dzēsts' });
});

// Pievienojiet šo maršrutu, lai apstrādātu pieprasījumus uz saknes URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Atgriež index.html failu
});

// Pievienojiet šo maršrutu, lai apstrādātu neatrastas URL
app.get('*', (req, res) => {
    res.status(404).send('404 URL NOT FOUND');
});

app.listen(PORT, () => {
    console.log(`Serveris darbojas uz http://localhost:${PORT}`);
});