import React from 'react';
import { Link } from 'react-router-dom';
import '../Landing.css';

function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1>Welcome to ProjectTracker</h1>
        <p>Your collaborative solution to track and manage projects efficiently.</p>
        <div className="landing-actions">
          <Link to="/login" className="btn-primary">Login</Link>
          <Link to="/register" className="btn-secondary">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;