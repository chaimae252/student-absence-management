import React from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "./AuthPage.css";

function AuthPage() {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="auth-container">
      <div className="blur-frame">
        <h1 className="hh">Welcome to Student Absence Management</h1>
        <p className="par">Are you a teacher or a student?</p>
        <div className="button-group">
          <button 
            className="auth-button teacher" 
            onClick={() => navigate("/teacher-login")} // Navigate to TeacherLogin
          >
            Login as Teacher
          </button>
          <button 
            className="auth-button student"
            onClick={() => navigate("/student-login")} // Placeholder for student login
          >
            Login as Student
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
