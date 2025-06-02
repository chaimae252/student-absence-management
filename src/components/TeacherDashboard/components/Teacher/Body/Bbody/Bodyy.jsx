import React, { useEffect, useState } from 'react';
import './Bodyy.css';
import BottomSection from '../BottomSection/BottomSection';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

const Bodyy = () => {
  const { id } = useParams(); // 🧠 Get teacher id from URL
  const [statsData, setStatsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/dashboardd/${id}`);

        const formattedChartData = res.data.chartData.map(item => ({
          ...item,
          date: format(new Date(item.date), 'MMM d'),
        }));

        setStatsData(res.data.stats);
        setChartData(formattedChartData);
        setLoading(false);
      } catch (err) {
        setError("Échec du chargement des données du tableau de bord 😓");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [id]);

  if (loading) return <div className="dashboard-body">Chargement des données du tableau de bord... ⏳</div>;
  if (error) return <div className="dashboard-body error">{error}</div>;

  return (
    <div className="dashboard-body">
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className={`stat-cardd ${stat.color}`}>
            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
            <div className="stat-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="charts-section">
        <h3>📊 Absences récentes (5 dernières entrées)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.reverse()}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${value} absences`, 'Total']}
              labelFormatter={(label) => `Date : ${label}`}
            />
            <Bar dataKey="value" fill="#8884d8" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <BottomSection />
    </div>
  );
};

export default Bodyy;
