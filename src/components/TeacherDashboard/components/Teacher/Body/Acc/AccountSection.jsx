import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, X } from 'lucide-react';
import './AccountSection.css';

const API_BASE_URL = 'http://localhost:5000';

const AccountSection = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    nom_filiere: '',
  });
  const [filiereOptions, setFiliereOptions] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`);
        const data = await response.json();
        if (data && data.nom) {
          setTeacher(data);
          setFormData({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            nom_filiere: data.nom_filiere || '',
          });
        } else {
          setError("Enseignant non trouvé");
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l’enseignant :', err);
        setError("Impossible de charger les données de l’enseignant 💔");
      }
    };

    const fetchFilieres = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/filieres_niveaux`);
        const data = await response.json();
        const uniqueFilieres = [...new Set(data.map(item => item.nom_filiere))];
        setFiliereOptions(uniqueFilieres);
      } catch (err) {
        console.error("Erreur lors du chargement des filières :", err);
      }
    };

    fetchTeacherData();
    fetchFilieres();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        console.log("✅ Enseignant mis à jour :", updated);
        alert("Profil mis à jour avec succès ! 🎉");
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("❌ Erreur lors de la mise à jour :", errorData?.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error("Erreur réseau ou serveur :", error);
    }
  };

  if (error) return <div className="account-section"><p>{error}</p></div>;
  if (!teacher) return <div className="account-section"><p>Chargement du profil...</p></div>;

  return (
    <div className="account-section">
      <div className="account-header">
        <h2>Mon Compte</h2>
        <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
          Modifier le profil
        </button>
      </div>

      <div className="account-details">
        <div className="account-avatar">
          <div className="avatar-placeholder">
            <User size={40} />
          </div>
          <h3>{teacher.nom} {teacher.prenom}</h3>
        </div>

        <div className="account-info">
          <div className="info-group">
            <h4>Informations Personnelles</h4>

            <div className="info-item">
              <User size={18} />
              <div>
                <p className="info-label">Nom Complet</p>
                <p className="info-value">{teacher.nom} {teacher.prenom}</p>
              </div>
            </div>

            <div className="info-item">
              <Mail size={18} />
              <div>
                <p className="info-label">Adresse Email</p>
                <p className="info-value">{teacher.email}</p>
              </div>
            </div>
          </div>

          <div className="info-group">
            <h4>Filière(s)</h4>
            <div className="class-badges">
              {teacher.nom_filiere ? (
                <span className="class-badge">{teacher.nom_filiere}</span>
              ) : (
                <p>Aucune filière attribuée</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <button className="close-modal" onClick={() => setShowEditModal(false)}>
              <X size={18} />
            </button>
            <h3>Modifier le profil</h3>

            <label>Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
            />

            <label>Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />

            <label>Filières</label>
            <select name="nom_filiere" value={formData.nom_filiere} onChange={handleInputChange}>
              <option value="">-- Sélectionnez une filière --</option>
              {filiereOptions.map((filiere, index) => (
                <option key={index} value={filiere}>{filiere}</option>
              ))}
            </select>

            <button className="save-btn" onClick={handleSaveChanges}>Enregistrer les modifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSection;
