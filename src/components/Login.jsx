"use client"
import base_url from '@/base_url';
import { useFlowContext } from '@/context/FlowContext';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const Login = () => {
    // Local state for email and password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { checkLogin, setCheckLogin, loading, setLoading, error, setError } = useFlowContext();


    const loginPageChange = () => {
        setCheckLogin(!checkLogin)
    }
    // Handle form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Im in the block: " + base_url)
        // Basic validation
        if (!email || !password) {
            setError('Both fields are required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // API request for login
            console.log("im in try block")
            const response = await fetch(`${base_url}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error("The Email or Password is Incorrect")
                setError(`Error: ${response.status} - ${errorData.message}`);
            } else {
                const data = await response.json();
                console.log("Data is: ", data)

                if (data.access && data.refresh) {
                    setEmail(email); // Store email in context
                    setPassword(password); // Store password in context
                    localStorage.setItem('authToken', data.access); // Store token in local storage
                    localStorage.setItem('refreshToken', data.refresh)

                    const decodedToken = jwtDecode(data.access);
                    const userId = decodedToken.user_id;

                    Cookies.set('user_id', userId, { expires: 7, secure: true, sameSite: 'Strict' });

                    location.replace("/dashboard")
                } else {
                    setError('Login failed: No token received');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">


            <div className="h-screen flex justify-center items-center">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Use setEmail to update state
                                placeholder="Enter your email"
                                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Use setPassword to update state
                                placeholder="Enter your password"
                                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                        <button
                            type="submit"
                            className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 ${loading ? 'cursor-wait' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div className="flex justify-between">
                        <span>Don't have and account? </span>
                        <span
                            onClick={loginPageChange}
                            className="text-blue-500 cursor-pointer">Register Now</span>
                    </div>

                </div>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            // transition={Bounce}
            />
        </div>

    );
};

export default Login;

