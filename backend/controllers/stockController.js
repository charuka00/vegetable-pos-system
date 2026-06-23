const DailyStock = require('../models/DailyStock');

/**
 * =========================
 * 1. MORNING STOCK SAVE
 * =========================
 */
exports.saveMorningStock = async (req, res) => {
    try {
        console.log("🔥 saveMorningStock HIT");

        const { date, stocks } = req.body;

        if (!date || !Array.isArray(stocks)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: date or stocks missing"
            });
        }

        const bulkOperations = stocks.map(item => ({
            updateOne: {
                filter: { date, vegetableId: item.id },
                update: {
                    $set: {
                        date,
                        vegetableId: item.id,
                        name: item.name,
                        cost: Number(item.cost) || 0,
                        price: Number(item.price) || 0,
                        opening: Number(item.opening) || 0
                    }
                },
                upsert: true
            }
        }));

        const result = await DailyStock.bulkWrite(bulkOperations);

        return res.status(200).json({
            success: true,
            message: "Morning stock saved successfully",
            result
        });

    } catch (error) {
        console.error("❌ saveMorningStock error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


/**
 * =========================
 * 2. EVENING STOCK SAVE
 * =========================
 */
exports.saveEveningStock = async (req, res) => {
    try {
        console.log("🌙 saveEveningStock HIT");

        const { date, stocks } = req.body;

        if (!date || !Array.isArray(stocks)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: date or stocks missing"
            });
        }

        const bulkOperations = stocks.map(item => {
            const open = Number(item.opening) || 0;
            const close = Number(item.closing) || 0;
            const price = Number(item.price) || 0;
            const cost = Number(item.cost) || 0;

            const soldQty = open - close;

            return {
                updateOne: {
                    filter: { date, vegetableId: item.id },
                    update: {
                        $set: {
                            closing: close,
                            sold: soldQty,
                            revenue: soldQty * price,
                            profit: soldQty * (price - cost)
                        }
                    }
                }
            };
        });

        const result = await DailyStock.bulkWrite(bulkOperations);

        return res.status(200).json({
            success: true,
            message: "Evening stock saved successfully",
            result
        });

    } catch (error) {
        console.error("❌ saveEveningStock error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


/**
 * =========================
 * 3. GET STOCK BY DATE
 * =========================
 */
exports.getStockByDate = async (req, res) => {
    try {
        console.log("📦 getStockByDate HIT:", req.params.date);

        const { date } = req.params;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        const dayData = await DailyStock.find({ date });

        return res.status(200).json({
            success: true,
            data: dayData
        });

    } catch (error) {
        console.error("❌ getStockByDate error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};