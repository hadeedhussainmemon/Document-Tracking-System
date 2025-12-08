import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Spinner from './Spinner';

const PrivateRoute = ({ children }) => {
    const authContext = useContext(AuthContext);
    const { isAuthenticated, loading } = authContext;

    // Show loading overlay only if still authenticating (no existing authenticated user)
    if (loading && !isAuthenticated) {
        return <div className='flex items-center justify-center h-screen'><Spinner size={48}/></div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
