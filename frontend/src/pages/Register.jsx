// frontend/src/pages/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AlertContext from '../context/alert/AlertContext';
import Header from '../components/Header';
import Container from '../components/ui/Container';
import Spinner from '../components/Spinner';
import Button from '../components/ui/Button';
import Footer from '../components/Footer';

const Register = () => {
    const authContext = useContext(AuthContext);
    const alertContext = useContext(AlertContext);

    const { register, error, clearErrors, isAuthenticated, loading, registerLoading } = authContext;
    const { setAlert } = alertContext;
    const navigate = useNavigate();

    useEffect(() => {
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
        password: '',
        password2: ''
    });

    const { username, password, password2 } = user;

    const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        if (username === '' || password === '' || password2 === '') {
            setAlert('Please enter all fields', 'danger');
        } else if (password !== password2) {
            setAlert('Passwords do not match', 'danger');
        } else {
            register({
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
                        <h2 className="text-2xl mb-4 text-center">Register</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" name="username" value={username} onChange={onChange} required />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" name="password" value={password} onChange={onChange} required minLength="6" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                                Confirm Password
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="confirm-password" type="password" placeholder="******************" name="password2" value={password2} onChange={onChange} required minLength="6" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button type='submit' disabled={registerLoading} className={`${registerLoading ? 'opacity-50 cursor-not-allowed' : ''} w-full text-lg py-3 bg-gradient-to-r from-indigo-600 to-pink-500`}>
                                {registerLoading ? <div className='flex items-center gap-2'><Spinner size={18}/>Registering...</div> : 'Register'}
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

export default Register;
