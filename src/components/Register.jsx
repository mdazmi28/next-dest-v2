"use client"

import base_url from '@/base_url';
import { useFlowContext } from '@/context/FlowContext';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Register = () => {
    // Local state for user registration
    const [user_name, setuserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');

    // Context for loading and error state
    const { checkLogin, setCheckLogin, setLoading, loading, setError, error } = useFlowContext();

    const loginPageChange = () => {
        setCheckLogin(!checkLogin)
    }

    // Handle form submission for registration
    const handleRegister = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!user_name || !email || !password || !role || !phone) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // API request for registration
            const response = await fetch(`${base_url}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name : user_name,
                    password,
                    role,
                    phone
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // setError(`Error: ${response.status} - ${errorData.message}`);
                toast.error("Username or Email has already taken")
            } else {
                const data = await response.json();
                if (data.message === "User registered successfully!") {
                
                    location.replace("/")
                } else {
                    // setError('Registration failed: Unexpected response');
                    toast.error("Registration failed: Unexpected response")
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
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="user_name"
                                value={user_name}
                                onChange={(e) => setuserName(e.target.value)} // Update username state
                                placeholder="Enter your name"
                                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Update email state
                                placeholder="Enter your email"
                                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="phone"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)} // Update Phone state
                                placeholder="Enter your phone"
                                className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                                type="role"
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)} // Update role state
                                placeholder="Enter your role"
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
                                onChange={(e) => setPassword(e.target.value)} // Update password state
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
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <div className="flex justify-between">
                        <span>Already have an account? </span>
                        <span
                            onClick={loginPageChange}
                            className="text-blue-500 cursor-pointer">Login</span>
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

export default Register;



