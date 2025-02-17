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
      <h2>Activate Your Account</h2>
      <p>Enter your email to receive an activation link.</p>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button onClick={handleActivationRequest}>Send Activation Link</button>
      {message && <p>{message}</p>}
        </div>
    </div>
  );
}

export default Activate;
