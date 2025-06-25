import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
// This is what components will use to get the authentication data.
const AuthContext = createContext(null);

// 2. Create the Provider component
// This component will wrap our entire app and manage the state.
export const AuthProvider = ({ children }) => {
  // We use useState to keep track of the user. null means logged out.
  const [user, setUser] = useState(null);

  // A function to handle logging in
  // It takes the user's data and saves it in our state.
  const login = (userData) => {
    setUser(userData);
  };

  // A function to handle logging out
  // It clears the user's data from our state.
  const logout = () => {
    setUser(null);
  };

  // We pass the user's data, the login function, and the logout function
  // down to all children of this provider.
  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy access
// Instead of importing `useContext` and `AuthContext` in every file,
// components can just call this `useAuth()` hook.
export const useAuth = () => {
  return useContext(AuthContext);
};