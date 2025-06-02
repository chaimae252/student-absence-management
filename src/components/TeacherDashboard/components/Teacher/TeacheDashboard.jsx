import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import SidebarSection from './SidebarSection/SidebarSection';
import TopSection from './Body/TopSection/TopSection';
import './TeacheDashboard.css';

const TeacheDashboard = () => {
  const { id } = useParams();

  return (
    <div className="dashboard-container">
      <SidebarSection />
      <div className="dashboard-content">
        <TopSection />
        <div className="dashboard-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TeacheDashboard;
