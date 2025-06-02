import { useState, useEffect, useMemo } from 'react';
import { UserCheck, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminAttendance.css';

const API_BASE_URL = 'http://localhost:5000';

const AdminAttendance = () => {
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(5);

  const [studentsAbsence, setStudentsAbsence] = useState([]);

  const uniqueFilieres = useMemo(() => {
    return [...new Set(filieres.map(item => item.nom_filiere))];
  }, [filieres]);

  const niveauxForFiliere = useMemo(() => {
    if (!selectedFiliere) return [];
    return filieres
      .filter(item => item.nom_filiere === selectedFiliere)
      .map(item => item.nom_niveau);
  }, [selectedFiliere, filieres]);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/filieres_niveaux`)
      .then(response => response.json())
      .then(data => {
        setFilieres(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching filieres and niveaux:', err);
        setError('Erreur lors du chargement des filières et niveaux');
        setLoading(false);
      });
  }, []);

  const loadStudents = () => {
    if (!selectedFiliere || !selectedNiveau) {
      setError('Veuillez sélectionner une filière et un niveau');
      return;
    }

    setError('');
    setSuccess(false);
    setCurrentPage(1);

    setLoading(true);
    fetch(`${API_BASE_URL}/api/etudiants?filiere=${selectedFiliere}&niveau=${selectedNiveau}`)
      .then(response => response.json())
      .then(data => {
        setStudents(data);
        setStudentsAbsence(data.map(student => ({
          id_etudiant: student.id_etudiant,
          absent: false,
          justification: '',
          hours_absent: 0
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching students:', err);
        setError('Erreur lors du chargement des étudiants');
        setLoading(false);
      });
  };

  const handleAbsenceToggle = (id_etudiant) => {
    setStudentsAbsence(prev => 
      prev.map(item => 
        item.id_etudiant === id_etudiant 
          ? { ...item, absent: !item.absent } 
          : item
      )
    );
  };

  const handleJustificationChange = (id_etudiant, justification) => {
    setStudentsAbsence(prev => 
      prev.map(item => 
        item.id_etudiant === id_etudiant 
          ? { ...item, justification } 
          : item
      )
    );
  };

  const handleStudentsPerPageChange = (e) => {
    setStudentsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const submitAbsences = async () => {
    if (!date) {
      setError('Veuillez sélectionner une date');
      return;
    }
  
    const absencesToSubmit = studentsAbsence
      .filter(item => item.absent)
      .map(item => ({
        id_etudiant: item.id_etudiant,
        date_absence: date,
        justification: item.justification,
        hours_absent: item.hours_absent || 0
      }));
  
    if (absencesToSubmit.length === 0) {
      setError('Aucune absence à enregistrer');
      return;
    }
  
    setError('');
    setSuccess(false);
    setLoading(true);
  
    try {
      console.log('Submitting absences:', absencesToSubmit);
      const response = await fetch(`${API_BASE_URL}/api/absences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ absences: absencesToSubmit }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement des absences');
      }
  
      const data = await response.json();
      console.log('Response from backend:', data);
      setSuccess(true);
      setStudentsAbsence(studentsAbsence.map(item => ({
        ...item,
        absent: false,
        justification: ''
      })));
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting absences:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement des absences');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-attendance">
    <div className="attendance-container">
      <div className="conten-header">
        <div className="heade-left">
          <div className="heade-title">
            <h2>Enregistrement d'Absence</h2>
            <p className="header-subtitle">Gestion des absences des étudiants</p>
          </div>
        </div>
      </div>

      <div className="selection-card">
        <div className="car-header">
          <h3 className="car-title">Sélection de la classe</h3>
        </div>
        <div className="car-content">
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="filiere">Filière</label>
              <select 
                id="filiere" 
                value={selectedFiliere} 
                onChange={(e) => {
                  setSelectedFiliere(e.target.value);
                  setSelectedNiveau('');
                }}
                className="select-input"
              >
                <option value="">Sélectionner une filière</option>
                {uniqueFilieres.map(filiere => (
                  <option key={filiere} value={filiere}>{filiere}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="niveau">Niveau</label>
              <select 
                id="niveau" 
                value={selectedNiveau} 
                onChange={(e) => setSelectedNiveau(e.target.value)}
                disabled={!selectedFiliere}
                className="select-input"
              >
                <option value="">Sélectionner un niveau</option>
                {niveauxForFiliere.map(niveau => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>

            <button 
              className="primary-button" 
              onClick={loadStudents}
              disabled={!selectedFiliere || !selectedNiveau}
            >
              <UserCheck size={20} />
              Charger les étudiants
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          Absences enregistrées avec succès
        </div>
      )}

      {students.length > 0 && (
        <div className="student-list-card mt-4">
          <div className="card-header">
            <h3 className="card-title">Liste des étudiants - {selectedFiliere} {selectedNiveau}</h3>
            <div className="date-picker-container">
              <label htmlFor="date-absence">Date d'absence:</label>
              <input 
                type="date" 
                id="date-absence" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="date-input"
                required
              />
              <button 
                className="primary-button submit-button" 
                onClick={submitAbsences}
                disabled={loading}
              >
                {loading 
                  ? 'Chargement...' 
                  : success 
                    ? 'Bien enregistré' 
                    : 'Enregistrer les absences'}
              </button>
            </div>
          </div>

          <div className="card-content">
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Absence</th>
                    <th>Heures d'absence</th>
                    <th>Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student) => {
                    const absenceRecord = studentsAbsence.find(item => item.id_etudiant === student.id_etudiant);
                    const isAbsent = absenceRecord ? absenceRecord.absent : false;
                    const justification = absenceRecord ? absenceRecord.justification : '';

                    return (
                      <tr key={student.id_etudiant} className={isAbsent ? 'absent-row' : ''}>
                        <td>{student.nom}</td>
                        <td>{student.prenom}</td>
                        <td>{student.email}</td>
                        <td>{student.telephone}</td>
                        <td>
                          <label className="checkbox-container">
                            <input 
                              type="checkbox" 
                              checked={isAbsent} 
                              onChange={() => handleAbsenceToggle(student.id_etudiant)}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={absenceRecord ? absenceRecord.hours_absent : 0}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setStudentsAbsence(prev => 
                                prev.map(item =>
                                  item.id_etudiant === student.id_etudiant
                                    ? { ...item, hours_absent: isNaN(value) ? 0 : value }
                                    : item
                                )
                              );
                            }}
                            className="hours-input"
                            placeholder="Heures"
                          />
                        </td>
                        <td>
                          <input 
                            type="text"
                            value={justification}
                            onChange={(e) => handleJustificationChange(student.id_etudiant, e.target.value)}
                            placeholder="Justification (facultatif)"
                            className="justification-input"
                            disabled={!isAbsent}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <button 
                onClick={prevPage}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button 
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                <ChevronRight size={20} />
              </button>

              <select 
                value={studentsPerPage}
                onChange={handleStudentsPerPageChange}
                className="select-input ml-4"
              >
                <option value={5}>5 par page</option>
                <option value={10}>10 par page</option>
                <option value={20}>20 par page</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminAttendance;
