import React, { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import './TopSection.css';

const API_BASE_URL = 'http://localhost:5000';

const TopSection = () => {
  const { id } = useParams(); // 🔑 Récupère l'ID depuis l'URL
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`);
        const data = await response.json();
        console.log("Données brutes du professeur reçues :", data); // 🧠 Debug
        if (data && data.nom) {
          setTeacher(data);
        } else {
          setError("Professeur introuvable");
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du professeur :', err);
        setError("Impossible de charger les infos du professeur 🥲");
      }
    };

    fetchTeacher();
  }, [id]);

  return (
    <div className="top-section">
      <div className="top-section-left">
        <h1 className="top-section-title">Tableau de bord Enseignant</h1>
      </div>

      <div className="top-section-right">
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>

          {teacher ? (
            <div className="user-info">
              <p className="user-name">{teacher.nom} {teacher.prenom}</p>
              <p className="user-role">{teacher.specialite || 'Enseignant'}</p>
            </div>
          ) : (
            <div className="user-info">
              <p className="user-name">{error || 'Chargement...'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopSection;
