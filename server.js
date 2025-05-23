const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');



const User = require('./models/User');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'TAVA_SLEPENA_ATSLĒGA';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://sluzisnime:Parole123!@todo.qpltizw.mongodb.net/?retryWrites=true&w=majority&appName=todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Savienojums izveidots ar MongoDB!'))
.catch(err => console.error('Savienojuma kļūda:', err));

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Nav autorizācijas tokena' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Tokena kļūda' });
        req.user = user;
        next();
    });
}


app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Lietotājvārds jau eksistē' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Reģistrācija veiksmīga' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Nepareizs lietotājvārds vai parole' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Nepareizs lietotājvārds vai parole' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});


app.get('/tasks', authenticate, async (req, res) => {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
});

app.post('/tasks', authenticate, async (req, res) => {
    const newTask = new Task({ ...req.body, userId: req.user.id });
    await newTask.save();
    res.json(newTask);
});

app.put('/tasks/:id', authenticate, async (req, res) => {
    const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
    );
    if (!updatedTask) return res.status(404).json({ message: 'Uzdevums nav atrasts vai nepieder jums' });
    res.json(updatedTask);
});

app.delete('/tasks/:id', authenticate, async (req, res) => {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Uzdevums nav atrasts vai nepieder jums' });
    res.json({ message: 'Uzdevums dzēsts' });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('*', (req, res) => {
    res.status(404).send('404 URL NOT FOUND');
});


app.listen(PORT, () => {
    console.log(`Serveris darbojas uz http://localhost:${PORT}`);
});
