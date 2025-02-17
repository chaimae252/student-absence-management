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
      setMessage("Both fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Send password and email to the backend for account activation
    const response = await fetch("http://localhost:5000/activate-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage("Account activated successfully!");
      setTimeout(() => {
        // Redirect user based on their role
        navigate(data.role === "student" ? "/student-dashboard" : "/teacher-dashboard");
      }, 2000);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="activate-account-container">
      <div className="wrapperr">
        <h2>Set Your Password</h2>
        <p>Enter your new password to activate your account.</p>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button onClick={handleActivation}>Activate Account</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ActivateAccount;
