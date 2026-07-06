import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import MorningStock from './pages/MorningStock';
import EveningStock from './pages/EveningStock';
import MonthlyReport from './pages/MonthlyReport'; 


const vegetableList = [
  { id: 1, name: 'Carrot (කැරට්)', icon: '', bgColor: 'bg-orange-50' },
  { id: 2, name: 'Leeks (ලීක්ස්)', icon: '', bgColor: 'bg-green-50' },
  { id: 3, name: 'Potato (අල)', icon: '', bgColor: 'bg-amber-50' },
  { id: 4, name: 'Cabbage (ගෝවා)', icon: '', bgColor: 'bg-emerald-50' },
  { id: 5, name: 'Beetroot (බීට්රූට්)', icon: '', bgColor: 'bg-rose-50' },
  { id: 6, name: 'Beans (බෝංචි)', icon: '', bgColor: 'bg-green-50' },
  { id: 7, name: 'Knolkhol (නෝකෝල්)', icon: '', bgColor: 'bg-stone-50' },
  { id: 8, name: 'Radish (රාබු)', icon: '', bgColor: 'bg-slate-50' },
  { id: 9, name: 'Tomato (තක්කාලි)', icon: '', bgColor: 'bg-red-50' },
  { id: 10, name: 'Brinjal (වම්බටု)', icon: '', bgColor: 'bg-indigo-50' },
  { id: 11, name: 'Pumpkin (වට්ටක්කා)', icon: '', bgColor: 'bg-yellow-50' },
  { id: 12, name: 'Bitter Gourd (කරවිල)', icon: '', bgColor: 'bg-lime-50' },
  { id: 13, name: 'Snake Gourd (පතෝල)', icon: '', bgColor: 'bg-emerald-50' },
  { id: 14, name: 'Ridge Gourd (වැටකොළු)', icon: '', bgColor: 'bg-green-50' },
  { id: 15, name: 'Ladies Finger (බණ්ඩක්කා)', icon: '', bgColor: 'bg-green-50' },
  { id: 16, name: 'Capsicum (මාළු මිරිස්)', icon: '', bgColor: 'bg-emerald-50' },
  { id: 17, name: 'Cucumber (පිපිඤ්ඤා)', icon: '', bgColor: 'bg-emerald-50' },
  { id: 18, name: 'Drumstick (මුරුංගා)', icon: '', bgColor: 'bg-lime-50' },
  { id: 19, name: 'Big Onion (ලොකු ළූණු)', icon: '', bgColor: 'bg-purple-50' },
  { id: 20, name: 'Green Chili (අමු මිරිස්)', icon: '', bgColor: 'bg-red-50' },
];

const API_BASE_URL = 'http://localhost:5001/api/stocks';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
 
  const [stocks, setStocks] = useState(vegetableList.map(v => ({ 
    ...v, 
    opening: '', cost: '', retailPrice: '', wholesalePrice: '',
    oldOpening: 0, oldPrice: '', retailSold: '', wholesaleSold: '', oldSold: '', 
    freshClosing: '', oldClosing: '', closing: '', sold: 0, revenue: 0, profit: 0 
  })));
  
  const [dbExpenses, setDbExpenses] = useState([]); 
  const [dbSalaries, setDbSalaries] = useState([]); 

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${selectedDate}`);
        
        // ⏳ ඊයේ දවසේ Closing Stock එක ලබා ගැනීම
        const prevDateObj = new Date(selectedDate);
        prevDateObj.setDate(prevDateObj.getDate() - 1);
        const yesterdayStr = prevDateObj.toISOString().split('T')[0];
        const yesterdayResponse = await axios.get(`${API_BASE_URL}/${yesterdayStr}`);
        const yesterdayData = yesterdayResponse.data.success ? yesterdayResponse.data.data : [];

        if (response.data.success && response.data.data.length > 0) {
          const dbData = response.data.data;
          setDbExpenses(dbData[0]?.otherExpenses || []);
          setDbSalaries(dbData[0]?.staffSalaries || []);

          const mergedStocks = vegetableList.map(veg => {
            const found = dbData.find(d => d.vegetableId === veg.id);
            const yestFound = yesterdayData.find(y => y.vegetableId === veg.id);
            
            return {
              ...veg,
              cost: found ? found.cost : '',
              retailPrice: found ? found.retailPrice : '',
              wholesalePrice: found ? found.wholesalePrice : '',
              opening: found ? (found.opening || '') : '',
              oldOpening: found ? (found.oldOpening || 0) : (yestFound?.closing || 0), 
              oldPrice: found ? (found.oldPrice || '') : '',
              retailSold: found ? (found.retailSold || '') : '',
              wholesaleSold: found ? (found.wholesaleSold || '') : '',
              oldSold: found ? (found.oldSold || '') : '',
              freshClosing: found ? (found.freshClosing || '') : '',
              oldClosing: found ? (found.oldClosing || '') : '',
              closing: found ? (found.closing || '') : '',
              sold: found ? found.sold : 0,
              revenue: found ? found.revenue : 0,
              profit: found ? found.profit : 0
            };
          });
          setStocks(mergedStocks);
        } else {
          // 👈 🔥 අලුත් දවසක් නම් (Database හි දත්ත නැත්නම්) ඊයේ ඉතිරි බර හැර අනිත් සියලුම මිල ගණන් සහ බරවල් "" (Blank) කරයි!
          const freshStocks = vegetableList.map(veg => {
            const yestFound = yesterdayData.find(y => y.vegetableId === veg.id);
            return {
              ...veg, 
              opening: '', cost: '', retailPrice: '', wholesalePrice: '',
              oldOpening: yestFound?.closing || 0, // 👈 ඊයේ ඉතිරි වූ බර පමණක් ඔටෝම පැමිණේ (නැත්නම් 0 වේ)
              oldPrice: '', 
              retailSold: '', wholesaleSold: '', oldSold: '', 
              freshClosing: '', oldClosing: '', closing: '', sold: 0, revenue: 0, profit: 0
            };
          });
          setStocks(freshStocks);
          setDbExpenses([]);
          setDbSalaries([]); 
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchStockData();
  }, [selectedDate]);

  const handleCostChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, cost: val } : item));
  const handleRetailPriceChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, retailPrice: val } : item));
  const handleWholesalePriceChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, wholesalePrice: val } : item));
  const handleOpeningChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, opening: val } : item));
  
  const handleRetailSoldChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, retailSold: val } : item));
  const handleWholesaleSoldChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, wholesaleSold: val } : item));
  const handleOldSoldChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, oldSold: val } : item));

  const handleOldOpeningChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, oldOpening: val } : item));
  const handleOldPriceChange = (id, val) => setStocks(stocks.map(item => item.id === id ? { ...item, oldPrice: val } : item));

  const saveMorningDataToDB = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/morning`, { date: selectedDate, stocks });
      if (response.data.success) {
        alert("උדෑසන තොග සහ මිල ගණන් සාර්ථකව සුරකින ලදී!");
        return true;
      }
    } catch (error) {
      alert("Error: " + error.message);
      return false;
    }
  };

  const calculateAndSaveSales = async (cleanExpenses, cleanSalaries, actualNetProfit) => {
    let isValid = true;
    const updatedStocks = stocks.map(item => {
      const freshOpen = parseFloat(item.opening) || 0;
      const oldOpen = parseFloat(item.oldOpening) || 0;
      const rSold = parseFloat(item.retailSold) || 0;
      const wSold = parseFloat(item.wholesaleSold) || 0;
      const oSold = parseFloat(item.oldSold) || 0;

      if ((rSold + wSold) > freshOpen || oSold > oldOpen) {
        alert(`${item.name} වල විකුණූ ප්‍රමාණය උදේ තිබූ තොගයට වඩා වැඩි විය නොහැක!`);
        isValid = false;
        return item;
      }

      const freshClose = freshOpen - (rSold + wSold);
      const oldClose = oldOpen - oSold;
      const totalClose = freshClose + oldClose;

      const rPrice = parseFloat(item.retailPrice) || 0;
      const wPrice = parseFloat(item.wholesalePrice) || 0;
      const oPrice = parseFloat(item.oldPrice) || 0;
      const cost = parseFloat(item.cost) || 0;

      const totalRevenue = (rSold * rPrice) + (wSold * wPrice) + (oSold * oPrice);
      const totalProfit = (rSold * (rPrice - cost)) + (wSold * (wPrice - cost)) + (oSold * oPrice);

      return {
        ...item,
        freshClosing: freshClose,
        oldClosing: oldClose,
        closing: totalClose,
        sold: rSold + wSold + oSold,
        revenue: totalRevenue,
        profit: totalProfit
      };
    });

    if (!isValid) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/evening`, {
        date: selectedDate,
        stocks: updatedStocks,
        otherExpenses: cleanExpenses, 
        staffSalaries: cleanSalaries, 
        actualNetProfit: actualNetProfit 
      });
      if (response.data.success) {
        alert("සන්ධ්‍යාවේ අවසාන වාර්තාව සාර්ථකව සේව් කරන ලදී!");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const totalDayRevenue = stocks.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalDayProfit = stocks.reduce((sum, item) => sum + (item.profit || 0), 0);

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 font-sans antialiased">
        <nav className="bg-gradient-to-r from-green-700 to-emerald-800 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center px-8 gap-4">
          <div>
            <h1 className="text-2xl font-black">VEG-POS SYSTEM</h1>
            <p className="text-xs text-green-200">සිල්ලර, තොග සහ පරණ බඩු මිල ගණන් 3ක් පාලනය</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs font-bold text-green-100">වැඩ කරන දිනය:</span>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-emerald-900 text-white font-bold p-1 rounded-md text-sm outline-none border border-emerald-600" />
          </div>
          <div className="flex space-x-2 bg-black/10 p-1.5 rounded-xl border border-white/10">
            <Link to="/" className="px-4 py-2 rounded-lg font-bold text-xs text-white hover:bg-white/10">Home (Morning)</Link>
            <Link to="/evening" className="px-4 py-2 rounded-lg font-bold text-xs text-white hover:bg-white/10">Evening Page</Link>
            <Link to="/monthly" className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-black text-xs shadow-md">මාසික වාර්තාව</Link>
          </div>
        </nav>

        <div className="p-6 max-w-[1300px] mx-auto">
          <Routes>
            <Route path="/" element={
              <MorningStock 
                stocks={stocks} selectedDate={selectedDate} 
                handleCostChange={handleCostChange} 
                handleRetailPriceChange={handleRetailPriceChange}       
                handleWholesalePriceChange={handleWholesalePriceChange} 
                handleOpeningChange={handleOpeningChange} 
                handleOldOpeningChange={handleOldOpeningChange} 
                handleOldPriceChange={handleOldPriceChange}
                saveMorningDataToDB={saveMorningDataToDB}
              />
            } />
            <Route path="/evening" element={
              <EveningStock 
                stocks={stocks} selectedDate={selectedDate} 
                handleRetailSoldChange={handleRetailSoldChange}       
                handleWholesaleSoldChange={handleWholesaleSoldChange} 
                handleOldSoldChange={handleOldSoldChange}             
                calculateSales={calculateAndSaveSales} 
                totalDayRevenue={totalDayRevenue} 
                totalDayProfit={totalDayProfit} 
                dbExpenses={dbExpenses} dbSalaries={dbSalaries} 
              />
            } />
            <Route path="/monthly" element={<MonthlyReport API_BASE_URL={API_BASE_URL} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;