const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const mongoUrl = "mongodb://localhost:27017/studentpractice";

mongoose.connect(mongoUrl)
    .then(() => console.log('Database connected'))
    .catch(err => console.log(err));

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(userRoutes);
app.use(authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Student Practice API');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});