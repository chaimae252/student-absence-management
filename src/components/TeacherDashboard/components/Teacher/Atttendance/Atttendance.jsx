import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, ArrowDown, User } from 'lucide-react';
import './Atttendance.css';

const API_BASE_URL = 'http://localhost:5000';

const Atttendance = () => {
  const { id } = useParams(); // 🧠 From URL
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-04-28');
  const [students, setStudents] = useState([]);
  const [studentStatus, setStudentStatus] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoadingFiliere, setIsLoadingFiliere] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      console.log("🔁 Fetching teacher with ID:", id);
      const resTeacher = await fetch(`${API_BASE_URL}/api/teachers/${id}`);
      if (!resTeacher.ok) throw new Error(`Failed to fetch teacher: ${resTeacher.status}`);
      
      const teacherData = await resTeacher.json();
      console.log("✅ Teacher data:", teacherData);

      if (teacherData && teacherData.nom_filiere) {
        setSelectedFiliere(teacherData.nom_filiere);
      } else {
        setError("Filière introuvable pour cet enseignant.");
      }

      console.log("🔁 Fetching niveaux...");
      const resNiveaux = await fetch(`${API_BASE_URL}/api/filieres_niveaux`);
      if (!resNiveaux.ok) throw new Error(`Failed to fetch niveaux: ${resNiveaux.status}`);
      const niveauxData = await resNiveaux.json();
      console.log("✅ Niveaux reçus:", niveauxData);

      setFilieres(niveauxData);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoadingFiliere(false);
    }
  };

  if (id) {
    fetchData();
  } else {
    setError("ID enseignant manquant");
    setIsLoadingFiliere(false);
  }
}, [id]);



  const niveaux = useMemo(() => {
    return filieres
      .filter(f => f.nom_filiere === selectedFiliere)
      .map(f => f.nom_niveau);
  }, [filieres, selectedFiliere]);

  const loadStudents = () => {
    if (!selectedFiliere || !selectedNiveau) {
      setError('Veuillez sélectionner une filière et un niveau');
      return;
    }

    console.log(`🔁 Loading students for filière: ${selectedFiliere}, niveau: ${selectedNiveau}`);
    fetch(`${API_BASE_URL}/api/etudiants?filiere=${selectedFiliere}&niveau=${selectedNiveau}`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur serveur lors du chargement des étudiants");
        return res.json();
      })
      .then(data => {
        console.log("✅ Étudiants reçus:", data);
        setStudents(data);
        setStudentStatus(data.map(student => ({
          id_etudiant: student.id_etudiant,
          status: 'present',
          justification: '',
          hours_absent: 0,
        })));
        setError('');
        setSuccess(false);
      })
      .catch(err => {
        console.error("❌ Erreur lors du chargement des étudiants:", err);
        setError('Erreur lors du chargement des étudiants');
      });
  };

  const updateStatus = (id, status) => {
    setStudentStatus(prev =>
      prev.map(s => s.id_etudiant === id ? { ...s, status } : s)
    );
  };

  const handleJustificationChange = (id, val) => {
    setStudentStatus(prev =>
      prev.map(s => s.id_etudiant === id ? { ...s, justification: val } : s)
    );
  };

  const handleHoursChange = (id, val) => {
    setStudentStatus(prev =>
      prev.map(s => s.id_etudiant === id ? { ...s, hours_absent: val } : s)
    );
  };

  const saveAttendance = async () => {
    if (!selectedDate) {
      setError("Veuillez choisir une date");
      return;
    }

    const attendanceRecords = studentStatus
      .filter(entry => entry.status !== 'present')
      .map(entry => ({
        id_etudiant: entry.id_etudiant,
        date_absence: selectedDate,
        justification: entry.justification || '',
        hours_absent: entry.hours_absent || 2,
      }));

    console.log("📤 Sending attendance records:", attendanceRecords);

    try {
      const res = await fetch(`${API_BASE_URL}/api/save_attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceRecords })
      });

      const result = await res.json();

      if (res.ok) {
        console.log("✅ Attendance saved successfully:", result);
        setSuccess(true);
        setError('');
      } else {
        console.error("❌ Save failed:", result);
        setError(result.message || 'Erreur lors de l\'enregistrement');
        setSuccess(false);
      }
    } catch (err) {
      console.error("❌ Network error while saving attendance:", err);
      setError('Erreur réseau');
      setSuccess(false);
    }
  };

  return (
    <div className="atttendance-container">
      <div className="atttendance-header">
        <h2>Gestion des absences</h2>
        <div className="atttendance-filters">
          <div className="filter-group">
          <label>Filière</label>
          <div className="static-filiere-display">
            <span>
              {isLoadingFiliere
                ? 'Chargement...'
                : selectedFiliere || 'Aucune filière trouvée'}
            </span>
          </div>
        </div>

          <div className="filter-group">
            <label>Niveau</label>
            <div className="select-wrapper">
              <select value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)}>
                <option value="">-- Choisir Niveau --</option>
                {niveaux.map(niv => (
                  <option key={niv} value={niv}>{niv}</option>
                ))}
              </select>
              <ArrowDown size={16} />
            </div>
          </div>

          <div className="filter-group">
            <label>Date</label>
            <div className="date-input-wrapper">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <Calendar size={16} />
            </div>
          </div>

          <button onClick={loadStudents} className="load-btn">Charger</button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">Enregistrement réussi !</div>}

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Statut</th>
              <th>Heures d'absence</th>
              <th>Justification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={student.id_etudiant}>
                <td className="student-cell">
                  <div className="student-avatar"><User size={16} /></div>
                  <span>{student.nom} {student.prenom}</span>
                </td>
                <td>
                  <span className={`status-badge ${studentStatus[idx]?.status}`}>
                    {studentStatus[idx]?.status}
                  </span>
                </td>
                <td>
                  {studentStatus[idx]?.status !== 'present' && (
                    <input
                      type="number"
                      min="0"
                      placeholder="Heures"
                      value={studentStatus[idx]?.hours_absent}
                      onChange={(e) => handleHoursChange(student.id_etudiant, e.target.value)}
                    />
                  )}
                </td>
                <td>
                  {studentStatus[idx]?.status === 'excused' && (
                    <input
                      type="text"
                      placeholder="Justification"
                      value={studentStatus[idx]?.justification}
                      onChange={(e) => handleJustificationChange(student.id_etudiant, e.target.value)}
                    />
                  )}
                </td>
                <td>
                  <div className="attendance-actions">
                    <button onClick={() => updateStatus(student.id_etudiant, 'present')} className="action-btn present">Présent</button>
                    <button onClick={() => updateStatus(student.id_etudiant, 'absent')} className="action-btn absent">Absent</button>
                    <button onClick={() => updateStatus(student.id_etudiant, 'excused')} className="action-btn excused">Justifié</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-actions-footer">
        <button className="save-btn" onClick={saveAttendance}>Enregistrer les présences</button>
      </div>
    </div>
  );
};

export default Atttendance;
