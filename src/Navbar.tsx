// Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="p-4 bg-gray-800 text-white">
      <Link to="/" className="mr-4">Etusivu</Link>
      <Link to="/faq">UKK</Link>
    </nav>
  );
};

export default Navbar;
