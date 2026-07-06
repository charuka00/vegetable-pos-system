import React, { useState, useEffect } from 'react';

export default function EveningStock({ 
  stocks, 
  selectedDate, 
  handleRetailSoldChange,       
  handleWholesaleSoldChange,    
  handleOldSoldChange,          
  calculateSales, 
  dbExpenses, 
  dbSalaries  
}) {
  
  const [expenses, setExpenses] = useState([{ id: 1, description: '', amount: '' }]);
  const [salaries, setSalaries] = useState([{ id: 1, employeeName: '', wages: '' }]); 

  // ඩේටාබේස් එකෙන් පරණ වියදම් Form එකට දානවා
  useEffect(() => {
    if (dbExpenses && dbExpenses.length > 0) {
      setExpenses(dbExpenses.map((exp, i) => ({ id: i, description: exp.description, amount: exp.amount })));
    } else {
      setExpenses([{ id: 1, description: '', amount: '' }]);
    }
  }, [dbExpenses]);

  // ඩේටාබේස් එකෙන් පරණ සේවක වැටුප් Form එකට දානවා
  useEffect(() => {
    if (dbSalaries && dbSalaries.length > 0) {
      setSalaries(dbSalaries.map((sal, i) => ({ id: i, employeeName: sal.employeeName, wages: sal.wages })));
    } else {
      setSalaries([{ id: 1, employeeName: '', wages: '' }]);
    }
  }, [dbSalaries]);

  // --- 💸 වෙනත් වියදම් පාලනය ---
  const addExpenseRow = () => {
    setExpenses([...expenses, { id: Date.now(), description: '', amount: '' }]);
  };

  const removeExpenseRow = (id) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    } else {
      setExpenses([{ id: 1, description: '', amount: '' }]);
    }
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  // --- 🧑‍🤝‍🧑 සේවක වැටුප් පාලනය ---
  const addSalaryRow = () => {
    setSalaries([...salaries, { id: Date.now(), employeeName: '', wages: '' }]);
  };

  const removeSalaryRow = (id) => {
    if (salaries.length > 1) {
      setSalaries(salaries.filter(sal => sal.id !== id));
    } else {
      setSalaries([{ id: 1, employeeName: '', wages: '' }]);
    }
  };

  const handleSalaryChange = (id, field, value) => {
    setSalaries(salaries.map(sal => sal.id === id ? { ...sal, [field]: value } : sal));
  };

  // උදේ බඩු තිබුණු එළවළු වර්ග පමණක් පෙරීම
  const activeMorningStocks = stocks.filter(item => (parseFloat(item.opening) || 0) > 0 || (parseFloat(item.oldOpening) || 0) > 0);

  // --- 🔥 LIVE TRIPLE BREAKDOWN ENGINE (නිවැරදි කරන ලද කැල්කියුලේෂන් එන්ජිම) ---
  let computedTotalRevenue = 0;
  let computedTotalProfit = 0;

  const calculatedStocksList = activeMorningStocks.map(item => {
    const freshOpen = parseFloat(item.opening) || 0;
    const oldOpen = parseFloat(item.oldOpening) || 0;
    
    // මුදලාලි ඇතුළත් කරන ලයිව් විකුණුම් බරවල්
    const rSold = parseFloat(item.retailSold) || 0;
    const wSold = parseFloat(item.wholesaleSold) || 0;
    const oSold = parseFloat(item.oldSold) || 0;
    
    const rPrice = parseFloat(item.retailPrice) || 0;
    const wPrice = parseFloat(item.wholesalePrice) || 0;
    const oPrice = parseFloat(item.oldPrice) || 0;
    const cost = parseFloat(item.cost) || 0;

    // 1. සිල්ලර විකුණුම් ගණනය කිරීම
    const retailRevenue = rSold * rPrice;
    const retailProfit = rSold * (rPrice - cost);

    // 2. තොග විකුණුම් ගණනය කිරීම
    const wholesaleRevenue = wSold * wPrice;
    const wholesaleProfit = wSold * (wPrice - cost);

    // 3. පරණ බඩු විකුණුම් ගණනය කිරීම (Cost 0 බැවින් 100% ලාභය වේ)
    const oldRevenue = oSold * oPrice;
    const oldProfit = oSold * oPrice;

    // එළවළු වර්ගයේ මුළු එකතුව
    const itemTotalRevenue = retailRevenue + wholesaleRevenue + oldRevenue;
    const itemTotalProfit = retailProfit + wholesaleProfit + oldProfit;

    computedTotalRevenue += itemTotalRevenue;
    computedTotalProfit += itemTotalProfit;

    // 👈 🆕 විකුණූ බරවල් අඩු කර හවස ඉතිරි තොගය (Closing Stock) නිවැරදිව ගණනය කිරීම
    const freshClose = Math.max(0, freshOpen - (rSold + wSold));
    const oldClose = Math.max(0, oldOpen - oSold);
    const totalClose = freshClose + oldClose;

    return {
      ...item,
      rSold, retailRevenue, retailProfit,
      wSold, wholesaleRevenue, wholesaleProfit,
      oSold, oldRevenue, oldProfit,
      freshOpening: freshOpen,
      oldOpening: oldOpen,
      freshClosing: freshClose,
      oldClosing: oldClose,
      totalClosing: totalClose,
      revenue: itemTotalRevenue,
      profit: itemTotalProfit
    };
  });

  const totalOtherExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const totalStaffSalaries = salaries.reduce((sum, sal) => sum + (parseFloat(sal.wages) || 0), 0); 
  const actualNetProfit = computedTotalProfit - (totalOtherExpenses + totalStaffSalaries);

  const handleCalculateAndSave = () => {
    const cleanExpenses = expenses
      .filter(exp => exp.description.trim() !== '' && exp.amount !== '')
      .map(exp => ({ description: exp.description, amount: parseFloat(exp.amount) || 0 }));
      
    const cleanSalaries = salaries
      .filter(sal => sal.employeeName.trim() !== '' && sal.wages !== '')
      .map(sal => ({ employeeName: sal.employeeName, wages: parseFloat(sal.wages) || 0 }));
    
    calculateSales(cleanExpenses, cleanSalaries, actualNetProfit);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${selectedDate}DayReport`; 
    window.print(); 
    setTimeout(() => { document.title = originalTitle; }, 100);
  };

  return (
    <div className="space-y-6">
      
      {/* 🌙 1. විකුණූ ප්‍රමාණයන් වෙන වෙනම ඇතුලත් කිරීමේ කොටස */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 no-print">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🌙</span> දවසේ විකුණූ බරවල් වෙන වෙනම ඇතුලත් කරන්න
            </h2>
            <p className="text-xs text-gray-400 mt-1">📅 තෝරාගත් දිනය: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedDate}</span></p>
          </div>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">Evening Page</span>
        </div>

        {activeMorningStocks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-bold">
            ⚠️ අද උදෑසන සඳහා කිසිදු එළවළු තොගයක් ඇතුලත් කර නැත.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMorningStocks.map((item) => (
              <div key={item.id} className={`${item.bgColor} p-5 rounded-2xl border border-gray-200/80 flex flex-col justify-between shadow-xs`}>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-5xl p-3 bg-white rounded-2xl shadow-xs">{item.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-md">{item.name}</h3>
                    <p className="text-xs text-emerald-600 font-bold">☀️ Fresh: {item.opening || 0} KG (සිල්ලර: Rs.{item.retailPrice} | තොග: Rs.{item.wholesalePrice})</p>
                    <p className="text-xs text-blue-600 font-bold">⏳ Old: {item.oldOpening || 0} KG (Rs.{item.oldPrice})</p>
                  </div>
                </div>
                
                {/* 📊 කොටු 3ක් වෙන වෙනම ඇතුලත් කිරීමේ UI කොටස */}
                <div className="bg-white p-3 rounded-xl border space-y-2.5 text-xs">
                  {/* සිල්ලර විකුණුම් බර */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-700">සිල්ලරට විකුණූ (Retail KG):</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number" placeholder="0.0" value={item.retailSold}
                        onChange={(e) => handleRetailSoldChange(item.id, e.target.value)}
                        className="w-20 p-1 text-center font-bold border rounded bg-slate-50 outline-none focus:border-green-500"
                      />
                      <span className="font-bold text-gray-400">KG</span>
                    </div>
                  </div>

                  {/* තොග විකුණුම් බර */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-700">තොග පිටින් විකුණූ (Wholesale KG):</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number" placeholder="0.0" value={item.wholesaleSold}
                        onChange={(e) => handleWholesaleSoldChange(item.id, e.target.value)}
                        className="w-20 p-1 text-center font-bold border rounded bg-slate-50 outline-none focus:border-indigo-500"
                      />
                      <span className="font-bold text-gray-400">KG</span>
                    </div>
                  </div>

                  {/* පරණ බඩු විකුණුම් බර */}
                  <div className="flex items-center justify-between border-t pt-2 border-gray-100">
                    <span className="font-bold text-amber-600">පරණ ඒවා විකුණූ (Old Sold KG):</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number" placeholder="0.0" value={item.oldSold}
                        onChange={(e) => handleOldSoldChange(item.id, e.target.value)}
                        className="w-20 p-1 text-center font-bold border rounded bg-amber-50/30 text-amber-900 outline-none focus:border-amber-500"
                      />
                      <span className="font-bold text-gray-400">KG</span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧑‍🤝‍🧑 2. සේවක වැටුප් ඇතුලත් කිරීමේ පැනලය */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 no-print">
        <h2 className="text-lg font-bold text-amber-600 flex items-center gap-2 mb-4">
          <span>🧑‍🤝‍🧑</span> දවසේ සේවක වැටුප් / කුලී ඇතුලත් කරන්න (Daily Staff Salaries)
        </h2>
        <div className="space-y-3">
          {salaries.map((sal, index) => (
            <div key={sal.id} className="flex items-center gap-4 bg-amber-50/40 p-3 rounded-xl border border-amber-200">
              <span className="text-sm font-bold text-amber-600">{index + 1}.</span>
              <input type="text" placeholder="සේවකයාගේ නම" value={sal.employeeName} onChange={(e) => handleSalaryChange(sal.id, 'employeeName', e.target.value)} className="flex-1 p-2 bg-white border border-gray-300 rounded-lg outline-none text-sm font-medium" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-400">Rs.</span>
                <input type="number" placeholder="0" value={sal.wages} onChange={(e) => handleSalaryChange(sal.id, 'wages', e.target.value)} className="w-32 p-2 bg-white border border-gray-300 rounded-lg outline-none text-center font-bold text-amber-700" />
              </div>
              <button onClick={() => removeSalaryRow(sal.id)} className="text-red-500 p-2 text-sm font-bold">❌</button>
            </div>
          ))}
        </div>
        <button onClick={addSalaryRow} className="mt-4 border-2 border-dashed border-amber-300 hover:border-amber-500 text-amber-700 font-bold py-2 px-4 rounded-xl text-xs transition">➕ තවත් සේවකයෙක් එකතු කරන්න</button>
      </div>

      {/* 💸 3. දවසේ වෙනත් වියදම් ඇතුලත් කිරීමේ පැනලය */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 no-print">
        <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4"><span>💸</span> දවසේ වෙනත් වියදම් ඇතුලත් කරන්න</h2>
        <div className="space-y-3">
          {expenses.map((exp, index) => (
            <div key={exp.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-gray-200">
              <span className="text-sm font-bold text-gray-400">{index + 1}.</span>
              <input type="text" placeholder="වියදම් විස්තරය" value={exp.description} onChange={(e) => handleExpenseChange(exp.id, 'description', e.target.value)} className="flex-1 p-2 bg-white border border-gray-300 rounded-lg outline-none text-sm font-medium" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-400">Rs.</span>
                <input type="number" placeholder="0" value={exp.amount} onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)} className="w-32 p-2 bg-white border border-gray-300 rounded-lg outline-none text-center font-bold text-red-600" />
              </div>
              <button onClick={() => removeExpenseRow(exp.id)} className="text-red-500 p-2 text-sm font-bold">❌</button>
            </div>
          ))}
        </div>
        <button onClick={addExpenseRow} className="mt-4 border-2 border-dashed border-gray-300 hover:border-red-500 text-gray-500 font-bold py-2 px-4 rounded-xl text-xs transition">➕ තවත් වියදම් පේළියක් එකතු කරන්න</button>
      </div>

      {/* 🚀 4. ප්‍රධාන සුරැකීමේ බොත්තම */}
      <div className="no-print">
        <button onClick={handleCalculateAndSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 rounded-2xl shadow-md transition text-md tracking-wider">🔄 දවසේ විකුණුම් වාර්තාව ගණනය කර පද්ධතියට සුරකින්න</button>
      </div>

      {/* 📊 5. මුද්‍රණය වන ප්‍රධාන සවිස්තරාත්මක වාර්තා කොටස */}
      <div id="sales-report-section" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 report-title">
            <span>📊</span> {selectedDate} අවසාන විකුණුම් වාර්තාව (Live Sales & Profit Breakdown Report)
          </h2>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow transition flex items-center gap-2 no-print"><span>🖨️</span> වාර්තාව ප්‍රින්ට් කරන්න / PDF බාගන්න</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse printable-table">
            <thead>
              <tr className="bg-slate-100 text-gray-700 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="p-4">එළවලු වර්ගය සහ ක්‍රමය</th>
                <th className="p-4 text-red-500">ගත් මිල</th>
                <th className="p-4 text-green-600">විකුණුම් මිල</th>
                <th className="p-4">උදේ තොගය</th>
                <th className="p-4">හවස ඉතිරි</th>
                <th className="p-4 text-emerald-600">විකුණූ ප්‍රමාණය</th>
                <th className="p-4 text-right">මුළු ආදායම</th>
                <th className="p-4 text-right text-blue-600">එළවළු ලාභය</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calculatedStocksList.map((item) => (
                <React.Fragment key={item.id}>
                  {/* 1. 🟢 සිල්ලර විකුණුම් පේළිය (Retail Row) */}
                  {item.rSold > 0 && (
                    <tr className="hover:bg-gray-50 text-sm text-gray-600 transition">
                      <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-xl emoji-icon">{item.icon}</span> {item.name} <span className="text-xs bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">සිල්ලර</span>
                      </td>
                      <td className="p-4 text-red-500 font-medium">Rs. {item.cost}/=</td>
                      <td className="p-4 text-green-600 font-bold">Rs. {item.retailPrice}/=</td>
                      {/* 👈 🆕 නිවැරදි කළ කොටස: උදේ Fresh opening සහ ගණනය කළ freshClosing වෙන වෙනම පෙන්වයි */}
                      <td className="p-4 font-medium">{item.freshOpening} KG</td>
                      <td className="p-4 font-bold text-slate-600">{item.freshClosing} KG</td>
                      <td className="p-4 font-bold text-emerald-600">{item.rSold} KG</td>
                      <td className="p-4 text-right font-semibold">Rs. {item.retailRevenue}/=</td>
                      <td className="p-4 text-right font-bold text-blue-600">Rs. {item.retailProfit}/=</td>
                    </tr>
                  )}

                  {/* 2. 🔵 තොග විකුණුම් පේළිය (Wholesale Row) */}
                  {item.wSold > 0 && (
                    <tr className="hover:bg-gray-50 text-sm text-gray-600 transition bg-indigo-50/10">
                      <td className="p-4 font-bold text-gray-800 flex items-center gap-2 pl-6">
                        <span>↳</span> {item.name.split(' (')[0]} <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">තොග</span>
                      </td>
                      <td className="p-4 text-red-500 font-medium">Rs. {item.cost}/=</td>
                      <td className="p-4 text-indigo-600 font-bold">Rs. {item.wholesalePrice}/=</td>
                      <td className="p-4 text-gray-400 font-medium">-</td>
                      <td className="p-4 text-gray-400 font-medium">-</td>
                      <td className="p-4 font-bold text-emerald-600">{item.wSold} KG</td>
                      <td className="p-4 text-right font-semibold">Rs. {item.wholesaleRevenue}/=</td>
                      <td className="p-4 text-right font-bold text-blue-600">Rs. {item.wholesaleProfit}/=</td>
                    </tr>
                  )}

                  {/* 3. 🟡 පරණ බඩු විකුණුම් පේළිය (Old Stock Row) */}
                  {item.oSold > 0 && (
                    <tr className="hover:bg-gray-50 text-sm text-gray-600 transition bg-amber-50/10">
                      <td className="p-4 font-bold text-gray-800 flex items-center gap-2 pl-6">
                        <span className="text-xl emoji-icon">⏳</span> {item.name.split(' (')[0]} <span className="text-xs bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">පරණ</span>
                      </td>
                      <td className="p-4 text-gray-400 font-medium">Rs. 0/=</td>
                      <td className="p-4 text-amber-600 font-bold">Rs. {item.oldPrice}/=</td>
                      {/* 👈 🆕 නිවැරදි කළ කොටස: උදේ Old opening සහ ගණනය කළ oldClosing වෙන වෙනම පෙන්වයි */}
                      <td className="p-4 font-medium text-blue-600">{item.oldOpening} KG</td>
                      <td className="p-4 font-bold text-slate-600">{item.oldClosing} KG</td>
                      <td className="p-4 font-bold text-emerald-600">{item.oSold} KG</td>
                      <td className="p-4 text-right font-semibold">Rs. {item.oldRevenue}/=</td>
                      <td className="p-4 text-right font-bold text-blue-600">Rs. {item.oldProfit}/=</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {/* මුළු එකතු සාරාංශ පේළි */}
              <tr className="bg-slate-50 font-bold text-gray-800 border-t-2 row-total">
                <td colSpan="5" className="p-4 text-right text-sm">එළවළු විකුණුම් මුළු එකතුව:</td>
                <td className="p-4 text-right text-lg text-gray-900">Rs. {computedTotalRevenue}/=</td>
                <td className="p-4 text-right text-lg text-blue-600">Rs. {computedTotalProfit}/=</td>
              </tr>
              <tr className="bg-amber-50/50 font-bold text-amber-800 row-salary">
                <td colSpan="6" className="p-4 text-right text-sm">🧑‍🤝‍🧑 අඩුකල යුතු සේවක වැටුප් මුළු එකතුව:</td>
                <td className="p-4 text-right text-lg text-amber-700">Rs. {totalStaffSalaries}/=</td>
              </tr>
              <tr className="bg-red-50/40 font-bold text-red-700 row-expense">
                <td colSpan="6" className="p-4 text-right text-sm">💸 අඩුකල යුතු වෙනත් මුළු වියදම්:</td>
                <td className="p-4 text-right text-lg text-red-600">Rs. {totalOtherExpenses}/=</td>
              </tr>
              <tr className="bg-emerald-50 font-black text-emerald-900 border-t-2 border-emerald-500 row-net-profit">
                <td colSpan="6" className="p-4 text-right text-base uppercase">💰 දවසේ සැබෑ ශුද්ධ ลාභය (Actual Net Profit):</td>
                <td className="p-4 text-right text-2xl text-emerald-700 bg-emerald-100">Rs. {actualNetProfit}/=</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, .no-print, button, .emoji-icon { display: none !important; }
          body { background-color: #ffffff !important; color: #000000 !important; padding: 0 !important; font-family: sans-serif !important; }
          .print-section { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; }
          .report-title { color: #000000 !important; font-size: 16pt !important; font-weight: bold !important; }
          .printable-table { width: 100% !important; border-collapse: collapse !important; color: #000000 !important; }
          .printable-table th, .printable-table td { border: 1px solid #666666 !important; padding: 8px !important; font-size: 10pt !important; background-color: transparent !important; color: #000000 !important; }
          .printable-table th { background-color: #f2f2f2 !important; font-weight: bold !important; }
          .row-total td, .row-salary td, .row-expense td, .row-net-profit td { background-color: transparent !important; font-weight: bold !important; color: #000000 !important; }
          .row-net-profit td { font-size: 12pt !important; border-top: 2px double #000000 !important; }
          @page { size: A4 landscape; margin: 15mm 10mm 15mm 10mm; }
        }
      `}} />
    </div>
  );
}