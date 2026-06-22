import React from 'react';

export default function EveningStock({ stocks, selectedDate, handleClosingChange, calculateSales, totalDayRevenue, totalDayProfit }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🌙</span> සන්ධ්‍යාවේ ඉතිරි තොගය (Closing Stock)
            </h2>
            <p className="text-xs text-gray-400 mt-1">📅 තෝරාගත් දිනය: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedDate}</span></p>
          </div>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">Evening Page</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((item) => (
            <div key={item.id} className={`${item.bgColor} p-6 rounded-2xl border border-gray-200/80 flex flex-col justify-between shadow-xs`}>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-5xl p-3 bg-white rounded-2xl shadow-xs">{item.icon}</span>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-md">{item.name}</h3>
                  <p className="text-xs text-amber-600 font-bold">☀️ උදේ තොගය: {item.opening || 0} KG</p>
                  <p className="text-xs text-red-500 font-bold">📉 ගත් මිල: Rs.{item.cost} / KG</p>
                  <p className="text-xs text-green-600 font-bold">💰 විකුණුම් මිල: Rs.{item.price} / KG</p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Closing KG</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={item.closing}
                    onChange={(e) => handleClosingChange(item.id, e.target.value)}
                    className="w-24 p-2 text-center font-black text-gray-800 border-b-2 border-gray-300 focus:border-indigo-500 outline-none text-lg"
                  />
                  <span className="text-xs font-bold text-gray-400">KG</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={calculateSales}
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow transition text-md"
        >
          🔄 දවසේ විකුණුම් ප්‍රමාණය සහ වාර්තාව ගණනය කරන්න
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span>📊</span> {selectedDate} අවසාන විකුණුම් වාර්තාව (Live Sales & Profit Report)
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-gray-700 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
              <th className="p-4">එළවලු වර්ගය</th>
              <th className="p-4 text-red-500">ගත් මිල</th>
              <th className="p-4 text-green-600">විකුණුම් මිල</th>
              <th className="p-4">උදේ / හවස</th>
              <th className="p-4 text-emerald-600">විකුණූ ප්‍රමාණය</th>
              <th className="p-4 text-right">මුළු ආදායම</th>
              <th className="p-4 text-right text-blue-600">ශුද්ධ ලාභය (Profit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 text-sm text-gray-600 transition">
                <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span> {item.name}
                </td>
                <td className="p-4 text-red-500 font-medium">Rs. {item.cost}/=</td>
                <td className="p-4 text-green-600 font-bold">Rs. {item.price}/=</td>
                <td className="p-4 text-xs">{item.opening || 0} / {item.closing || 0} KG</td>
                <td className="p-4 font-bold text-emerald-600">{item.sold > 0 ? `${item.sold} KG` : '0 KG'}</td>
                <td className="p-4 text-right font-bold text-gray-800">Rs. {item.revenue}/=</td>
                <td className="p-4 text-right font-black text-blue-600">Rs. {item.profit || 0}/=</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-bold text-gray-800">
              <td colSpan="5" className="p-4 text-right text-sm">මුළු එකතුව (Totals):</td>
              <td className="p-4 text-right text-lg text-gray-900">Rs. {totalDayRevenue}/=</td>
              <td className="p-4 text-right text-xl text-blue-700 bg-blue-50">Rs. {totalDayProfit}/=</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}