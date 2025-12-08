import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AlertContext from '../context/alert/AlertContext';

test('renders login heading', () => {
  const authValue = { login: jest.fn(), error: null, clearErrors: jest.fn(), isAuthenticated: false, loading: false };
  const alertValue = { setAlert: jest.fn() };
  render(
    <AuthContext.Provider value={authValue}>
      <AlertContext.Provider value={alertValue}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AlertContext.Provider>
    </AuthContext.Provider>
  );
  const heading = screen.getByText(/Login/i);
  expect(heading).toBeInTheDocument();
});
