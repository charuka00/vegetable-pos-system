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
        return res.status(200).json({ success: true, message: "Morning stock saved successfully", result });

    } catch (error) {
        console.error("❌ saveMorningStock error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * ========================================================
 * 2. EVENING STOCK SAVE (Updated with Expenses & Salaries)
 * ========================================================
 */
exports.saveEveningStock = async (req, res) => {
    try {
        console.log("🌙 saveEveningStock HIT with Expenses & Salaries");
        // 👈 staffSalaries Request Body එකෙන් භාරගන්නවා
        const { date, stocks, otherExpenses, staffSalaries, actualNetProfit } = req.body;

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
                            profit: soldQty * (price - cost),
                            otherExpenses: otherExpenses || [], 
                            staffSalaries: staffSalaries || [], // 👈 දෛනික සේවක වැටුප් ලැයිස්තුව සේව් කිරීම
                            actualNetProfit: actualNetProfit || 0 
                        }
                    }
                }
            };
        });

        const result = await DailyStock.bulkWrite(bulkOperations);
        return res.status(200).json({ success: true, message: "Evening stock, expenses and salaries saved successfully", result });

    } catch (error) {
        console.error("❌ saveEveningStock error:", error);
        return res.status(500).json({ success: false, error: error.message });
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
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        const dayData = await DailyStock.find({ date });
        return res.status(200).json({ success: true, data: dayData });

    } catch (error) {
        console.error("❌ getStockByDate error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * ========================================================
 * 4. 🔥 GET MONTHLY REPORT (Updated with Grand Total Salary)
 * ========================================================
 */
exports.getMonthlyReport = async (req, res) => {
    try {
        const { yearMonth } = req.params; // Format: YYYY-MM
        console.log("📅 Fetching Monthly Report for:", yearMonth);

        const monthlyData = await DailyStock.find({ date: { $regex: `^${yearMonth}` } });

        if (monthlyData.length === 0) {
            return res.status(200).json({ 
                success: true, 
                grandTotals: { totalRevenue: 0, totalVegProfit: 0, totalExpenses: 0, totalSalary: 0, totalNetProfit: 0 }, 
                days: [] 
            });
        }

        // දිනපතා දත්ත සාරාංශය (Daily Summary Engine)
        const dailySummary = {};
        monthlyData.forEach(record => {
            if (!dailySummary[record.date]) {
                dailySummary[record.date] = {
                    date: record.date,
                    vegetableRevenue: 0,
                    vegetableProfit: 0,
                    expensesTotal: 0,
                    salaryTotal: 0, // 👈 දවසේ මුළු වැටුප් එකතුව තබා ගැනීමට
                    expensesList: record.otherExpenses || [],
                    salaryList: record.staffSalaries || [] // 👈 එදා දවසේ වැටුප් විස්තර ලැයිස්තුව
                };

                if (record.otherExpenses) {
                    dailySummary[record.date].expensesTotal = record.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
                }
                
                // 👈 දවසේ සේවක වැටුප් එකතුව ගණනය කිරීම
                if (record.staffSalaries) {
                    dailySummary[record.date].salaryTotal = record.staffSalaries.reduce((sum, s) => sum + s.wages, 0);
                }
            }
            dailySummary[record.date].vegetableRevenue += record.revenue;
            dailySummary[record.date].vegetableProfit += record.profit;
        });

        const detailsArray = Object.values(dailySummary).sort((a, b) => a.date.localeCompare(b.date));

        // ਮੁළු මාਸයේම Grand Totals කැල්කියුලේට් කිරීම (ලාභයෙන් වියදම් සහ වැටුප් දෙකම අඩු කරයි)
        const grandTotals = detailsArray.reduce((acc, curr) => {
            acc.totalRevenue += curr.vegetableRevenue;
            acc.totalVegProfit += curr.vegetableProfit;
            acc.totalExpenses += curr.expensesTotal;
            acc.totalSalary += curr.salaryTotal; // 👈 මුළු මාසයේම වැටුප් එකතුව (Total Salary Component)
            acc.totalNetProfit += (curr.vegetableProfit - (curr.expensesTotal + curr.salaryTotal));
            return acc;
        }, { totalRevenue: 0, totalVegProfit: 0, totalExpenses: 0, totalSalary: 0, totalNetProfit: 0 });

        return res.status(200).json({ success: true, grandTotals, days: detailsArray });

    } catch (error) {
        console.error("❌ getMonthlyReport error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};