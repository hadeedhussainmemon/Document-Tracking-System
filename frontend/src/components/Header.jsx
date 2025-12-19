import React, { Fragment, useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import DocumentContext from '../context/document/DocumentContext';
import Container from './ui/Container';

const Header = () => {
    const authContext = useContext(AuthContext);
    const documentContext = useContext(DocumentContext);
    const location = useLocation();

    const { isAuthenticated, logout, user } = authContext;
    const { clearDocuments } = documentContext;

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
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            <Container className="flex justify-between items-center h-16">
                <div className="flex items-center">
                    <Link to='/' className="flex items-center gap-2 group">
                        <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">DocTracker</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:block">
                    <ul className="flex items-center gap-2">
                        {isAuthenticated ? authLinks : guestLinks}
                    </ul>
                </nav>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
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
                <div className="md:hidden bg-indigo-700 border-t border-indigo-600">
                    <Container className="py-4">
                        <ul className="flex flex-col gap-4">
                            {isAuthenticated ? (
                                <>
                                    <li className="flex items-center gap-3 pb-4 border-b border-indigo-600">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                                            {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user && user.username}</p>
                                            <p className="text-xs text-indigo-200">{user && user.role}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <Link to="/dashboard" className="block py-2 text-indigo-100 hover:text-white" onClick={() => setOpen(false)}>Dashboard</Link>
                                    </li>
                                    <li>
                                        <Link to="/documents" className="block py-2 text-indigo-100 hover:text-white" onClick={() => setOpen(false)}>All Documents</Link>
                                    </li>
                                    {(user && (user.role === 'admin' || user.role === 'technical-admin')) && (
                                        <>
                                            <li className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mt-2">Admin Tools</li>
                                            <li>
                                                <Link to="/admin/users" className="block py-2 pl-4 text-indigo-100 hover:text-white" onClick={() => setOpen(false)}>User Management</Link>
                                            </li>
                                            <li>
                                                <Link to="/admin/logs" className="block py-2 pl-4 text-indigo-100 hover:text-white" onClick={() => setOpen(false)}>Activity Logs</Link>
                                            </li>
                                            <li>
                                                <Link to="/reports" className="block py-2 pl-4 text-indigo-100 hover:text-white" onClick={() => setOpen(false)}>Reports</Link>
                                            </li>
                                        </>
                                    )}
                                    <li>
                                        <button onClick={() => { onLogout(); setOpen(false); }} className="flex items-center gap-2 w-full text-left py-2 text-red-300 hover:text-red-100 mt-2 border-t border-indigo-600 pt-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/login" className="block w-full text-center bg-white text-indigo-600 font-bold py-3 rounded-lg" onClick={() => setOpen(false)}>Login</Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="block w-full text-center text-white border border-white/30 font-bold py-3 rounded-lg hover:bg-white/10" onClick={() => setOpen(false)}>Register</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </Container>
                </div>
            )}
        </header>
    );
};

export default Header;
