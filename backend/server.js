const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // JSON data handle කරන්න

// Test Route
app.get('/', (req, res) => {
    res.send('Vegetable POS System Backend is Running...');
});

// Server Start කිරීම
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});