import React from 'react';
import './sidebar.scss';
import logo from '../../../assets/images/logoEstNew.png';
import { MdSpaceDashboard } from 'react-icons/md'; // Tableau de bord
import { FaRegCalendarCheck } from 'react-icons/fa'; // Présences
import { TbReport } from 'react-icons/tb'; // Justifications
import { FiLogOut } from 'react-icons/fi'; // Déconnexion
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ studentId }) => {
  const location = useLocation();

  if (!studentId) {
    // Gérer le cas où studentId n’est pas dispo
    return <div>Erreur : Aucun identifiant étudiant trouvé.</div>;
  }

  const handleLogout = () => {
    // Vider le stockage local
    localStorage.removeItem('studentId');
    sessionStorage.clear();

    // Rediriger vers la page de connexion ou d'accueil
    window.location.href = '/'; // ou '/login' ou '/activate' selon ton app
  };

  return (
    <div className='sideBar'>
      <div className="logoDiv flex">
        <img src={logo} alt="Logo de l'application" />
      </div>
      <div className="menu">
        <ul className="navItem">
          {/* Lien vers le tableau de bord */}
          <li className={`navList ${location.pathname === '/student-dashboard' ? 'hovered' : ''}`}>
            <Link to={`/student-dashboard?id=${studentId}`}>
              <MdSpaceDashboard className="icon" title="Tableau de bord" />
            </Link>
            Tableau de bord
          </li>

          {/* Lien vers les présences */}
          <li className={`navList ${location.pathname === '/student-dashboard/attendance' ? 'hovered' : ''}`}>
            <Link to={`/student-dashboard/attendance?id=${studentId}`}>
              <FaRegCalendarCheck className="icon" title="Présences" />
            </Link>
            Absences
          </li>

          {/* Lien vers les justifications */}
          <li className={`navList ${location.pathname === '/student-dashboard/justification' ? 'hovered' : ''}`}>
            <Link to={`/student-dashboard/justification?id=${studentId}`}>
              <TbReport className="icon" title="Justifications" />
            </Link>
            Justifications
          </li>

          {/* Lien pour se déconnecter */}
          <li className="navList">
            <Link to="#" onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}>
              <FiLogOut className="icon" title="Déconnexion" />
            </Link>
            Déconnexion
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
