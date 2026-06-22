const DailyStock = require('../models/DailyStock');

// 1. උදෑසන තොගය සහ මිල ගණන් Save කිරීම (Upsert - තිබ්බොත් update කරයි, නැත්නම් අලුතෙන් දමයි)
exports.saveMorningStock = async (req, res) => {
    try {
        const { date, stocks } = req.body; // frontend එකෙන් date එක සහ මුළු stocks array එකම එනවා

        const bulkOperations = stocks.map(item => ({
            updateOne: {
                filter: { date: date, vegetableId: item.id },
                update: {
                    name: item.name,
                    cost: parseFloat(item.cost) || 0,
                    price: parseFloat(item.price) || 0,
                    opening: parseFloat(item.opening) || 0
                },
                upsert: true
            }
        }));

        await DailyStock.bulkWrite(bulkOperations);
        res.status(200).json({ success: true, message: "උදෑසන තොග සහ මිල ගණන් සාර්ථකව සේව් කරන ලදී!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. සන්ධ්‍යාවේ ඉතිරි තොගය Save කර විකුණුම් ගණනය කිරීම
exports.saveEveningStock = async (req, res) => {
    try {
        const { date, stocks } = req.body;

        const bulkOperations = stocks.map(item => {
            const open = parseFloat(item.opening) || 0;
            const close = parseFloat(item.closing) || 0;
            const price = parseFloat(item.price) || 0;
            const cost = parseFloat(item.cost) || 0;

            const soldQty = open - close;
            const revenue = soldQty * price;
            const profit = soldQty * (price - cost);

            return {
                updateOne: {
                    filter: { date: date, vegetableId: item.id },
                    update: {
                        closing: close,
                        sold: soldQty,
                        revenue: revenue,
                        profit: profit
                    }
                }
            };
        });

        await DailyStock.bulkWrite(bulkOperations);
        res.status(200).json({ success: true, message: "සන්ධ්‍යාවේ තොග සහ දවසේ වාර්තාව සාර්ථකව සේව් කරන ලදී!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. තෝරාගත් දවසේ දත්ත නැවත ලබා ගැනීම (Fetch Data by Date)
exports.getStockByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const dayData = await DailyStock.find({ date: date });
        res.status(200).json({ success: true, data: dayData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};