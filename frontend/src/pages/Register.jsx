import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import './Login.css';

const socialButtons = [
  { id: 'phone', label: 'PH', ariaLabel: 'Continue with phone' },
  { id: 'google', label: 'G', ariaLabel: 'Continue with Google' },
  { id: 'facebook', label: 'F', ariaLabel: 'Continue with Facebook' },
  { id: 'apple', label: 'A', ariaLabel: 'Continue with Apple' },
];

const renderSocialButtons = (variant) => (
  <div className={`social-button-row social-button-row--${variant}`}>
    {socialButtons.map((button) => (
      <button
        key={`${variant}-${button.id}`}
        type="button"
        className="social-button"
        aria-label={button.ariaLabel}
      >
        <span aria-hidden="true">{button.label}</span>
      </button>
    ))}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isEducator: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Please complete all fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await axiosInstance.post('/api/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        profileType: formData.isEducator ? 'educator' : 'student',
      });
      setSuccessMessage('Registration successful! You can log in now.');
      setTimeout(() => navigate('/login'), 800);
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero" aria-labelledby="auth-register-heading">
        <div className="hero-content">
          <div className="hero-illustration" role="img" aria-label="Illustration placeholder" />

          <h1 id="auth-register-heading" className="hero-title">
            Welcome to the Online Learning Progress Tracker
          </h1>

          <p className="hero-tagline">Learn, Explore, Educate, and Track</p>

          <div className="hero-social">
            <span className="hero-social-label">Sign up with</span>
            {renderSocialButtons('hero')}
          </div>

          
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="auth-panel-heading">
        <div className="auth-card">
          <h2 id="auth-panel-heading" className="card-title">
            Create Account
          </h2>

          <p className="card-subtitle">Start tracking your learning progress today.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="input-field">
              <span className="input-icon" aria-hidden="true">
                <span className="icon-placeholder">NM</span>
              </span>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Full name"
              />
            </label>

            

            <label className="input-field">
              <span className="input-icon" aria-hidden="true">
                <span className="icon-placeholder">EM</span>
              </span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Email"
              />
            </label>

            <label className="input-field">
              <span className="input-icon" aria-hidden="true">
                <span className="icon-placeholder">PW</span>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Password"
              />
              
              <button
                type="button"
                className="input-action"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span aria-hidden="true">{showPassword ? 'HIDE' : 'SHOW'}</span>
              </button>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="isEducator"
                checked={formData.isEducator}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span>Are you an Educator?</span>
            </label>

            {errorMessage && (
              <div className="form-error" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="form-success" role="status">
                {successMessage}
              </div>
            )}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider" role="separator" aria-label="Or continue with" data-content="or" />

          {renderSocialButtons('panel')}

          <p className="card-footer">
            Already have an account?
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
              disabled={isSubmitting}
            >
              Log in
            </button>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
