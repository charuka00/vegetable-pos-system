import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SalaryReport() {
  const [employeeName, setEmployeeName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Format: YYYY-MM
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [loading, setLoading] = useState(false);

  // 👈 API Base URL එක App.jsx එකේ රටාවටම සකස් කරන ලදී
  const API_URL = 'http://localhost:5001/api/stocks/salaries/summary';

  const fetchSalarySummary = async () => {
    if (!employeeName.trim()) {
      setSalaryHistory([]);
      setTotalSalary(0);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: { 
          employeeName: employeeName.trim(), 
          month: selectedMonth 
        }
      });
      if (response.data.success) {
        setSalaryHistory(response.data.history || []);
        setTotalSalary(response.data.totalSalary || 0);
      } else {
        setSalaryHistory([]);
        setTotalSalary(0);
      }
    } catch (error) {
      console.error("Error fetching salary history:", error);
      setSalaryHistory([]);
      setTotalSalary(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSalarySummary();
  }, [selectedMonth, employeeName]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-indigo-600 mb-6 border-b pb-3 text-center">
          සේවක මාසික පඩි වාර්තාව (Staff Monthly Salary Report)
        </h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 text-xs font-bold text-gray-500">
          <div>
            <span className="block mb-2 uppercase tracking-wider">සේවකයාගේ නම (Employee Name)</span>
            <input 
              type="text" 
              placeholder="නම ටයිප් කරන්න..." 
              value={employeeName} 
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full p-3 font-black text-gray-800 border rounded-xl bg-slate-50 outline-none focus:border-indigo-500 text-sm shadow-inner"
            />
          </div>
          <div>
            <span className="block mb-2 uppercase tracking-wider">මාසය තෝරන්න (Select Month)</span>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 font-black text-gray-800 border rounded-xl bg-slate-50 outline-none focus:border-indigo-500 text-sm shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Report Summary Display Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-6 text-gray-400 font-bold">දත්ත ලබාගනිමින් පවතී...</div>
        ) : salaryHistory.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-gray-700 text-xs font-semibold border-b">
                    <th className="p-4">වැඩ කල දිනය (Date)</th>
                    <th className="p-4 text-right">එදින ලබාගත් වැටුප (Wages)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {salaryHistory.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-mono">{item.date}</td>
                      <td className="p-4 text-right font-black text-emerald-600">Rs. {item.wages}/=</td>
                    </tr>
                  ))}
                  
                  {/* Grand Total Row */}
                  <tr className="bg-emerald-50 font-black text-emerald-900 border-t-2 border-emerald-500">
                    <td className="p-4 uppercase tracking-wider">මුළු මාසික පඩිය (Total Salary):</td>
                    <td className="p-4 text-right text-xl text-emerald-700 bg-emerald-100">Rs. {totalSalary}/=</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 font-bold">
            තෝරාගත් සේවකයා හෝ මාසය සඳහා කිසිදු පඩි විස්තරයක් හමුනොවීය.
          </div>
        )}
      </div>
    </div>
  );
}