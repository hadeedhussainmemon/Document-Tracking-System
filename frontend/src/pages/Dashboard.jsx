import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import DocumentForm from '../components/DocumentForm';
import CreateUserForm from '../components/admin/CreateUserForm';
import Documents from '../components/Documents';
import DocumentFilter from '../components/DocumentFilter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FabAdd from '../components/FabAdd';
import Container from '../components/ui/Container';

const Dashboard = () => {
    const authContext = useContext(AuthContext);
    const { user, loadUser } = authContext;

    useEffect(() => {
        // Only call loadUser if we don't have a user but a token exists
        if (!user && localStorage.getItem('token')) {
            loadUser();
        }
        // eslint-disable-next-line
    }, [user, loadUser]);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col overflow-x-hidden">
            <Header />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-20 md:pt-24">
                <Container className='animate-fade-in max-w-7xl mx-auto'>
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            Welcome back, <span className="text-blue-600">{user && user.username}</span>!
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Track, manage, and secure your documents with ease.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar / Form Area */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    New Document
                                </h2>
                                <DocumentForm />
                            </div>
                            
                            {/* Show admin create user panel for admin roles */}
                            {user && user.role === 'admin' && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                        Create User
                                    </h2>
                                    <CreateUserForm />
                                </div>
                            )}
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <svg className="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Your Documents
                                    </h2>
                                    <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                                        <DocumentFilter />
                                    </div>
                                </div>
                                <Documents />
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
            <FabAdd onClick={() => {
                const el = document.getElementById('document-form');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.querySelector('input, textarea, button')?.focus();
                } else {
                    // Default fallback: navigate to dashboard
                    window.location.href = '/dashboard';
                }
            }} />
        </div>
    );
};

export default Dashboard;
