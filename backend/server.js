const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log("MongoDB Database connection established successfully!"))
    .catch(err => console.log("MongoDB connection error: ", err));

// Routes Import කිරීම
const stockRoutes = require('./routes/stockRoutes');

// API Base URL එක සෙට් කිරීම
app.use('/api/stocks', stockRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Vegetable POS MVC Backend is Running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});