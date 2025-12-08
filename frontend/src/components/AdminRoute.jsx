import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Spinner from './Spinner';

const AdminRoute = ({ children, roles = ['admin', 'technical-admin'] }) => {
    const authContext = useContext(AuthContext);
    const { isAuthenticated, loading, user } = authContext;

    if (loading && !isAuthenticated) return <div className='flex items-center justify-center h-screen'><Spinner size={48}/></div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!user || !roles.includes(user.role)) return <Navigate to="/" />;

    return children;
};

export default AdminRoute;
