import React from 'react';
import './LoginPage.css'; // This will provide the background
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    // This div is now just a container to center the form
    <div className="login-page-background">
      <LoginForm />
    </div>
  );
};

export default LoginPage;