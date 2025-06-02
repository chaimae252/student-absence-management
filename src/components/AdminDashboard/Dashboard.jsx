import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from 'react-router-dom';
import {
  FileSpreadsheet,
  UserCheck,
  Mail,
  Bell,
  Search,
  User,
  Filter
} from 'lucide-react';
import Sidebar from "./Sidebar";
import AdminProfileDrawer from "./AdminProfileDrawer";
import ReactCalendar from 'react-calendar';
import './d.css'; // Assuming custom fonts & styles already imported here

const API_BASE_URL = "http://localhost:5000";

const WelcomePage = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState({ rapports: 0, absences: 0, emails: 0 });
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Erreur de chargement des stats:", err));
  }, []);

  const handleDateChange = newDate => {
    setDate(newDate);
    console.log("Date sélectionnée:", newDate);
  };

  return (
    <div className="dashboard-layout">
      <div className="bdy">
        <div className="content-header">
        <div className="header-left">
          <div className="header-title">
            <h2 className="font-montserrat text-2xl font-bold">Tableau de Bord</h2>
            <p className="header-subtitle font-raleway text-sm">Vue d'ensemble de l'activité</p>
          </div>
        </div>

        <div className="header-actions">
  <div className="actions-container">
    <button className="iconnn-button" onClick={() => setShowProfile(true)}>
      <User size={20}  />
    </button>
    <div className="search-container">
      <Search size={20} />
      <input type="text" placeholder="Rechercher..." className="search-input font-raleway" />
    </div>
  </div>
</div>

        </div>

        <AdminProfileDrawer show={showProfile} onClose={() => setShowProfile(false)} />

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-title">Total des Rapports</div>
                <div className="stat-value">{stats.rapports}</div>
              </div>
              <div className="stat-icon">
                <FileSpreadsheet size={24} />
              </div>
            </div>
            <div className="stat-footer">
              <span className="trend positive">+12.5%</span>
              <span className="period">vs mois dernier</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-title">Absences ce Mois</div>
                <div className="stat-value">{stats.absences}</div>
              </div>
              <div className="stat-icon">
                <UserCheck size={24} />
              </div>
            </div>
            <div className="stat-footer">
              <span className="trend negative">+5.2%</span>
              <span className="period">vs mois dernier</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-title">Emails Envoyés</div>
                <div className="stat-value">{stats.emails}</div>
              </div>
              <div className="stat-icon">
                <Mail size={24} />
              </div>
            </div>
            <div className="stat-footer">
              <span className="trend positive">+8.1%</span>
              <span className="period">vs mois dernier</span>
            </div>
          </div>
        </div>

        <div className="calendar-section">
          <h3 className="calendar-title">Calendrier</h3>
          <ReactCalendar
            onChange={handleDateChange}
            value={date}
            className="custom-calendar"
          />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const adminId = searchParams.get('id');

  console.log("Connected admin ID:", adminId);
  return (
    <div className="dashboard-container">
      <Sidebar adminId={adminId}/>
      <div className="content">
        <Outlet context={{ adminId }} />
      </div>
    </div>
  );
};

export default Dashboard;
export { WelcomePage };
