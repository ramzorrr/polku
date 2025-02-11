// Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';


const Navbar: React.FC = () => {
  return (
    <nav className="p-4 bg-gray-800 text-white">
      <Link to="/" className="mr-4">Etusivu</Link>
      <Link to="/pohjalaskuri" className="text-white mr-4">Pohjalaskuri</Link>
      <Link to="/lihalaskuri" className="text-white mr-4">Lihalaskuri</Link>
      <Link to="/faq" className="text-white mr-4 right" >UKK</Link>
    </nav>
  );
};

export default Navbar;
