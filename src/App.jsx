import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from './components/Authentification/AuthPage';
import TeacherLogin from './components/TeacherDashboard/TeacherD/TeacherLogin';
import StudentLogin from './components/StudentDashboard/StudentD/StudentLogin';
import Activate from './components/Activation/Activate';
import ActivateAccount from './components/Activation/ActivateAccount';
import StudentDashboard from './components/StudentDashboard/StudentD/StudentDashboard';
import Attendance from './components/StudentDashboard/Attendance/Attendance';
import Justification from './components/StudentDashboard/Justification/Justification';
import AdminLogin from "./components/AdminDashboard/AdminLogin";
import Dashboard, { WelcomePage } from './components/AdminDashboard/Dashboard';
import AdminAttendance from "./components/AdminDashboard/AdminAttendance";
import AdminProfileDrawer from "./components/AdminDashboard/AdminProfileDrawer";
import InjectionEtudiants from "./components/AdminDashboard/InjectionEtudiants";
import MailComponent from "./components/AdminDashboard/MailComponent";
import RapportsAbsence from "./components/AdminDashboard/RapportsAbsence";

import TeacheDashboard from "./components/TeacherDashboard/components/Teacher/TeacheDashboard";
import Bodyy from './components/TeacherDashboard/components/Teacher/Body/Bbody/Bodyy';
import AccountSection from './components/TeacherDashboard/components/Teacher/Body/Acc/AccountSection';
import Atttendance from './components/TeacherDashboard/components/Teacher/Atttendance/Atttendance';
import Justif from './components/TeacherDashboard/components/Teacher/Justif/Justif';
import Index from './components/TeacherDashboard/pages/Index';
import NotFound from './components/TeacherDashboard/pages/NotFound';
function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Auth Pages */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/Activate-account" element={<Activate />} />
          <Route path="/activate" element={<ActivateAccount />} />

          {/* Student Dashboard */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard/attendance" element={<Attendance />} />
          <Route path="/student-dashboard/justification" element={<Justification />} />

          {/* Admin Dashboard Layout with Nested Routes */}
          <Route path="/admin-dashboard" element={<Dashboard />}>
            <Route index element={<WelcomePage />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="profile" element={<AdminProfileDrawer />} />
            <Route path="injection" element={<InjectionEtudiants />} />
            <Route path="mail" element={<MailComponent />} />
            <Route path="rapports" element={<RapportsAbsence />} />
          </Route>
          <Route path="/teacher-dashboard/:id" element={<TeacheDashboard />}>
            <Route index element={<Bodyy />} />
            <Route path="attendance" element={<Atttendance />} />
            <Route path="justification" element={<Justif />} />
            <Route path="account" element={<AccountSection />} />
          </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
