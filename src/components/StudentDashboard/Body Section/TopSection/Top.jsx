import React, { useEffect, useState } from 'react';
import './top.scss';
import { AiOutlineSearch } from 'react-icons/ai';
import { useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import Accountt from '../Account Section/Accountt';

const Top = () => {
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [totalAbsentHours, setTotalAbsentHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const studentId = queryParams.get('id');

    if (studentId) {
      fetchStudentData(studentId);
      fetchAbsenceData(studentId);
    }
  }, [location]);

  const fetchStudentData = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/${studentId}`);
      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données de l'étudiant", error);
    }
  };

  const toggleAccount = () => setShowAccount(!showAccount);

  const fetchAbsenceData = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/absences/${studentId}`);
      const data = await response.json();
      if (Array.isArray(data.absences)) {
        setAbsences(data.absences);
        setTotalAbsentHours(data.totalAbsentHours || 0);
      } else {
        console.warn("Aucune absence trouvée.");
        setAbsences([]);
        setTotalAbsentHours(0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des absences", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAbsences = absences.filter((absence) => {
    const formattedDate = new Date(absence.date).toLocaleDateString('fr-FR');
    const dateMatches = formattedDate.includes(searchTerm);
    const justificationMatches = absence.justification.toLowerCase().includes(searchTerm.toLowerCase());
    return dateMatches || justificationMatches;
  });

  if (loading) return <div>Chargement...</div>;
  if (!student) return <div>Aucune donnée étudiante trouvée. Veuillez vous reconnecter.</div>;

  const getCardClass = (index) => {
    return index === 0 ? 'yellowCard' : index === 1 ? 'lightGreenCard' : 'darkGreenCard';
  };

  const totalAbsences = filteredAbsences.length;
  const averageDuration = totalAbsences > 0
    ? (totalAbsentHours / totalAbsences).toFixed(1)
    : 0;

  const justifiedCount = filteredAbsences.filter(abs => abs.justification && abs.justification.toLowerCase() !== 'non').length;
  const unjustifiedCount = totalAbsences - justifiedCount;

  const mostRecentAbsence = filteredAbsences.length > 0
    ? new Date(Math.max(...filteredAbsences.map(abs => new Date(abs.date)))).toLocaleDateString('fr-FR')
    : "Aucune";

  const progressPercentage = Math.min((totalAbsentHours / 40) * 100, 100);
  const absencesProgress = Math.min((totalAbsences / 10) * 100, 100);
  const averageProgress = Math.min((averageDuration / 8) * 100, 100);
  const justifiedProgress = Math.min((justifiedCount / totalAbsences) * 100 || 0, 100);

  return (
    <div className='top'>
      <div className="topDiv flex">
        <div className="titleText">
          <span className="title">Bienvenue, {student.nom} </span>
          <p>Voyons un aperçu de tes absences</p>
        </div>
        <div className="searchhInput flex">
          <AiOutlineSearch className="icon" />
          <input
            type="text"
            placeholder='Rechercher par date ou justification'
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="profileIcon" onClick={toggleAccount} style={{ cursor: 'pointer', fontSize: '2rem', marginLeft: '15px' }}>
          <FaUserCircle />
        </div>
      </div>

      <div className="carDiv flex">
        <div className="cars">
          {filteredAbsences.length === 0 ? (
            <div className="cass yellowCard">
              <div className="text"> Tu n’as aucune absence pour le moment !</div>
            </div>
          ) : (
            filteredAbsences.slice(0, 3).map((absence, index) => {
              const formattedDate = new Date(absence.date).toLocaleDateString('fr-FR');
              const [day, month, year] = formattedDate.split('/');

              return (
                <div key={index} className={`cass ${getCardClass(index)}`}>
                  <div className="datee">
                    <span className="day">{day}</span>
                    <span className="month">{month}</span>
                    <span className="year">{year}</span>
                  </div>
                  <div className="time">
                    <span className="text">Justification</span>
                    <p className="h22">{absence.justification}</p>
                  </div>
                  <div className="workTime">
                    <span className="text">Heures</span>
                    <p className="h22">{absence.duree} h</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="statsDiv">
          <span className="title">Statistiques</span>
          <div className="stat">
            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Total d'heures d'absence</span>
                <span className="percentage">{totalAbsentHours} h</span>
              </div>
              <div className="line">
                <span className="range" style={{ width: `${progressPercentage}%` }}></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Total des absences</span>
                <span className="percentage">{totalAbsences}</span>
              </div>
              <div className="line">
                <span className="range" style={{ width: `${absencesProgress}%` }}></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Durée moyenne</span>
                <span className="percentage">{averageDuration} h</span>
              </div>
              <div className="line">
                <span className="range" style={{ width: `${averageProgress}%` }}></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Justifiées / Non justifiées</span>
                <span className="percentage">{justifiedCount} / {unjustifiedCount}</span>
              </div>
              <div className="line">
                <span className="range" style={{ width: `${justifiedProgress}%` }}></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Dernière absence</span>
                <span className="percentage">{mostRecentAbsence}</span>
              </div>
            </div>
          </div>
        </div>

        {showAccount && (
          <div className="accountPopup">
            <div className="overlay" onClick={toggleAccount}></div>
            <div className="popupContent">
              <Accountt />
              <button className="closeBtn" onClick={toggleAccount}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Top;
