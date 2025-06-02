import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import './Rapports.css'; // Updated CSS file
const API_BASE_URL = 'http://localhost:5000';

const AbsenceReport = () => {
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [niveaux, setNiveaux] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rapport, setRapport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/filieres_niveaux`)
      .then(res => res.json())
      .then(data => {
        setFilieres([...new Set(data.map(d => d.nom_filiere))]);
        setNiveaux(data);
      })
      .catch(() => setError("Erreur lors du chargement des filières et niveaux"));
  }, []);

  const generateReport = async () => {
    if (!selectedFiliere || !selectedNiveau || !fromDate || !toDate) {
      setError("Tous les champs sont requis");
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rapports/absences?filiere=${selectedFiliere}&niveau=${selectedNiveau}&from=${fromDate}&to=${toDate}`);
      const data = await res.json();
      setRapport(data);
    } catch {
      setError("Erreur lors de la récupération du rapport");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rapport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport");
    XLSX.writeFile(workbook, "rapport_absences.xlsx");
  };

  const niveauxDisponibles = niveaux
    .filter(n => n.nom_filiere === selectedFiliere)
    .map(n => n.nom_niveau);

  return (
    <div className="report-container">
      <h2 className="report-title">Rapport des Absences</h2>
      <p className="report-description">Consultez et exportez les absences par filière et niveau</p>

      <div className="report-form">
        <div className="formm-group">
          <label>Filière</label>
          <select value={selectedFiliere} onChange={(e) => {
            setSelectedFiliere(e.target.value);
            setSelectedNiveau('');
          }}>
            <option value="">-- Sélectionner Filière --</option>
            {filieres.map((filiere, index) => (
              <option key={index} value={filiere}>{filiere}</option>
            ))}
          </select>
        </div>

        <div className="formm-group">
          <label>Niveau</label>
          <select value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)}>
            <option value="">-- Sélectionner Niveau --</option>
            {niveauxDisponibles.map((niveau, index) => (
              <option key={index} value={niveau}>{niveau}</option>
            ))}
          </select>
        </div>

        <div className="formm-group">
          <label>Date de début</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="formm-group">
          <label>Date de fin</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      {error && <p className="report-error">{error}</p>}

      <div className="report-actions">
        <button className="btn primary" onClick={generateReport}>Générer le rapport</button>
        {rapport.length > 0 && (
          <button className="btn secondary" onClick={exportToExcel}>Exporter en Excel</button>
        )}
      </div>

      {loading && <p className="report-loading">Chargement...</p>}

      {rapport.length > 0 && (
        <table className="report-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Total Absences</th>
              <th>Justifiées</th>
              <th>Dernière Absence</th>
            </tr>
          </thead>
          <tbody>
            {rapport.map((r, index) => (
              <tr key={index}>
                <td>{r.nom}</td>
                <td>{r.prenom}</td>
                <td>{r.email}</td>
                <td>{r.total_absences}</td>
                <td>{r.absences_justifiees}</td>
                <td>{r.derniere_absence?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AbsenceReport;
