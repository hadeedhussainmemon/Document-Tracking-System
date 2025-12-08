import React, { useReducer } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import authReducer from './authReducer';
import setAuthToken from '../utils/setAuthToken';
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    USER_LOADING,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGIN_REQUEST,
    REGISTER_REQUEST,
    LOGOUT,
    CLEAR_ERRORS
} from './types';

const AuthState = props => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: false,
        loginLoading: false,
        registerLoading: false,
        user: null,
        error: null
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = React.useCallback(async () => {
        dispatch({ type: USER_LOADING });
        if (localStorage.token) {
            setAuthToken(localStorage.token);
        }

        try {
            const res = await axios.get('/auth');

            dispatch({
                type: USER_LOADED,
                payload: res.data
            });
        } catch (err) {
            console.error('Load user error:', err.response?.data || err.message);
            dispatch({ type: AUTH_ERROR });
        }
    }, []);

    // Automatically load user on mount if token exists
    React.useEffect(() => {
        if (localStorage.getItem('token')) loadUser();
    }, []);

    // Register User
    const register = async formData => {
        dispatch({ type: REGISTER_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('/auth/register', formData, config);

            dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data
            });
            // Ensure token is set on axios for subsequent requests
            setAuthToken(res.data.token);
            loadUser();
        } catch (err) {
            dispatch({
                type: REGISTER_FAIL,
                payload: err.response?.data?.msg || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Server Error'
            });
        }
    };

    // Login User
    const login = async formData => {
        dispatch({ type: LOGIN_REQUEST });
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('/auth/login', formData, config);

            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data
            });

            // Immediately set auth token on axios defaults for subsequent calls
            setAuthToken(res.data.token);

            loadUser();
        } catch (err) {
            dispatch({
                type: LOGIN_FAIL,
                payload: err.response?.data?.msg || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Server Error'
            });
        }
    };

    // Admin creates users
    const createUserByAdmin = async formData => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('/auth/create', formData, config);
            // Optionally return data for UI
            return { success: true, data: res.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.msg || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Server Error' };
        }
    };

    // Logout (clear token & axios default header)
    const logout = () => {
        setAuthToken(null);
        dispatch({ type: LOGOUT });
    };

    // Clear Errors
    const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                loginLoading: state.loginLoading,
                registerLoading: state.registerLoading,
                user: state.user,
                error: state.error,
                register,
                loadUser,
                login,
                createUserByAdmin,
                logout,
                clearErrors
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthState;
