import './index.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PlayerRegisterForm from './components/PlayerRegisterForm';
import TeamAdminRegisterForm from './components/TeamAdminRegisterForm';
import ClubAdminRegisterForm from './components/ClubAdminRegisterForm';
import MemberRegisterForm from './components/MemberRegisterForm';
import UmpireRegisterForm from './components/UmpireRegisterForm';
import LoginForm from './components/LoginForm';

import PlayerDashboard from './components/PlayerDashboard';
import ClubAdminDashboard from './components/ClubAdminDashboard';
import UmpireDashboard from './components/UmpireDashboard';
import MemberDashboard from './components/MemberDashboard';
import TeamAdminDashboard from './components/TeamAdminDashboard';
import BecomePlayerForm from './components/BecomePlayerForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register/player" element={<PlayerRegisterForm />} />
        <Route path="/register/team-admin" element={<TeamAdminRegisterForm />} />
        <Route path="/register/club-admin" element={<ClubAdminRegisterForm />} />
        <Route path="/register/member" element={<MemberRegisterForm />} />
        <Route path="/register/umpire" element={<UmpireRegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register-as-player" element={<BecomePlayerForm />} />

        <Route path="/dashboard/club-admin" element={<ClubAdminDashboard />} />
        <Route path="/dashboard/team-admin" element={<TeamAdminDashboard />} />
        <Route path="/dashboard/player" element={<PlayerDashboard />} />
        <Route path="/dashboard/umpire" element={<UmpireDashboard />} />
        <Route path="/dashboard/member" element={<MemberDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
