import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage.jsx";
import TeacherLogin from "./components/TeacherLogin.jsx";
import StudentLogin from "./components/StudentLogin.jsx";
import Activate from "./components/Activate.jsx";
import ActivateAccount from "./components/ActivateAccount.jsx";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/Activate-account" element={<Activate />} />
          <Route path="/activate" element={<ActivateAccount />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

