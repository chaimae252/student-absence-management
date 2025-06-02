import React from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  UserCheck, 
  Mail, 
  PieChart, 
  Settings,
  Home,
  LogOut
} from 'lucide-react';
import './Dashboard.css';

const Sidebar = () => {
  const navigate = useNavigate();

    const handleLogout = () => {
      // If you stored a token or admin data in localStorage/sessionStorage, clear it
      localStorage.clear(); // or sessionStorage.clear()

      // Redirect to landing page
      navigate("/");
    };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id"); // <-- now you got the admin id!
  return (
    <div className="sidebarr">
      <div className="logo-container">
        <img src={require("../../assets/images/logoEstNew.png")} alt="Ibn Tofail University" />
      </div>
      
      <nav className="nav-items">
        <NavLink to={`/admin-dashboard?id=${id}`} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Tableau de Bord</span>
        </NavLink>

        <NavLink to={`/admin-dashboard/injection?id=${id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileSpreadsheet size={20} />
          <span>Injection des listes</span>
        </NavLink>

        <NavLink to={`/admin-dashboard/attendance?id=${id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserCheck size={20} />
          <span>Enregistrement d'Absence</span>
        </NavLink>

        <NavLink to={`/admin-dashboard/mail?id=${id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Mail size={20} />
          <span>Envoi des Mails</span>
        </NavLink>

        <NavLink to={`/admin-dashboard/rapports?id=${id}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileSpreadsheet size={20} />
          <span>Rapport des Absences</span>
        </NavLink>
        <div className="nav-separator"></div>

      

        <button className="nav-item logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
