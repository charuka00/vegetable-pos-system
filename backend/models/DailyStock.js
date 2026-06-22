const mongoose = require('mongoose');

const DailyStockSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD format එකෙන් ලේසියෙන් track කරන්න
        required: true
    },
    vegetableId: { type: Number, required: true },
    name: { type: String, required: true },
    cost: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    opening: { type: Number, default: 0 },
    closing: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    profit: { type: Number, default: 0 }
}, { timestamps: true });

// එකම දවසේ, එකම එළවළු වර්ගය දෙපාරක් save වීම වැළැක්වීමට (Compound Index)
DailyStockSchema.index({ date: 1, vegetableId: 1 }, { unique: true });

module.exports = mongoose.model('DailyStock', DailyStockSchema);