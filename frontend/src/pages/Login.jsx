import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AlertContext from '../context/alert/AlertContext';
import Header from '../components/Header';
import Container from '../components/ui/Container';
import Spinner from '../components/Spinner';
import Button from '../components/ui/Button';
import Footer from '../components/Footer';

const Login = () => {
    const authContext = useContext(AuthContext);
    const alertContext = useContext(AlertContext);

    const { login, error, clearErrors, isAuthenticated, loading, loginLoading } = authContext;
    const { setAlert } = alertContext;
    const navigate = useNavigate();

    useEffect(() => {
        // Wait until auth is fully loaded (not loading) to redirect
        if (isAuthenticated && !loading) {
            navigate('/dashboard');
        }

        if (error) {
            setAlert(error, 'danger');
            clearErrors();
        }
        // eslint-disable-next-line
    }, [error, isAuthenticated, loading, navigate]);

    const [user, setUser] = useState({
        username: '',
        password: ''
    });

    const { username, password } = user;

    const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        if (username === '' || password === '') {
            setAlert('Please fill in all fields', 'danger');
        } else {
            login({
                username,
                password
            });
        }
    };

    return (
        <div>
            <Header />
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                <Container>
                <div className="w-full max-w-md mx-auto">
                    <form className="form-card px-8 pt-8 pb-8 mb-4" onSubmit={onSubmit}>
                        <h2 className="text-2xl mb-4 text-center">Login</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" name="username" value={username} onChange={onChange} required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" name="password" value={password} onChange={onChange} required />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button type='submit' disabled={loginLoading} className={`${loginLoading ? 'opacity-50 cursor-not-allowed' : ''} w-full text-lg py-3 bg-gradient-to-r from-indigo-600 to-pink-500` }>
                                {loginLoading ? <div className='flex items-center gap-2'><Spinner size={18}/>Signing in...</div> : 'Sign In'}
                            </Button>
                        </div>
                    </form>
                </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
};

export default Login;
