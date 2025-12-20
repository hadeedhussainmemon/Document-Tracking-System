import React, { Fragment, useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import DocumentContext from '../context/document/DocumentContext';
import ThemeContext from '../context/ThemeContext';
import Container from './ui/Container';

const Header = () => {
    const authContext = useContext(AuthContext);
    const documentContext = useContext(DocumentContext);
    const themeContext = useContext(ThemeContext);
    const location = useLocation();

    const { isAuthenticated, logout, user } = authContext;
    const { clearDocuments } = documentContext;
    const { darkMode, toggleTheme } = themeContext;

    const onLogout = () => {
        logout();
        clearDocuments();
    };

    const [open, setOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const authLinks = (
        <Fragment>
            {isAuthenticated && (
                <li>
                    <Link
                        to="/dashboard"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                    >
                        Dashboard
                    </Link>
                </li>
            )}

            {/* Admin Dropdown Desktop */}
            {isAuthenticated && (user && (user.role === 'admin' || user.role === 'technical-admin')) && (
                <li className="relative group">
                    <button
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${location.pathname.startsWith('/admin') || location.pathname === '/reports' ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                    >
                        Admin
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden hidden group-hover:block animate-fade-in origin-top-left transform transition-all">
                        <Link to="/admin/users" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                            User Management
                        </Link>
                        <Link to="/admin/logs" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                            Activity Logs
                        </Link>
                        <Link to="/reports" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                            Reports
                        </Link>
                    </div>
                </li>
            )}

            {isAuthenticated && (
                <li>
                    <Link
                        to="/documents"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/documents') ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                    >
                        All Documents
                    </Link>
                </li>
            )}
            <li className="ml-2 pl-2 border-l border-white/20 flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">{user && user.username}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </li>
        </Fragment>
    );

    const guestLinks = (
        <Fragment>
            <li>
                <Link to='/login'>
                    <button className='bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-50 transition-colors'>
                        Login
                    </button>
                </Link>
            </li>
            <li>
                <Link to='/register' className="text-white/90 hover:text-white font-medium px-3 py-2">
                    Register
                </Link>
            </li>
        </Fragment>
    );

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 text-gray-800 sticky top-0 z-50 transition-all duration-300">
            <Container className="flex justify-between items-center h-16 md:h-18">
                <div className="flex items-center">
                    <Link to='/' className="flex items-center gap-2 group">
                        <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white w-6 h-6 md:w-7 md:h-7">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">DocTracker</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:block">
                    <ul className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Fragment>
                                <li>
                                    <Link
                                        to="/dashboard"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                {(user && (user.role === 'admin' || user.role === 'technical-admin')) && (
                                    <li className="relative group">
                                        <button
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${location.pathname.startsWith('/admin') || location.pathname === '/reports' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                        >
                                            Admin
                                            <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden hidden group-hover:block animate-fade-in origin-top-left z-50 border border-gray-100 p-1">
                                            <Link to="/admin/users" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors">
                                                User Management
                                            </Link>
                                            <Link to="/admin/logs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors">
                                                Activity Logs
                                            </Link>
                                            <Link to="/reports" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors">
                                                Reports
                                            </Link>
                                        </div>
                                    </li>
                                )}

                                <li>
                                    <Link
                                        to="/documents"
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/documents') ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        Documents
                                    </Link>
                                </li>
                                <li className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-3">
                                    <div className="flex items-center gap-2 group cursor-default">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                                            {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="hidden lg:inline text-sm font-semibold text-gray-800">{user && user.username}</span>
                                            <span className="hidden lg:inline text-[10px] uppercase font-bold text-gray-400 tracking-wider">{user && user.role}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Logout"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </li>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <li>
                                    <Link to='/login'>
                                        <button className='text-gray-600 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors'>
                                            Login
                                        </button>
                                    </Link>
                                </li>
                                <li>
                                    <Link to='/register' className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                        Get Started
                                    </Link>
                                </li>
                            </Fragment>
                        )}
                    </ul>
                </nav>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {open ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu Dropdown */}
            {open && (
                <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in absolute w-full left-0 z-40 shadow-xl">
                    <Container className="py-4 px-4">
                        <ul className="flex flex-col gap-2">
                            {isAuthenticated ? (
                                <>
                                    <li className="flex items-center gap-4 pb-4 mb-2 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
                                            {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{user && user.username}</p>
                                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{user && user.role}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-indigo-600 font-medium" onClick={() => setOpen(false)}>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/documents" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors" onClick={() => setOpen(false)}>
                                            All Documents
                                        </Link>
                                    </li>
                                    {(user && (user.role === 'admin' || user.role === 'technical-admin')) && (
                                        <>
                                            <li className="px-4 py-2 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Tools</li>
                                            <li>
                                                <Link to="/admin/users" className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg ml-2 border-l-2 border-gray-100 hover:border-indigo-500 transition-all" onClick={() => setOpen(false)}>User Management</Link>
                                            </li>
                                            <li>
                                                <Link to="/admin/logs" className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg ml-2 border-l-2 border-gray-100 hover:border-indigo-500 transition-all" onClick={() => setOpen(false)}>Activity Logs</Link>
                                            </li>
                                            <li>
                                                <Link to="/reports" className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg ml-2 border-l-2 border-gray-100 hover:border-indigo-500 transition-all" onClick={() => setOpen(false)}>Reports</Link>
                                            </li>
                                        </>
                                    )}
                                    <li className="pt-4 mt-2 border-t border-gray-100">
                                        <button onClick={() => { onLogout(); setOpen(false); }} className="flex items-center justify-center gap-2 w-full py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors">
                                            Log Out
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <div className="space-y-3 pt-2">
                                    <li>
                                        <Link to="/login" className="block w-full text-center text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 border border-gray-200" onClick={() => setOpen(false)}>Login</Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="block w-full text-center bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700" onClick={() => setOpen(false)}>Get Started</Link>
                                    </li>
                                </div>
                            )}
                        </ul>
                    </Container>
                </div>
            )}
        </header>
    );
};

export default Header;
