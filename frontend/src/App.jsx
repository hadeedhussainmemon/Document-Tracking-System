import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AllDocuments from './pages/AllDocuments';
import DocumentPage from './pages/DocumentPage';
import AuthState from './context/AuthState';
import DocumentState from './context/document/DocumentState';
import AlertState from './context/alert/AlertState';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Alerts from './components/Alerts';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthState>
      <DocumentState>
        <AlertState>
          <Router>
            <div className='min-h-screen'>
              <Alerts />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={
                  <AdminRoute>
                    <Register />
                  </AdminRoute>
                } />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/documents" element={
                  <PrivateRoute>
                    <AllDocuments />
                  </PrivateRoute>
                } />
                    <Route path="/admin/users" element={
                      <AdminRoute roles={['admin','technical-admin','manager','ceo','hr']}>
                        <AdminUsers />
                      </AdminRoute>
                    } />
                <Route path="/document/:id" element={
                  <PrivateRoute>
                    <DocumentPage />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </Router>
        </AlertState>
      </DocumentState>
    </AuthState>
  );
}

// DocumentPage imported above

export default App;
