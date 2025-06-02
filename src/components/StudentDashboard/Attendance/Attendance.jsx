import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar Section/Sidebar.jsx';
import './attendance.scss';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Attendance = () => {
  const [absences, setAbsences] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null); // Pour stocker les infos de l'étudiant
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get('id');
  console.log('ID étudiant depuis l’URL :', studentId); // Vérification si l’ID est bien extrait

  useEffect(() => {
    // Ne continuer que si l’ID étudiant est présent
    if (studentId) {
      const fetchAbsences = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/absences/${studentId}`);
          setAbsences(response.data.absences);
        } catch (error) {
          console.error('Erreur lors de la récupération des absences :', error);
        }
      };

      const fetchStudentInfo = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/etudiants/${studentId}`);
          setStudentInfo(response.data.student); // Stocker les infos de l'étudiant
        } catch (error) {
          console.error("Erreur lors de la récupération des infos de l'étudiant :", error);
        }
      };

      fetchAbsences();
      fetchStudentInfo(); // Charger les infos de l'étudiant lors du montage du composant
    }
  }, [studentId]);

  const filteredAbsences = absences.filter(abs =>
    abs.justification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(abs.date).toLocaleDateString().includes(searchTerm)
  );

  const handlePDFExport = () => {
    const doc = new jsPDF();
    const header = ['Date', 'Heures', 'Justification'];

    // Définir la taille de police et ajouter le titre
    doc.setFontSize(16);
    doc.text("Mes absences", 20, 20);
    console.log('Infos étudiant :', studentInfo);

    // Ajouter les infos de l'étudiant si elles existent
    if (studentInfo) {
      doc.setFontSize(12);
      doc.text(`Étudiant(e) : ${studentInfo.nom} ${studentInfo.prenom}`, 20, 30);
      doc.text(`Email : ${studentInfo.email}`, 20, 40);
      doc.text(`Filière : ${studentInfo.nom_filiere}`, 20, 50);
      doc.text(`Niveau : ${studentInfo.nom_niveau}`, 20, 60);
    }

    // Définir la taille de police pour le tableau
    doc.setFontSize(12);

    // Créer le tableau
    doc.autoTable({
      head: [header],
      body: filteredAbsences.map(abs => [
        new Date(abs.date).toLocaleDateString(),
        abs.duree,
        abs.justification
      ]),
      startY: 70, // Commencer le tableau après les infos de l'étudiant
      theme: 'grid',
    });

    // Enregistrer le PDF avec un nom dynamique
    doc.save(`historique_absences_${studentId}.pdf`);
  };

  return (
    <div className="attendancePage">
      <Sidebar studentId={studentId} />
      <div className="contentt">
        <div className="contentt-header">
          <h2>Mes absences</h2>

          <input
            type="text"
            placeholder="Rechercher par date ou justification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          {/* Bouton d’exportation PDF */}
          <button className="export-btn" onClick={handlePDFExport}>Exporter en PDF</button>
        </div>

        {filteredAbsences.length === 0 ? (
          <p className="no-data">Aucune absence correspondante trouvée 😎</p>
        ) : (
          <table className="absence-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heures</th>
                <th>Justification</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.map((absence, index) => (
                <tr key={index}>
                  <td>{new Date(absence.date).toLocaleDateString()}</td>
                  <td>{absence.duree}</td>
                  <td>{absence.justification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Attendance;
