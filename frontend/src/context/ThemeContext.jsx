import React, { createContext, useReducer, useEffect } from 'react';

const ThemeContext = createContext();

const themeReducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_THEME':
            return {
                ...state,
                darkMode: !state.darkMode
            };
        case 'SET_THEME':
            return {
                ...state,
                darkMode: action.payload
            };
        default:
            return state;
    }
};

export const ThemeProvider = ({ children }) => {
    const initialState = {
        darkMode: localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    };

    const [state, dispatch] = useReducer(themeReducer, initialState);

    useEffect(() => {
        const root = window.document.documentElement;
        if (state.darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [state.darkMode]);

    const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

    return (
        <ThemeContext.Provider value={{ darkMode: state.darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
