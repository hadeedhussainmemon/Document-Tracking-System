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

export default (state, action) => {
    switch (action.type) {
        case 'INIT':
            return state;
        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case USER_LOADING:
            return {
                ...state,
                loading: true
            };
        case LOGIN_REQUEST:
            return {
                ...state,
                loginLoading: true
            };
        case REGISTER_REQUEST:
            return {
                ...state,
                registerLoading: true
            };
        case REGISTER_SUCCESS:
            localStorage.setItem('token', action.payload?.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
                registerLoading: false
            };
        case LOGIN_SUCCESS:
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false,
                loginLoading: false
            };
        
        case REGISTER_FAIL:
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                    error: action.payload,
                    loginLoading: false,
                    registerLoading: false
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}