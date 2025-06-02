import React, { useEffect, useState } from 'react';
import './account.scss';
import { BiChevronRight } from 'react-icons/bi';

const Compte = () => {
  const [etudiant, setEtudiant] = useState(null);

  useEffect(() => {
    const donneesEtudiant = JSON.parse(localStorage.getItem('studentData'));
    if (donneesEtudiant) {
      setEtudiant({
        nom: `${donneesEtudiant.nom} ${donneesEtudiant.prenom}`,
        filiere: donneesEtudiant.nom_filiere,
        niveau: donneesEtudiant.nom_niveau,
        email: donneesEtudiant.email,
        telephone: donneesEtudiant.telephone
      });
    }
  }, []);

  if (!etudiant) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="bod">
      <div className="account">
        <h2 className="accountTitle">Détails de l'étudiant</h2>
        <div className="accountDetails">
          <span className="name">{etudiant.nom}</span>
          <span className="filiere">{etudiant.filiere}</span>
          <span className="niveau">{etudiant.niveau}</span>
          <span className="email">{etudiant.email}</span>
          <span className="phone">{etudiant.telephone}</span>
        </div>
      </div>
    </div>
  );
};

export default Compte;
