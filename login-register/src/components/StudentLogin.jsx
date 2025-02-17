import React from "react";
import './TeacherLogin.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import navigation hook

function StudentLogin() {
    const navigate = useNavigate();
  return (
    <div className="container">
    <div className='Wrapper'>
      <div className="form-box login">
        <form action="">
          <h1>Student Login</h1>
          <div className="input-box">
            <input type="email" placeholder="Email" required />
            <FaEnvelope className="icon" />
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <FaLock className="icon" />
          </div>
          <div className="remember-forgot">
            <label><input type="checkbox" />Remember me</label>
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit">Login</button>
          <div className="activate-link">
            <p>New here? <a onClick={() => navigate("/activate-account")}>Activate your account</a></p>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}

export default StudentLogin;