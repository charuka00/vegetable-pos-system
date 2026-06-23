import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
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
  { id: 10, name: 'Brinjal (වම්බටු)', price: 260, cost: 190, icon: '🍆', bgColor: 'bg-indigo-50' },
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

const API_BASE_URL = 'http://localhost:5001/api/stocks';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stocks, setStocks] = useState(vegetableList.map(v => ({ ...v, opening: '', closing: '', sold: 0, revenue: 0, profit: 0 })));

  // 1. දවස මාරු කරද්දී Backend එකෙන් පරණ දත්ත තියෙනවා නම් Fetch කරගන්නා ලොජික් එක
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${selectedDate}`);
        if (response.data.success && response.data.data.length > 0) {
          // ඩේටාබේස් එකේ දත්ත තිබ්බොත් ඒවා ස්ටේට් එකට සෙට් කරනවා
          const dbData = response.data.data;
          const mergedStocks = vegetableList.map(veg => {
            const found = dbData.find(d => d.vegetableId === veg.id);
            return found ? {
              ...veg,
              cost: found.cost,
              price: found.price,
              opening: found.opening || '',
              closing: found.closing || '',
              sold: found.sold || 0,
              revenue: found.revenue || 0,
              profit: found.profit || 0
            } : { ...veg, opening: '', closing: '', sold: 0, revenue: 0, profit: 0 };
          });
          setStocks(mergedStocks);
        } else {
          // දත්ත නැත්නම් හිස් කරනවා (අලුත් දවසක් නම්)
          setStocks(vegetableList.map(v => ({ ...v, opening: '', closing: '', sold: 0, revenue: 0, profit: 0 })));
        }
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      }
    };

    fetchStockData();
  }, [selectedDate]);

  const handleCostChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, cost: val } : item));
  const handlePriceChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, price: val } : item));
  const handleOpeningChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, opening: val } : item));
  const handleClosingChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, closing: val } : item));

  // 2. උදෑසන තොගය ඩේටාබේස් එකට සේව් කරන API Call එක
  const saveMorningDataToDB = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/morning`, {
        date: selectedDate,
        stocks: stocks
      });
      if (response.data.success) {
        alert("☀️ උදෑසන තොග සහ මිල ගණන් Database එකට සාර්ථකව සේව් කරන ලදී!");
        return true;
      }
    } catch (error) {
      alert("Error saving morning data: " + error.message);
      return false;
    }
  };

  // 3. සන්ධ්‍යාවේ තොගය ගණනය කර ඩේටාබේස් එකට සේව් කරන API Call එක
  const calculateAndSaveSales = async () => {
    // පළමුව ෆ්‍රොන්ට්එන්ඩ් එකේ කැල්කියුලේෂන් එක කරගන්නවා
    let isValid = true;
    const updatedStocks = stocks.map(item => {
      const open = parseFloat(item.opening) || 0;
      const close = parseFloat(item.closing) || 0;
      const price = parseFloat(item.price) || 0;
      const cost = parseFloat(item.cost) || 0;

      if (close > open) {
        alert(`⚠️ ${item.name} වල ඉතුරු stock එක උදේ stock එකට වඩා වැඩි විය නොහැක!`);
        isValid = false;
        return item;
      }
      
      const soldQty = open - close;
      return { ...item, sold: soldQty, revenue: soldQty * price, profit: soldQty * (price - cost) };
    });

    if (!isValid) return;

    setStocks(updatedStocks);

    try {
      // කැල්කියුලේට් කරපු ගමන් බැකෙන්ඩ් එකට යවනවා
      const response = await axios.post(`${API_BASE_URL}/evening`, {
        date: selectedDate,
        stocks: updatedStocks
      });
      if (response.data.success) {
        alert("🌙 සන්ධ්‍යාවේ ඉතිරි තොගය සහ දවසේ අවසාන වාර්තාව සාර්ථකව සේව් කරන ලදී!");
      }
    } catch (error) {
      alert("Error saving evening data: " + error.message);
    }
  };

  const totalDayRevenue = stocks.reduce((sum, item) => sum + item.revenue, 0);
  const totalDayProfit = stocks.reduce((sum, item) => sum + item.profit, 0);

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 font-sans antialiased">
        <nav className="bg-gradient-to-r from-green-700 to-emerald-800 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center px-8 gap-4">
          <div>
            <h1 className="text-2xl font-black">🟢 VEG-POS SYSTEM</h1>
            <p className="text-xs text-green-200">දිනපතා උදේ / හවස තොග සහ ශුද්ධ ලාභ පාලනය</p>
          </div>

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

        <div className="p-6 max-w-[1300px] mx-auto">
          <Routes>
            <Route path="/" element={
              <MorningStock 
                stocks={stocks} 
                selectedDate={selectedDate} 
                handleCostChange={handleCostChange} 
                handlePriceChange={handlePriceChange} 
                handleOpeningChange={handleOpeningChange}
                saveMorningDataToDB={saveMorningDataToDB} // ප්‍රොප් එකක් ලෙස යවනවා
              />
            } />
            <Route path="/evening" element={
              <EveningStock 
                stocks={stocks} 
                selectedDate={selectedDate} 
                handleClosingChange={handleClosingChange} 
                calculateSales={calculateAndSaveSales} // අපේ අලුත් API function එක දෙනවා
                totalDayRevenue={totalDayRevenue} 
                totalDayProfit={totalDayProfit} 
              />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;