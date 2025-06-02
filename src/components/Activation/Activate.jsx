import { useState } from "react";
import './Activate.css';
import React from "react";

function Activate() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleActivationRequest = async () => {
    const response = await fetch("http://localhost:5000/request-activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="activate-container">
        <div className='Wrappper'>
      <h2>Activez votre compte</h2>
      <p>Saisissez votre adresse e-mail pour recevoir un lien d'activation.</p>
      <input
        type="email"
        placeholder="Entrez votre adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button onClick={handleActivationRequest}>Envoyer le lien d'activation</button>
      {message && <p>{message}</p>}
        </div>
    </div>
  );
}

export default Activate;
