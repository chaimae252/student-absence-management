import React, { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import "./InjectionEtudiants.css"; // Assurez-vous d'importer le fichier CSS pour le style

const InjectionEtudiants = () => {
  const [file, setFile] = useState(null);
  const [teacherFile, setTeacherFile] = useState(null);

  // Gère la sélection du fichier des étudiants
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Gère la sélection du fichier des enseignants
  const handleTeacherFileChange = (event) => {
    setTeacherFile(event.target.files[0]);
  };

  // Gère l'envoi du fichier au serveur pour l'importation des étudiants
  const handleImport = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier Excel.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Fichier étudiants sélectionné :", file);

    try {
      const response = await fetch("http://localhost:5000/api/etudiants/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur d'importation étudiants :", errorText);
        throw new Error("Erreur lors de l'importation des étudiants");
      }

      alert("Étudiants importés avec succès.");
    } catch (error) {
      console.error("Erreur d'importation étudiants :", error);
      alert("Impossible d'importer les étudiants.");
    }
  };

  // Gère l'envoi du fichier au serveur pour l'importation des enseignants
  const handleTeacherImport = async () => {
    if (!teacherFile) {
      alert("Veuillez sélectionner un fichier Excel pour les enseignants.");
      return;
    }

    const formData = new FormData();
    formData.append("file", teacherFile);

    console.log("Fichier enseignants sélectionné :", teacherFile);

    try {
      const response = await fetch("http://localhost:5000/api/enseignants/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur d'importation enseignants :", errorText);
        throw new Error("Erreur lors de l'importation des enseignants");
      }

      alert("Enseignants importés avec succès.");
    } catch (error) {
      console.error("Erreur d'importation enseignants :", error);
      alert("Impossible d'importer les enseignants.");
    }
  };

  return (
    <div className="injection">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Injection des étudiants</h2>
        </div>
        <div className="card-content">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="file-input"
          />
          <button className="primary-button" onClick={handleImport}>
            <FileSpreadsheet size={20} />
            &nbsp;Importer les étudiants
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Injection des enseignants</h2>
        </div>
        <div className="card-content">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleTeacherFileChange}
            className="file-input"
          />
          <button className="primary-button" onClick={handleTeacherImport}>
            <FileSpreadsheet size={20} />
            &nbsp;Importer les enseignants
          </button>
        </div>
      </div>
    </div>
  );
};

export default InjectionEtudiants;
