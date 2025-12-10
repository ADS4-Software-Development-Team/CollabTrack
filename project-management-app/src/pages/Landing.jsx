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
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-300 text-white-600 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 h-10 min-w-[100px] tracking-wide"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 hover:shadow-sm transition-all duration-200 h-10 min-w-[100px] tracking-wide"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gantt-chart-preview">
              {/* Gantt Chart Header */}
              <div className="gantt-header">
                <div className="gantt-title">Project Timeline</div>
                <div className="gantt-timeframe">Week 1 - Week 8</div>
              </div>
              
              {/* Gantt Chart Grid */}
              <div className="gantt-grid">
                {/* Timeline Weeks */}
                <div className="gantt-timeline">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="gantt-week">W{i+1}</div>
                  ))}
                </div>
                
                {/* Gantt Bars */}
                <div className="gantt-bars">
                  {/* Task 1 */}
                  <div className="gantt-task">
                    <div className="task-label">Research</div>
                    <div className="task-bar-container">
                      <div className="task-bar" style={{ width: '50%', backgroundColor: '#4F46E5' }}></div>
                    </div>
                  </div>
                  
                  {/* Task 2 */}
                  <div className="gantt-task">
                    <div className="task-label">Design</div>
                    <div className="task-bar-container">
                      <div className="task-bar" style={{ width: '75%', marginLeft: '12.5%', backgroundColor: '#10B981' }}></div>
                    </div>
                  </div>
                  
                  {/* Task 3 */}
                  <div className="gantt-task">
                    <div className="task-label">Development</div>
                    <div className="task-bar-container">
                      <div className="task-bar" style={{ width: '62.5%', marginLeft: '25%', backgroundColor: '#F59E0B' }}></div>
                    </div>
                  </div>
                  
                  {/* Task 4 */}
                  <div className="gantt-task">
                    <div className="task-label">Testing</div>
                    <div className="task-bar-container">
                      <div className="task-bar" style={{ width: '37.5%', marginLeft: '50%', backgroundColor: '#EF4444' }}></div>
                    </div>
                  </div>
                  
                  {/* Task 5 */}
                  <div className="gantt-task">
                    <div className="task-label">Deployment</div>
                    <div className="task-bar-container">
                      <div className="task-bar" style={{ width: '25%', marginLeft: '75%', backgroundColor: '#8B5CF6' }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Line */}
                <div className="gantt-progress-line" style={{ left: '50%' }}>
                  <div className="progress-line"></div>
                  <div className="progress-label">Current Week</div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="gantt-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#4F46E5' }}></div>
                  <span>Research</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
                  <span>Design</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#F59E0B' }}></div>
                  <span>Development</span>
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