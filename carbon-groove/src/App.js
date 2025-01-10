import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
// import ImageUpload from './components/ImageUpload';
import CommunityPage from './pages/Community';
import ImageUploadFinal from './components/ImageUploadFinal';
import Header from './components/Header';
import "./index.css"
import './App.css';
import Home from './pages/HomePage';
import TaskDetails from './pages/TaskDetails';
import EcoRewards from './pages/Rewards';

function App() {
  const [authToken, setAuthToken] = useState(null);

  return (
    <Router>
      <div className="App">
      <Header authToken={authToken} setAuthToken={setAuthToken} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
          <Route path="/upload" element={<ImageUploadFinal authToken={authToken} />} />
          <Route path="/community" element={<CommunityPage authToken={authToken} />} />
          <Route path="/task-details/:taskId" element={<TaskDetails authToken={authToken} />} />
          <Route path="/rewards" element={<EcoRewards authToken={authToken} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
