// Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="h-[94vh] bg-gradient-to-br from-green-500 to-green-200 flex flex-col items-center justify-center text-white">
      <div className="text-center px-6">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to Carbon Grove</h1>
        <p className="text-lg mb-8">
          Join us in making the world a cleaner place. Upload images of trash you find, help clean up, and earn rewards!
        </p>
        <div className="flex space-x-4 align-middle justify-center">
          <Link
            to="/register"
            className="bg-white text-green-600 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/community-tasks"
            className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
          >
            Community Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;