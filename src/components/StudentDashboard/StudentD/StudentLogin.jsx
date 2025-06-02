import React, { useState } from "react";
import '../../TeacherDashboard/TeacherD/TeacherLogin.css';
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        const studentId = data.studentId;
        navigate(`/student-dashboard?id=${studentId}`); // ✅ this is the updated line
      } else {
        alert(data.message || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      alert("Une erreur s'est produite !");
    }
  };

  return (
    <div className="container">
      <div className='Wrapper'>
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Connexion Étudiant</h1>
            <div className="input-box">
              <input
                type="email"
                placeholder="Adresse e-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FaEnvelope className="icoon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FaLock className="icoon" />
            </div>
            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Se souvenir de moi
              </label>
              <a href="#">Mot de passe oublié ?</a>
            </div>
            <button type="submit">Se connecter</button>
            <div className="activate-link">
              <p className="pppp">
                Nouveau ici ?{" "}
                <span className="A" onClick={() => navigate("/activate")}>
                  Activez votre compte
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
