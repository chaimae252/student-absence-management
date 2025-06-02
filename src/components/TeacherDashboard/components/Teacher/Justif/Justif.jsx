import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // grab teacher ID
import { Search } from 'lucide-react';
import './Justif.css';

const Justif = () => {
  const { id } = useParams(); // id = teacher's id
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/no-justification/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAbsences(Array.isArray(data.absences) ? data.absences : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des absences :', err);
        setLoading(false);
      });
  }, [id]);

  const handleApprove = (id_absence) => {
    fetch(`http://localhost:5000/api/approve-justification/${id_absence}`, {
      method: 'PUT',
    })
      .then((res) => res.json())
      .then(() => {
        setAbsences((prev) => prev.filter((a) => a.id_absence !== id_absence));
      })
      .catch((err) => console.error("Erreur d'approbation :", err));
  };

  const handleReject = (id_absence) => {
    fetch(`http://localhost:5000/api/reject-justification/${id_absence}`, {
      method: 'PUT',
    })
      .then((res) => res.json())
      .then(() => {
        setAbsences((prev) => prev.filter((a) => a.id_absence !== id_absence));
      })
      .catch((err) => console.error("Erreur de rejet :", err));
  };

  const filteredAbsences = absences.filter((absence) =>
    absence.student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="justification-container">
      <div className="justification-header">
        <h2>Absences en attente de justification</h2>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom d'étudiant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Chargement des absences...</p>
      ) : filteredAbsences.length === 0 ? (
        <div className="no-justifications">
          <p>Aucune justification en attente.</p>
        </div>
      ) : (
        <div className="justification-list">
          {filteredAbsences.map((absence) => (
            <div key={absence.id_absence} className="justification-card">
              <div className="justification-card-header">
                <div className="justification-student">
                  {absence.studentname} {absence.student}
                </div>
              </div>

              <div className="justification-card-content">
                <div className="justification-detail">
                  <span className="detail-label">Date d'absence</span>
                  <span className="detail-value">{formatDate(absence.date_absence)}</span>
                </div>

                <div className="justification-detail">
                  <span className="detail-label">Justification</span>
                  <span className="detail-value">
                    {absence.justification
                      ? absence.justification
                      : 'Aucune justification fournie'}
                  </span>
                </div>

                <div className="justification-buttons">
                  <button
                    className="approve-button"
                    onClick={() => handleApprove(absence.id_absence)}
                  >
                    Approuver
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleReject(absence.id_absence)}
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Justif;
