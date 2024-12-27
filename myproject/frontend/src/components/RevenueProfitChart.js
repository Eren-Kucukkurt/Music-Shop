import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';
import './RevenueProfitChart.css';

const RevenueProfitChart = () => {
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/revenue-profit-analysis/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { start_date: startDate, end_date: endDate },
      });

      setChartData(response.data.revenue_by_date);
      setTotalRevenue(response.data.total_revenue);
      setTotalProfit(response.data.total_profit);
      setTotalRefunds(response.data.total_refunds || 0); // Add refunds data
    } catch (err) {
      setError('Failed to fetch revenue and profit data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically fetch data for the current year on initial load
    const currentYear = new Date().getFullYear();
    setStartDate(`${currentYear}-01-01`);
    setEndDate(`${currentYear}-12-31`);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') setStartDate(value);
    if (name === 'endDate') setEndDate(value);
  };

  return (
    <div className="revenue-profit-chart">
      <h1>Revenue, Profit, and Refund Analysis</h1>
      {loading ? (
        <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 3 }}>
        Loading data...
      </Typography>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {/* Summary Section */}
          <div className="summary-section">
            <p><strong>Total Revenue:</strong> ${totalRevenue.toFixed(2)}</p>
            <p><strong>Total Profit:</strong> ${totalProfit.toFixed(2)}</p>
            <p><strong>Total Refunds:</strong> ${totalRefunds.toFixed(2)}</p>
          </div>

          {/* Date Range Picker */}
          <div className="date-picker-section">
            <label>
              Start Date:
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
              />
            </label>
            <button onClick={fetchData}>Refresh</button>
          </div>

          {/* Responsive Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
              <Line type="monotone" dataKey="refunds" stroke="#ff7300" /> {/* Refund line */}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default RevenueProfitChart;
