import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import "./ActivateAccount.css";

function ActivateAccount() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleActivation = async () => {
    if (!password || !confirmPassword) {
      setMessage("Les deux champs sont requis");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    // Envoi du mot de passe et de l'email au backend pour l'activation du compte
    const response = await fetch("http://localhost:5000/activate-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage("Compte activé avec succès !");
      setTimeout(() => {
        // Rediriger l'utilisateur en fonction de son rôle
        navigate(data.role === "student" ? "/student-dashboard" : "/teacher-dashboard");
      }, 2000);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="activate-account-container">
      <div className="wrapperr">
        <h2>Définissez votre mot de passe</h2>
        <p>Entrez votre nouveau mot de passe pour activer votre compte.</p>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button onClick={handleActivation}>Activer le compte</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ActivateAccount;
