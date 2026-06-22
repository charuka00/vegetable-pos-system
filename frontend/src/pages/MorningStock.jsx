import React, { useState } from 'react';

export default function MorningStock({ stocks, selectedDate, handleCostChange, handlePriceChange, handleOpeningChange }) {
  const [showSummary, setShowSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = () => {
    setShowSummary(true);
    alert(`☀️ ${selectedDate} දින උදෑසන තොග සහ මිල ගණන් සාර්ථකව තහවුරු කරන ලදී!`);
  };

  const totalCostValue = stocks.reduce((sum, item) => {
    const open = parseFloat(item.opening) || 0;
    const cost = parseFloat(item.cost) || 0;
    return sum + (open * cost);
  }, 0);

  const filteredStocks = stocks.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
              <span>☀️</span> උදෑසන තොගය, ගත් මිල සහ විකුණුම් මිල ඇතුලත් කිරීම
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">📅 තෝරාගත් දිනය: <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{selectedDate}</span></p>
          </div>
          
          <div className="w-full md:w-72 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="එළවළු නම සොයන්න (Search)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium text-sm transition-all"
            />
          </div>
        </div>

        {filteredStocks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            "{searchTerm}" නමින් එළවළු වර්ගයක් සොයාගත නොහැකි විය.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((item) => (
              <div key={item.id} className={`${item.bgColor} p-5 rounded-2xl border border-gray-200/80 flex flex-col justify-between shadow-xs hover:shadow-md transition`}>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-5xl p-3 bg-white rounded-2xl shadow-xs">{item.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-md">{item.name}</h3>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-gray-50">
                    <span className="text-xs font-bold text-red-500 uppercase">ගත් මිල (1 KG)</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400 font-bold">Rs.</span>
                      <input
                        type="number"
                        value={item.cost}
                        placeholder="0"
                        onChange={(e) => handleCostChange(item.id, e.target.value)}
                        className="w-20 text-center font-bold text-red-600 bg-gray-50 p-1 rounded-md border border-gray-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2 border-gray-50">
                    <span className="text-xs font-bold text-green-600 uppercase">විකුණුම් මිල (1 KG)</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400 font-bold">Rs.</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-20 text-center font-bold text-green-600 bg-gray-50 p-1 rounded-md border border-gray-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">උදේ තොගය (Weight)</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={item.opening}
                        onChange={(e) => handleOpeningChange(item.id, e.target.value)}
                        className="w-20 text-center font-black text-gray-800 bg-gray-50 p-1 rounded-md border border-gray-200 outline-none"
                      />
                      <span className="text-xs font-bold text-gray-400">KG</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow transition text-sm"
          >
            📊 උදෑසන තොගය සහ මිල ගණන් තහවුරු කරන්න
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>📋</span> {selectedDate} උදෑසන දත්ත සාරාංශය (Morning Summary)
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-700 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="p-4">එළවලු වර්ගය</th>
                <th className="p-4 text-red-500">ගත් මිල (Cost)</th>
                <th className="p-4 text-green-600">විකුණුම් මිල (Price)</th>
                <th className="p-4 font-bold text-amber-600">ඇතුලත් කල තොගය</th>
                <th className="p-4 text-right">තොගයේ මුළු වටිනාකම</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stocks.map((item) => {
                const openWeight = parseFloat(item.opening) || 0;
                const costPrice = parseFloat(item.cost) || 0;
                const itemTotalCost = openWeight * costPrice;

                return (
                  <tr key={item.id} className="hover:bg-gray-50 text-sm text-gray-600 transition">
                    <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span> {item.name}
                    </td>
                    <td className="p-4 text-red-500 font-medium">Rs. {costPrice}/=</td>
                    <td className="p-4 text-green-600 font-bold">Rs. {item.price}/=</td>
                    <td className="p-4 font-black text-amber-600">{openWeight} KG</td>
                    <td className="p-4 text-right font-bold text-gray-800">Rs. {itemTotalCost}/=</td>
                  </tr>
                );
              })}
              <tr className="bg-amber-50/50 font-bold text-gray-800">
                <td colSpan="4" className="p-4 text-right text-base font-bold">මුළු බඩු වල වටිනාකම (Total Investment):</td>
                <td className="p-4 text-right text-xl font-black text-amber-700">Rs. {totalCostValue}/=</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}