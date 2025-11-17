import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password) {
      dispatch({
        type: 'REGISTER',
        payload: { name, email, password },
      });
      // For mock purposes, log in the user directly after registration
      dispatch({ type: 'LOGIN' });
      navigate('/');
    } else {
      setError('Please fill in all fields.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;