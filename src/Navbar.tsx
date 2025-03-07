import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 p-4 bg-gray-900 shadow-md flex justify-between items-center text-[#FF9C01]">
      <div className="space-x-6">
        <Link to="/" className="hover:text-yellow-400 transition duration-200">Etusivu</Link>
        <Link to="/pohjalaskuri" className="hover:text-yellow-400 transition duration-200">Pohjalaskuri</Link>
        <Link to="/lihalaskuri" className="hover:text-yellow-400 transition duration-200">Lihalaskuri</Link>
      </div>
    </nav>
  );
};

export default Navbar;
