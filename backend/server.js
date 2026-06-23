require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// 1. CORS CONFIGURATION (BULLETPROOF METHOD)
// ==========================================
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Manual CORS Interceptor (Preflight බ්ලොක් එක 100% ක් නැති කිරීමට)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    // OPTIONS රික්වෙස්ට් එකක් ආපු සැනින්ම මෙතනින්ම 200 OK දීලා නවත්වනවා
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ======================
// 2. JSON MIDDLEWARE
// ======================
app.use(express.json());

// ======================
// 3. LOGGER
// ======================
app.use((req, res, next) => {
    console.log(`➡️  ${req.method} ${req.url}`);
    next();
});

// ======================
// 4. MONGODB CONNECTION
// ======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Database connection established successfully!"))
    .catch(err => console.log("MongoDB connection error: ", err));

// ======================
// 5. ROUTES
// ======================
const stockRoutes = require('./routes/stockRoutes');
app.use('/api/stocks', stockRoutes);

app.get('/', (req, res) => {
    res.send('Vegetable POS MVC Backend is Running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});