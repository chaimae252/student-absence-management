import React from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "./AuthPage.css";

function AuthPage() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="auth-container">
      <div className="blur-frame">
        <h1 className="hh">Bienvenue dans la platforme de gestion des absences des étudiants</h1>
        <p className="par">Êtes-vous enseignant ou étudiant ?</p>
        <div className="button-group">
          <button 
            className="auth-button teacher" 
            onClick={() => navigate("/teacher-login")} // Naviguer vers TeacherLogin
          >
            En tant qu'enseignant
          </button>
          <button 
            className="auth-button student"
            onClick={() => navigate("/student-login")} // Naviguer vers StudentLogin
          >
            En tant qu'étudiant
          </button>
        </div>
        <div className="activate-link">
          <p className="par">
            Vous êtes un administrateur ?{" "}
            <a onClick={() => navigate("/admin-login")}>Cliquez ici.</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
