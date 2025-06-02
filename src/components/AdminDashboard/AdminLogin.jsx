import React, { useState } from 'react';
import '../TeacherDashboard/TeacherD/TeacherLogin.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Veuillez saisir votre e-mail et votre mot de passe');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        navigate(`/admin-dashboard?id=${data.admin.id_admin}`);
      } else {
        alert(data.message || 'Identifiants invalides');
      }
    } catch (error) {
      console.error('Échec de la connexion :', error);
      alert('Une erreur est survenue lors de la connexion.');
    }
  };

  return (
    <div className="container">
      <div className="Wrapper">
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Connexion Administrateur</h1>
            <div className="input-box">
              <input 
                type="email" 
                placeholder="E-mail" 
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
              <label><input type="checkbox" /> Se souvenir de moi</label>
              <a href="#" className='forgot'>Mot de passe oublié ?</a>
            </div>
            <button type="submit">Se connecter</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
