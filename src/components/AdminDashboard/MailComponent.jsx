import React, { useEffect, useState } from "react";
import { Mail, AlertCircle, Loader2, RefreshCw, BarChart2 } from "lucide-react";
import "./mail.css";

const API_BASE_URL = "http://localhost:5000";

const MailComponent = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, mois: 0 });
  const [seuilEtudiants, setSeuilEtudiants] = useState([]);

  const fetchData = () => {
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE_URL}/api/emails-envoyes`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/emails/stats`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/absent-seuil`).then(res => res.json())
    ])
      .then(([emailsData, statsData, seuilData]) => {
        setEmails(emailsData);
        setStats(statsData);
        setSeuilEtudiants(Array.isArray(seuilData) ? seuilData : []);
        console.log("Seuil data:", seuilData); // already here, good
        if (!Array.isArray(seuilData)) {
          console.warn("⚠️ Unexpected seuilData format", seuilData);
        }
 // 🚨 Fix here
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des données.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resendEmail = async (etudiant) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_etudiant: etudiant.id_etudiant,
          email: etudiant.email,
          sujet: "Rappel : Absences non justifiées",
          message: `Bonjour ${etudiant.prenom} ${etudiant.nom},\n\nVous avez dépassé le seuil d'absences autorisé. Merci de contacter l'administration.`
        })
      });
      const data = await res.json();
      alert(data.message || "Email renvoyé.");
      fetchData();
    } catch (error) {
      alert("Erreur lors de l'envoi du mail.");
    }
  };
  return (
    <div className="mail-component">
    <div className="cardd">
      <div className="cardd-header">
        <h2 className="cardd-title">Envoi des Mails</h2>
        <div className="header-actionss">
          <button className="primary-button" onClick={fetchData}>
            <RefreshCw size={18} /> Actualiser
          </button>
        </div>
      </div>

      <div className="cardd-content">
        <p>Système automatique d'envoi d'emails en cas d'absences répétées.</p>

        {/* Statistiques */}
        <div className="stats-section">
          <div className="stat-box">
            <BarChart2 size={24} />
            <span>Total emails envoyés : {stats.total}</span>
          </div>
          <div className="stat-box">
            <BarChart2 size={24} />
            <span>Ce mois : {stats.mois}</span>
          </div>
        </div>

        {/* Étudiants à seuil */}
        <div className="section">
          <h3>Étudiants ayant dépassé le seuil</h3>
          {Array.isArray(seuilEtudiants) && seuilEtudiants.length === 0 ? (
            <p>Aucun étudiant au-dessus du seuil pour l'instant.</p>
          ) : (
            <table className="emails-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Absences</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {seuilEtudiants.map(et => (
                  <tr key={et.id_etudiant}>
                    <td>{et.nom}</td>
                    <td>{et.prenom}</td>
                    <td>{et.email}</td>
                    <td>{et.absences}</td>
                    <td>
                      <button className="primary-button" onClick={() => resendEmail(et)}>
                        Envoyer Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Historique */}
        <div className="section">
          <h3>Historique des Emails Envoyés</h3>
          {loading ? (
            <div className="loading">
              <Loader2 className="loader" size={24} /> Chargement...
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <AlertCircle size={20} /> {error}
            </div>
          ) : emails.length === 0 ? (
            <p>Aucun email n'a encore été envoyé.</p>
          ) : (
            <table className="emails-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Sujet</th>
                  <th>Date</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                {emails.map(email => (
                  <tr key={email.id}>
                    <td>{email.nom} {email.prenom}</td>
                    <td>{email.sujet}</td>
                    <td>{new Date(email.date_envoi).toLocaleString()}</td>
                    <td>{email.raison}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default MailComponent;
