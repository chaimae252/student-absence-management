import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./bottom.scss";
import img from '../../../../assets/images/laptop.png';
import img2 from '../../../../assets/images/database-svgrepo-com.png';
import img3 from '../../../../assets/images/book.png';

const Bas = () => {
  const location = useLocation(); 
  const [donneesAbsences, setDonneesAbsences] = useState([]);
  const [heuresTotalesAbsence, setHeuresTotalesAbsence] = useState(0);
  
  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get("id");
  console.log("ID Étudiant :", studentId);

  useEffect(() => {
    if (studentId) {
      const recupererAbsences = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/absences/${studentId}`);
          console.log("Réponse API :", response.data);

          if (response.data && response.data.absences && response.data.absences.length > 0) {
            setDonneesAbsences(response.data.absences);
            setHeuresTotalesAbsence(response.data.totalAbsentHours);
          } else {
            console.log("Aucune donnée d'absence disponible pour cet étudiant.");
            setDonneesAbsences([]);
            setHeuresTotalesAbsence(0);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des absences :", error);
          setDonneesAbsences([]);
          setHeuresTotalesAbsence(0);
        }
      };

      recupererAbsences();
    }
  }, [studentId]);

  const formaterDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); 
  };

  const heuresTotalesCours = 6;

  const donneesGraphique = donneesAbsences
    .map((absence) => {
      const heuresAbsence = absence.duree;
      const heuresPresence = heuresTotalesCours - heuresAbsence;
      const dateFormatee = formaterDate(absence.date);
      console.log("Date formatée :", dateFormatee);
    
      return {
        jour: dateFormatee,
        Absences: heuresAbsence,
        Présences: heuresPresence,
      };
    })
    .slice(0, 4);

  return (
    <div className="bottom flex">
      <div className="graphDiv">
        <span className="title">Toutes les activités (Vue graphique)</span>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={donneesGraphique}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="jour" type="category" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="Absences" stroke="#D32F2F" fill="#FFCDD2" />
            <Area type="monotone" dataKey="Présences" stroke="#1976D2" fill="#BBDEFB" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="scheduleDiv">
        <span className="title">Astuces d'étude</span>

        <div className="singleTask flex">
          <div className="imgDiv flex">
            <img src={img} alt="Organisation" />
          </div>
          <div className="taskInfo">
            <span className="task">Reste organisé(e) :</span>
            <span className="teacher">Utilise une liste de tâches pour suivre tes devoirs et échéances.</span>
          </div>
        </div>

        <div className="singleTask flex">
          <div className="imgDiv flex">
            <img src={img2} alt="Rappel actif" />
          </div>
          <div className="taskInfo">
            <span className="task">Rappel actif :</span>
            <span className="teacher">Essaie de te rappeler les infos sans regarder tes notes.</span>
          </div>
        </div>

        <div className="singleTask flex">
          <div className="imgDiv flex">
            <img src={img3} alt="Pause" />
          </div>
          <div className="taskInfo">
            <span className="task">Fais des pauses :</span>
            <span className="teacher">De courtes pauses entre les sessions améliorent la concentration.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bas;
