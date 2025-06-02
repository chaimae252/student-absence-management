import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar Section/Sidebar';
import './justification.scss';
import axios from 'axios';

const Justification = () => {
  const [justifications, setJustifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get('id');

  useEffect(() => {
    const fetchJustifications = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/justifications/${studentId}`);
        setJustifications(response.data);
      } catch (error) {
        setError("Échec du chargement des justifications 😢");
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchJustifications();
    }
  }, [studentId]);

  const handleAddJustification = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAbsence(null);
    setText('');
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmitJustification = async (e) => {
    e.preventDefault();
  
    if (!selectedAbsence || !text) {
      setMessage("Veuillez sélectionner une absence et saisir une justification.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/justifications', {
        studentId,
        absenceId: selectedAbsence.id,
        reason: text
      });
  
      setMessage(response.data.message || "Justification enregistrée avec succès !");
  
      setJustifications(prevJustifications =>
        prevJustifications.map(item =>
          item.id === selectedAbsence.id
            ? { ...item, justification: text }
            : item
        )
      );
  
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      setMessage("Erreur lors de l'enregistrement de la justification.");
    }
  };

  const handleRowClick = (absence) => {
    setSelectedAbsence(absence);
  };

  return (
    <div className="justificationPage">
      <Sidebar studentId={studentId} />
      <div className="contentt">
        <h2>Mes Justifications</h2>

        {isLoading ? (
          <div className="loading">Chargement de vos justifications...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : justifications.length === 0 ? (
          <p className="no-data">Aucune justification trouvée 🧘‍♀️</p>
        ) : (
          <>
            <table className="justification-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heures</th>
                  <th>Justification</th>
                </tr>
              </thead>
              <tbody>
                {justifications.map((item) => (
                  <tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.duree}</td>
                    <td>{item.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="add-justification-section">
              <button className="add-justification-btn" onClick={handleAddJustification}>
                + Ajouter une justification
              </button>
            </div>
          </>
        )}

        {showModal && (
          <div className="add-justification-modal active">
            <div className="modal-content">
              <button className="close-btn" onClick={handleCloseModal}>×</button>
              <h3>Ajouter une justification</h3>
              <form onSubmit={handleSubmitJustification}>
                <div className="form-group">
                  <label>Sélectionnez une absence :</label>
                  <select
                    value={selectedAbsence ? selectedAbsence.id : ''}
                    onChange={(e) => {
                      const selected = justifications.find(item => item.id === parseInt(e.target.value, 10));
                      setSelectedAbsence(selected);
                    }}
                  >
                    <option value="">Choisir une absence</option>
                    {justifications.map((item) => (
                      <option key={item.id} value={item.id}>
                        {new Date(item.date).toLocaleDateString()} - {item.duree} heures
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Texte de justification :</label>
                  <textarea value={text} onChange={handleTextChange} placeholder="Entrez votre justification ici" />
                </div>

                {message && <div className="form-message">{message}</div>}

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={handleCloseModal}>Annuler</button>
                  <button type="submit" className="submit-button">Soumettre</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Justification;