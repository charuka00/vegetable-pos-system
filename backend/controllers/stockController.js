const DailyStock = require('../models/DailyStock');

/**
 * ========================================================
 * 1. MORNING STOCK SAVE (Updated for Fresh & Old stock fields)
 * ========================================================
 */
exports.saveMorningStock = async (req, res) => {
    try {
        console.log("🔥 saveMorningStock HIT - Dual Prices Engine");
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
                        cost: Number(item.cost) || 0,         // අලුත් තොගයේ ගත් මිල
                        price: Number(item.price) || 0,       // අලුත් තොගයේ විකුණුම් මිල
                        opening: Number(item.opening) || 0,   // අලුත් තොගයේ බර (Fresh KG)
                        
                        // 👈 🆕 පරණ තොගයේ බර සහ පරණ විකුණුම් මිල ඩේටාබේස් එකට සේව් කිරීම
                        oldOpening: Number(item.oldOpening) || 0, 
                        oldPrice: Number(item.oldPrice) || 0
                    }
                },
                upsert: true
            }
        }));

        const result = await DailyStock.bulkWrite(bulkOperations);
        return res.status(200).json({ success: true, message: "Morning and old stock saved successfully", result });

    } catch (error) {
        console.error("❌ saveMorningStock error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * ========================================================
 * 2. EVENING STOCK SAVE (FIFO Calculation with Dual Prices)
 * ========================================================
 */
exports.saveEveningStock = async (req, res) => {
    try {
        console.log("🌙 saveEveningStock HIT - FIFO Dual Prices Engine");
        const { date, stocks, otherExpenses, staffSalaries, actualNetProfit } = req.body;

        if (!date || !Array.isArray(stocks)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: date or stocks missing"
            });
        }

        const bulkOperations = stocks.map(item => {
            const oldOpen = Number(item.oldOpening) || 0;     // ඊයේ ඉතුරු බර
            const freshOpen = Number(item.opening) || 0;       // අද ගෙනාපු බර
            const totalOpen = oldOpen + freshOpen;             // මුළු උදේ බර
            
            const close = Number(item.closing) || 0;           // හවස ඉතුරු බර
            const soldQty = Math.max(0, totalOpen - close);    // විකුණපු මුළු බර
            
            const freshPrice = Number(item.price) || 0;        // අලුත් විකුණුම් මිල
            const oldPrice = Number(item.oldPrice) || 0;        // පරණ විකුණුම් මිල
            const cost = Number(item.cost) || 0;                // අලුත් ඒවයේ ගත් මිල

            let revenue = 0;
            let profit = 0;

            // 🧮 FIFO කැල්කියුලේෂන් ලොජික් එක:
            if (soldQty <= oldOpen) {
                // 1. පරණ බඩු ප්‍රමාණය විතරක් විකිණී ඇත්නම් (සියල්ල පරණ මිලට)
                revenue = soldQty * oldPrice;
                // පරණ බඩු ඊයේ දවසේ ආයෝජනයක් නිසා අද දවසේ ඒක 100% ක්ම ශුද්ධ ලාභයක් වේ (Cost = 0)
                profit = soldQty * oldPrice; 
            } else {
                // 2. පරණ බඩු ඔක්කොම විකිණිලා, අලුත් ඒවත් විකිණී ඇත්නම්
                const oldSold = oldOpen;
                const freshSold = soldQty - oldOpen;

                revenue = (oldSold * oldPrice) + (freshSold * freshPrice);
                profit = (oldSold * oldPrice) + (freshSold * (freshPrice - cost));
            }

            return {
                updateOne: {
                    filter: { date, vegetableId: item.id },
                    update: {
                        $set: {
                            closing: close,
                            sold: soldQty,
                            revenue: revenue,  // FIFO ක්‍රමයට හැදුණු මුළු ආදායම
                            profit: profit,    // FIFO ක්‍රමයට හැදුණු මුළු ලාභය
                            otherExpenses: otherExpenses || [], 
                            staffSalaries: staffSalaries || [], 
                            actualNetProfit: actualNetProfit || 0 
                        }
                    }
                }
            };
        });

        const result = await DailyStock.bulkWrite(bulkOperations);
        return res.status(200).json({ success: true, message: "Evening stock calculated via FIFO and saved successfully", result });

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
        const { yearMonth } = req.params; 
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
                    salaryTotal: 0, 
                    expensesList: record.otherExpenses || [],
                    salaryList: record.staffSalaries || [] 
                };

                if (record.otherExpenses) {
                    dailySummary[record.date].expensesTotal = record.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
                }
                
                if (record.staffSalaries) {
                    dailySummary[record.date].salaryTotal = record.staffSalaries.reduce((sum, s) => sum + s.wages, 0);
                }
            }
            dailySummary[record.date].vegetableRevenue += record.revenue;
            dailySummary[record.date].vegetableProfit += record.profit;
        });

        const detailsArray = Object.values(dailySummary).sort((a, b) => a.date.localeCompare(b.date));

        // මුළු මාසයේම Grand Totals කැල්කියුලේට් කිරීම
        const grandTotals = detailsArray.reduce((acc, curr) => {
            acc.totalRevenue += curr.vegetableRevenue;
            acc.totalVegProfit += curr.vegetableProfit;
            acc.totalExpenses += curr.expensesTotal;
            acc.totalSalary += curr.salaryTotal; 
            acc.totalNetProfit += (curr.vegetableProfit - (curr.expensesTotal + curr.salaryTotal));
            return acc;
        }, { totalRevenue: 0, totalVegProfit: 0, totalExpenses: 0, totalSalary: 0, totalNetProfit: 0 });

        return res.status(200).json({ success: true, grandTotals, days: detailsArray });

    } catch (error) {
        console.error("❌ getMonthlyReport error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};