import React from 'react';
import { Outlet } from 'react-router-dom';
import MainNavigation from './MainNavigation';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <MainNavigation />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
