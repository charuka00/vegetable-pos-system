import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MorningStock from './pages/MorningStock';
import EveningStock from './pages/EveningStock';

const vegetableList = [
  // --- උඩරට එළවළු (Up-Country Vegetables) ---
  { id: 1, name: 'Carrot (කැරට්)', price: 320, cost: 250, icon: '🥕', bgColor: 'bg-orange-50' },
  { id: 2, name: 'Leeks (ලීක්ස්)', price: 280, cost: 200, icon: '🥬', bgColor: 'bg-green-50' },
  { id: 3, name: 'Potato (අල)', price: 240, cost: 170, icon: '🥔', bgColor: 'bg-amber-50' },
  { id: 4, name: 'Cabbage (ගෝවා)', price: 200, cost: 140, icon: '🥦', bgColor: 'bg-emerald-50' },
  { id: 5, name: 'Beetroot (බීට්රූට්)', price: 300, cost: 220, icon: '🍠', bgColor: 'bg-rose-50' },
  { id: 6, name: 'Beans (බෝංචි)', price: 360, cost: 280, icon: '🌱', bgColor: 'bg-green-50' },
  { id: 7, name: 'Knolkhol (නෝකෝල්)', price: 190, cost: 130, icon: '🧅', bgColor: 'bg-stone-50' },
  { id: 8, name: 'Radish (රාබු)', price: 140, cost: 90, icon: '🥕', bgColor: 'bg-slate-50' },

  // --- පහතරට එළවළු (Low-Country Vegetables) ---
  { id: 9, name: 'Tomato (තක්කාලි)', price: 400, cost: 300, icon: '🍅', bgColor: 'bg-red-50' },
  { id: 10, name: 'Brinjal (වම්බටု)', price: 260, cost: 190, icon: '🍆', bgColor: 'bg-indigo-50' },
  { id: 11, name: 'Pumpkin (වට්ටක්කා)', price: 150, cost: 90, icon: '🎃', bgColor: 'bg-yellow-50' },
  { id: 12, name: 'Bitter Gourd (කරවිල)', price: 320, cost: 240, icon: '🥒', bgColor: 'bg-lime-50' },
  { id: 13, name: 'Snake Gourd (පතෝල)', price: 220, cost: 150, icon: '🥒', bgColor: 'bg-emerald-50' },
  { id: 14, name: 'Ridge Gourd (වැටකොළු)', price: 240, cost: 170, icon: '🥖', bgColor: 'bg-green-50' },
  { id: 15, name: 'Ladies Finger (බණ්ඩක්කා)', price: 180, cost: 120, icon: '🌱', bgColor: 'bg-green-50' },
  { id: 16, name: 'Capsicum (මාළු මිරිස්)', price: 450, cost: 350, icon: '🫑', bgColor: 'bg-emerald-50' },
  { id: 17, name: 'Cucumber (පිපිඤ්ඤා)', price: 140, cost: 90, icon: '🥒', bgColor: 'bg-emerald-50' },
  { id: 18, name: 'Drumstick (මුරුංගා)', price: 380, cost: 280, icon: '🎋', bgColor: 'bg-lime-50' },

  // --- ළූණු සහ අමුද්‍රව්‍ය (Onions & Others) ---
  { id: 19, name: 'Big Onion (ලොකු ළූණු)', price: 180, cost: 130, icon: '🧅', bgColor: 'bg-purple-50' },
  { id: 20, name: 'Green Chili (අමු මිරිස්)', price: 600, cost: 450, icon: '🌶️', bgColor: 'bg-red-50' },
];

function App() {
  // වර්තමාන දිනය (YYYY-MM-DD) Default ලෙස ලබා ගැනීම
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stocks, setStocks] = useState(vegetableList.map(v => ({ ...v, opening: '', closing: '', sold: 0, revenue: 0, profit: 0 })));

  const handleCostChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, cost: val } : item));
  const handlePriceChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, price: val } : item));
  const handleOpeningChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, opening: val } : item));
  const handleClosingChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, closing: val } : item));

  const calculateSales = () => {
    const updatedStocks = stocks.map(item => {
      const open = parseFloat(item.opening) || 0;
      const close = parseFloat(item.closing) || 0;
      const price = parseFloat(item.price) || 0;
      const cost = parseFloat(item.cost) || 0;

      if (close > open) {
        alert(`⚠️ ${item.name} වල ඉතුරු stock එක උදේ stock එකට වඩා වැඩි විය නොහැක!`);
        return item;
      }
      
      const soldQty = open - close;
      const revenue = soldQty * price;
      const profit = soldQty * (price - cost);

      return { ...item, sold: soldQty, revenue, profit };
    });
    setStocks(updatedStocks);
  };

  const totalDayRevenue = stocks.reduce((sum, item) => sum + item.revenue, 0);
  const totalDayProfit = stocks.reduce((sum, item) => sum + item.profit, 0);

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 font-sans antialiased">
        
        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r from-green-700 to-emerald-800 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center px-8 gap-4">
          <div>
            <h1 className="text-2xl font-black">🟢 VEG-POS SYSTEM</h1>
            <p className="text-xs text-green-200">දිනපතා තොග සහ ශුද්ධ ලාභ පාලනය</p>
          </div>

          {/* ================= 📅 DATE CONTROLLER ================= */}
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs font-bold text-green-100">වැඩ කරන දිනය:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-emerald-900 text-white font-bold p-1 rounded-md text-sm outline-none border border-emerald-600 focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="flex space-x-2 bg-black/10 p-1.5 rounded-xl border border-white/10">
            <Link to="/" className="px-5 py-2 rounded-lg font-bold text-xs text-white">☀️ Home (Morning)</Link>
            <Link to="/evening" className="px-5 py-2 rounded-lg font-bold text-xs text-white">🌙 Evening Page</Link>
          </div>
        </nav>

        {/* Routes Content */}
        <div className="p-6 max-w-[1300px] mx-auto">
          <Routes>
            <Route path="/" element={<MorningStock stocks={stocks} selectedDate={selectedDate} handleCostChange={handleCostChange} handlePriceChange={handlePriceChange} handleOpeningChange={handleOpeningChange} />} />
            <Route path="/evening" element={<EveningStock stocks={stocks} selectedDate={selectedDate} handleClosingChange={handleClosingChange} calculateSales={calculateSales} totalDayRevenue={totalDayRevenue} totalDayProfit={totalDayProfit} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;