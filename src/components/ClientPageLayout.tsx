import type { ReactNode } from 'react';
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface ClientPageLayoutProps {
  children: ReactNode;
}

const ClientPageLayout: React.FC<ClientPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ClientPageLayout;
