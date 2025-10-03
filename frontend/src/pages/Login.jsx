import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import "./Login.css";
import { ReactComponent as PhoneIcon } from "../icons/phone.svg";
import { ReactComponent as GoogleIcon } from "../icons/google.svg";
import { ReactComponent as FacebookIcon } from "../icons/facebook.svg";
import { ReactComponent as AppleIcon } from "../icons/apple.svg";
import { ReactComponent as EmailIcon } from "../icons/email.svg";
import { ReactComponent as PasswordIcon } from "../icons/password.svg";
import heroImage from "../icons/hero.png";

// Placeholders for when we get images for icons
const socialButtons = [
  { id: "phone", label: "PH", ariaLabel: "Continue with phone", icon: <PhoneIcon /> },
  { id: "google", label: "G", ariaLabel: "Continue with Google", icon: <GoogleIcon /> },
  { id: "facebook", label: "F", ariaLabel: "Continue with Facebook", icon: <FacebookIcon /> },
  { id: "apple", label: "A", ariaLabel: "Continue with Apple", icon: <AppleIcon /> },
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
        <span aria-hidden="true">{button.icon}</span>
      </button>
    ))}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axiosInstance.post("/api/auth/login", formData);
      login(response.data);
      navigate("/modules");
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero" aria-labelledby="auth-welcome-heading">
        <div className="hero-content">
          <img src={heroImage} alt="Illustration of learning progress tracking" className="hero-illustration"/>
          <h1 id="auth-welcome-heading" className="hero-title">
            Welcome to the Online Learning Progress Tracker
          </h1>

          <p className="hero-tagline">Learn, Explore, Educate, and Track</p>

          <div className="hero-social">
            <span className="hero-social-label">Log in with</span>
            {renderSocialButtons("hero")}
          </div>

          <button
            type="button"
            className="hero-cta"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="auth-panel-heading">
        <div className="auth-card">
          <h2 id="auth-panel-heading" className="card-title">
            Log In
          </h2>

          <p className="card-subtitle">Welcome back, log in to continue.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="input-field">
              <span className="input-icon" aria-hidden="true">
                <span className="icon-placeholder"><EmailIcon /></span>
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
                <span className="icon-placeholder"><PasswordIcon /></span>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Password"
              />
              <button
                type="button"
                className="input-action"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span aria-hidden="true">{showPassword ? "HIDE" : "SHOW"}</span>
              </button>
            </label>
            {errorMessage && (
              <div className="form-error" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="divider" role="separator" aria-label="Or continue with" data-content="or" />

          {renderSocialButtons("panel")}

          <p className="card-footer">
            Don't have an account?
            <button
              type="button"
              className="link-button link-button--highlight"
              onClick={() => navigate("/register")}
              disabled={isSubmitting}
            >
              Register
            </button>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
