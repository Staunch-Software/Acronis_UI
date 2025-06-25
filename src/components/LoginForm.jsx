import React, { useState } from 'react';
import './LoginForm.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // <-- ADD THIS IMPORT


// Import icons
import { FaUser, FaLock } from 'react-icons/fa';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  rememberMe: Yup.boolean(),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (values, { setSubmitting, setFieldError }) => {
    setTimeout(() => {
      if (values.email === 'admin@example.com' && values.password === 'password123') {
        login({ name: 'Admin User', email: values.email });
        navigate('/app/clients');
      } else {
        setFieldError('general', 'Invalid email or password');
      }
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="login-card">
      {/* Left Blue Panel */}
      <div className="welcome-panel">
        {/* This new wrapper ensures text is on top of the decorative spheres */}
        <div className="welcome-content">
          <h2>WELCOME</h2>
          <h3>ACRONIS STAUNCH LOGIN</h3>
          <p>
            Securely access your cloud data, backups, and services. Your digital world, protected.
          </p>
        </div>
      </div>

      {/* Right White Form Panel */}
      <div className="form-panel">
        <Formik
          initialValues={{ email: '', password: '', rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <h2 className="form-title">Sign in</h2>
              <p className="form-subtitle">Please login to continue to your account.</p>

              <div className="input-group">
                <FaUser className="input-icon" />
                <Field type="email" name="email" placeholder="User Name" className="form-control" />
              </div>
              <ErrorMessage name="email" component="div" className="error-message" />

              <div className="input-group">
                <FaLock className="input-icon" />
                <Field
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="form-control"
                />
                <button
                  type="button"
                  className="show-hide-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <ErrorMessage name="password" component="div" className="error-message" />
              
              {errors.general && <div className="error-message general-error">{errors.general}</div>}

              <div className="form-options">
                <label className="remember-me">
                  <Field type="checkbox" name="rememberMe" />
                  Remember me
                </label>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>

              <div className="button-group">
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing In...' : 'Sign in'}
                </button>
                <button type="button" className="secondary-btn">
                  Sign in with other
                </button>
              </div>

              <p className="signup-link">
                Don't have an account? <a href="#">Sign up</a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;