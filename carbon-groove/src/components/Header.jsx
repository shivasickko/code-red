// Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ authToken, setAuthToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/login');
  };

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-bold">
          <Link to="/">Carbon Grove</Link>
        </h1>
        <nav className="flex space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {!authToken ? (
            <>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/upload" className="hover:underline">
                Upload Image
              </Link>
              <Link to="/community" className="hover:underline">
                Community
              </Link>
              <Link to="/rewards" className="hover:underline">
                Rewards
              </Link>
              <button onClick={handleLogout} className="hover:underline">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;