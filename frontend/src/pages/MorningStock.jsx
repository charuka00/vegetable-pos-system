import React, { useState } from 'react';

export default function MorningStock({ 
  stocks, 
  selectedDate, 
  handleCostChange, 
  handleRetailPriceChange,     // 👈 🆕 අලුතෙන් ආපු සිල්ලර මිල හැන්ඩ්ලර් එක
  handleWholesalePriceChange,   // 👈 🆕 අලුතෙන් ආපු තොග මිල හැන්ඩ්ලර් එක
  handleOpeningChange, 
  handleOldOpeningChange, 
  handleOldPriceChange,   
  saveMorningDataToDB 
}) {
  const [showSummary, setShowSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = async () => {
    try {
      const success = await saveMorningDataToDB(); 
      if (success) { setShowSummary(true); }
    } catch (err) { console.error(err); }
  };

  const totalCostValue = stocks.reduce((sum, item) => {
    const open = parseFloat(item.opening) || 0;
    const cost = parseFloat(item.cost) || 0;
    return sum + (open * cost);
  }, 0);

  const filteredStocks = stocks.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // සාරාංශයට ගන්නේ අලුත් බඩු හෝ ඊයේ ඉතුරු බඩු තියෙන එළවළු විතරයි
  const updatedSummaryStocks = stocks.filter(item => (parseFloat(item.opening) || 0) > 0 || (parseFloat(item.oldOpening) || 0) > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2"><span>☀️</span> උදෑසන තොග, තොග මිල සහ සිල්ලර මිල ඇතුලත් කිරීම</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">📅 දිනය: <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{selectedDate}</span></p>
          </div>
          <input type="text" placeholder="සොයන්න (Search)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-72 pl-4 pr-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((item) => (
            <div key={item.id} className={`${item.bgColor} p-5 rounded-2xl border flex flex-col justify-between shadow-xs hover:shadow-md transition`}>
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-4xl p-2 bg-white rounded-xl shadow-xs">{item.icon}</span>
                <h3 className="font-extrabold text-gray-800 text-md">{item.name}</h3>
              </div>
              
              <div className="bg-white p-3 rounded-xl border space-y-2 text-xs">
                {/* 🟢 අලුත් තොගයේ කොටස */}
                <div className="font-bold text-emerald-700 border-b pb-1">⚡ අලුත් තොගය (Fresh Stock)</div>
                <div className="flex justify-between items-center">
                  <span>අලුත් බර (KG):</span>
                  <input type="number" placeholder="0.0" value={item.opening} onChange={(e) => handleOpeningChange(item.id, e.target.value)} className="w-20 text-center font-bold border rounded bg-slate-50 outline-none" />
                </div>
                <div className="flex justify-between items-center">
                  <span>ගත් මිල (1 KG):</span>
                  <input type="number" placeholder="0" value={item.cost} onChange={(e) => handleCostChange(item.id, e.target.value)} className="w-20 text-center font-bold border rounded text-red-600 bg-slate-50 outline-none" />
                </div>
                {/* 👈 🆕 සිල්ලර මිල ඇතුලත් කිරීමේ කොටුව */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-600">සිල්ලර මිල (Retail):</span>
                  <input type="number" placeholder="0" value={item.retailPrice} onChange={(e) => handleRetailPriceChange(item.id, e.target.value)} className="w-20 text-center font-bold border rounded text-green-600 bg-slate-50 outline-none" />
                </div>
                {/* 👈 🆕 තොග මිල ඇතුලත් කිරීමේ කොටුව */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-indigo-600">තොග මිල (Wholesale):</span>
                  <input type="number" placeholder="0" value={item.wholesalePrice} onChange={(e) => handleWholesalePriceChange(item.id, e.target.value)} className="w-20 text-center font-bold border rounded text-indigo-600 bg-slate-50 outline-none" />
                </div>

                {/* 🔵 පරණ තොගයේ කොටස */}
                <div className="font-bold text-blue-700 border-b pt-2 pb-1">⏳ පරණ තොගය (Old Stock)</div>
                <div className="flex justify-between items-center">
                  <span>ඊයේ ඉතිරි (KG):</span>
                  {/* 👈 🔥 මේක clear වෙන්නේ නැහැ, ඊයේ ඉතුරු වුණු බර එහෙම්මම පෙන්වනවා */}
                  <input type="number" value={item.oldOpening} onChange={(e) => handleOldOpeningChange(item.id, e.target.value)} className="w-20 text-center font-black border rounded bg-blue-50/50 text-blue-900 outline-none" />
                </div>
                <div className="flex justify-between items-center">
                  <span>පරණ විකුණුම් මිල:</span>
                  <input type="number" placeholder="0" value={item.oldPrice} onChange={(e) => handleOldPriceChange(item.id, e.target.value)} className="w-20 text-center font-bold border rounded text-amber-600 bg-slate-50 outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleConfirm} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow text-sm">📊 උදෑසන තහවුරු කරන්න</button>
        </div>
      </div>

      {showSummary && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <h2 className="text-lg font-bold text-gray-700 mb-4">📋 {selectedDate} උදෑසන දත්ත සාරාංශය</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3">එළවලු වර්ගය</th>
                <th className="p-3">අලුත් තොගය / මිල ගණන්</th>
                <th className="p-3">පරණ තොගය / මිල</th>
                <th className="p-3 text-right">අද මුළු බර</th>
                <th className="p-4 text-right">අද අලුත් ආයෝජනය</th>
              </tr>
            </thead>
            <tbody>
              {updatedSummaryStocks.map((item) => {
                const freshW = parseFloat(item.opening) || 0;
                const oldW = parseFloat(item.oldOpening) || 0;
                const cost = parseFloat(item.cost) || 0;
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 font-bold">{item.icon} {item.name}</td>
                    {/* 👈 🆕 සාරාංශ වගුවේ සිල්ලර සහ තොග මිල වෙන වෙනම පෙන්වීම */}
                    <td className="p-3">{freshW} KG (සිල්ලර: Rs.{item.retailPrice || 0} | තොග: Rs.{item.wholesalePrice || 0})</td>
                    <td className="p-3 text-blue-600">{oldW} KG (Rs.{item.oldPrice || 0})</td>
                    <td className="p-3 text-right font-black">{freshW + oldW} KG</td>
                    <td className="p-4 text-right font-bold text-gray-800">Rs. {freshW * cost}/=</td>
                  </tr>
                );
              })}
              <tr className="bg-amber-50/50 font-black">
                <td colSpan="4" className="p-4 text-right">අද උදේ මුළු බඩු වල වටිනාකම (Total Investment):</td>
                <td className="p-4 text-right text-amber-700">Rs. {totalCostValue}/=</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}