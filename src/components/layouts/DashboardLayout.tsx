import type { ReactNode } from 'react';
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

type DashboardLayoutProps = {
  children?: ReactNode;
  role?: 'admin' | 'partner' | 'client';
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role = 'client' }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
