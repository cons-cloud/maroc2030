import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Maroc 2030
            </Link>
          </div>
          <Navbar />
        </div>
      </div>
    </header>
  );
};

export default Header;
