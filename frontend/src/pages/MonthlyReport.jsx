import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MonthlyReport({ API_BASE_URL }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [reportData, setReportData] = useState({ grandTotals: {}, days: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/monthly/${currentMonth}`);
        if (response.data.success) {
          setReportData(response.data);
        }
      } catch (error) {
        console.error("Error fetching monthly report:", error);
      }
      setLoading(false);
    };

    fetchMonthlyData();
  }, [currentMonth, API_BASE_URL]);

  return (
    <div className="space-y-6">
      {/* මාසය තෝරන පැනලය */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 no-print flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
            <span>📊</span> මුළු මාසික සාරාංශය (විකුණුම්, වියදම් සහ වැටුප්)
          </h2>
          <p className="text-xs text-gray-400 mt-1">මාසය තෝරා සේවක වැටුප් සහ අවසාන ශුද්ධ ලාභය විශ්ලේෂණය කරන්න</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="p-2 border border-gray-300 font-bold text-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            🖨️ මාසික වාර්තාව ප්‍රින්ට් කරන්න
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center font-bold p-10 text-gray-500">🔄 වාර්තාව සකස් කරමින් පවතී...</div>
      ) : reportData.days.length === 0 ? (
        <div className="bg-white p-10 text-center font-bold text-gray-400 border rounded-2xl">📅 මෙම මාසය සඳහා කිසිදු දත්තයක් මෙතෙක් පද්ධතියට ඇතුලත් කර නැත.</div>
      ) : (
        <>
          {/* 📊 මාසික සාරාංශ කාඩ්පත් (Grid updated to 5 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 no-print">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
              <p className="text-xs font-bold text-gray-400">📈 මාසික ආදායම</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">Rs. {reportData.grandTotals.totalRevenue}/=</h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
              <p className="text-xs font-bold text-gray-400">🥬 එළවළු ලාභය</p>
              <h3 className="text-lg font-black text-indigo-600 mt-1">Rs. {reportData.grandTotals.totalVegProfit}/=</h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
              <p className="text-xs font-bold text-gray-400">💸 වෙනත් වියදම්</p>
              <h3 className="text-lg font-black text-red-500 mt-1">Rs. {reportData.grandTotals.totalExpenses}/=</h3>
            </div>
            {/* 👈 🆕 මුළු මාසෙටම ගිය සේවක වැටුප් එකතුව පෙන්වන කාඩ් එක */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-xs text-center">
              <p className="text-xs font-bold text-blue-700">👥 මුළු සේවක වැටුප්</p>
              <h3 className="text-lg font-black text-blue-700 mt-1">Rs. {reportData.grandTotals.totalSalary || 0}/=</h3>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs text-center">
              <p className="text-xs font-bold text-amber-700">💰 සැබෑ ශුද්ධ ලාභය</p>
              <h3 className="text-xl font-black text-amber-700 mt-1">Rs. {reportData.grandTotals.totalNetProfit}/=</h3>
            </div>
          </div>

          {/* දිනපතා ලොග් ටේබල් එක */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print-section">
            <h3 className="text-md font-bold text-slate-800 mb-4 border-b pb-2">
              📊 {currentMonth} මාසයේ දිනපතා සවිස්තරාත්මක වාර්තාව
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-gray-700 text-xs uppercase tracking-wider font-semibold border-b">
                  <th className="p-4">දිනය</th>
                  <th className="p-4 text-right">එළවළු ලාභය</th>
                  <th className="p-4 text-right text-red-500">වෙනත් වියදම්</th>
                  <th className="p-4 text-right text-blue-600">සේවක වැටුප්</th>
                  <th className="p-4">වැඩකල සේවකයන් ලැයිස්තුව</th>
                  <th className="p-4 text-right text-emerald-600 bg-emerald-50/50">💡 සැබෑ ශුද්ධ ලාභය</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reportData.days.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50 text-gray-600 transition">
                    <td className="p-4 font-bold text-slate-800">{day.date}</td>
                    <td className="p-4 text-right font-bold text-indigo-600">Rs. {day.vegetableProfit}/=</td>
                    <td className="p-4 text-right font-medium text-red-500">Rs. {day.expensesTotal}/=</td>
                    {/* 👈 දිනපතා වැටුප් එකතුව */}
                    <td className="p-4 text-right font-bold text-blue-600">Rs. {day.salaryTotal || 0}/=</td>
                    {/* 👈 වැඩකල සේවකයන් ලැයිස්තුව */}
                    <td className="p-4 text-xs max-w-xs truncate text-gray-400">
                      {day.salaryList && day.salaryList.length > 0 
                        ? day.salaryList.map(s => `${s.employeeName}: ${s.wages}`).join(', ') 
                        : 'සේවකයන් නැත'}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-700 bg-emerald-50/30">
                      Rs. {day.vegetableProfit - (day.expensesTotal + (day.salaryTotal || 0))}/=
                    </td>
                  </tr>
                ))}
                {/* මුළු මාසික අවසාන එකතුව (Grand Totals Row) */}
                <tr className="bg-slate-900 text-white font-bold border-t-4">
                  <td className="p-4 uppercase text-xs">මාසික එකතුව (TOTALS):</td>
                  <td className="p-4 text-right text-indigo-300">Rs. {reportData.grandTotals.totalVegProfit}/=</td>
                  <td className="p-4 text-right text-red-300">Rs. {reportData.grandTotals.totalExpenses}/=</td>
                  {/* 👈 🆕 මාසය පුරා ගිය මුළු වැටුප් එකතුව වගුවේ යටින්ම පෙන්වීම */}
                  <td className="p-4 text-right text-blue-300">Rs. {reportData.grandTotals.totalSalary || 0}/=</td>
                  <td className="p-4 text-xs text-slate-400 font-normal">මුළු වැටුප් සහ වියදම් ස්වයංක්‍රීයව එකතු කරන ලදී.</td>
                  <td className="p-4 text-right text-xl text-yellow-400 bg-emerald-950 font-black">
                    Rs. {reportData.grandTotals.totalNetProfit}/=
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}