import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css'; 
export default function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Streamline Your Projects with 
              <span className="highlight"> CollabTrack</span>
            </h1>
            <p className="hero-subtitle">
              The ultimate collaborative project management tool designed to help teams 
              track progress, manage tasks, and deliver projects on time.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                Register
              </Link>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header"></div>
              <div className="preview-content">
                <div className="preview-sidebar"></div>
                <div className="preview-main">
                  <div className="preview-card"></div>
                  <div className="preview-card"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in three simple steps</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Project</h3>
              <p>Start by creating a new project and adding team members.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Add Tasks</h3>
              <p>Break down your project into manageable tasks with deadlines.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Track Progress</h3>
              <p>Monitor progress in real-time and adjust as needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Project Management?</h2>
            <p>Join thousands of teams already using CollabTrack to deliver projects faster and more efficiently.</p>
            <Link to="/projects" className="btn-primary large">
              Start Your First Project
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>CollabTrack</h3>
              <p>Making project management simple and effective for teams of all sizes.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#demo">Demo</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#blog">Blog</a>
                <a href="#careers">Careers</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#docs">Documentation</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CollabTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
