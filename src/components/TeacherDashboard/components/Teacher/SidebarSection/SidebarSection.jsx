import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  LogOut,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import './SidebarSection.css';

const SidebarSection = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { id } = useParams(); // récupérer l'ID de l'enseignant depuis l'URL
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    // Effacer l'état d'authentification si besoin (tokens, etc.)
    // localStorage.removeItem("token"); <-- exemple
    navigate('/'); // rediriger vers la page de connexion
  };

  const basePath = `/teacher-dashboard/${id}`;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img
          src={require('../../../../../assets/images/logoEstNew.png')}
          alt="Université Ibn Tofaïl"
          className={`sidebar-logo ${collapsed ? 'hidden' : ''}`}
        />
        <button className="collapse-btn" onClick={toggleSidebar}>
          {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
      </div>

      <div className="sidebar-menu">
        <NavLink to={basePath} end className="sidebar-link" title="Tableau de bord">
          <LayoutDashboard size={20} />
          <span className={collapsed ? 'hidden' : ''}>Tableau de bord</span>
        </NavLink>

        <NavLink to={`${basePath}/attendance`} className="sidebar-link" title="Présences">
          <Calendar size={20} />
          <span className={collapsed ? 'hidden' : ''}>Absences</span>
        </NavLink>

        <NavLink to={`${basePath}/justification`} className="sidebar-link" title="Justifications">
          <FileText size={20} />
          <span className={collapsed ? 'hidden' : ''}>Justifications</span>
        </NavLink>

        <NavLink to={`${basePath}/account`} className="sidebar-link" title="Compte">
          <User size={20} />
          <span className={collapsed ? 'hidden' : ''}>Compte</span>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link" title="Déconnexion">
          <LogOut size={20} />
          <span className={collapsed ? 'hidden' : ''}>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarSection;
