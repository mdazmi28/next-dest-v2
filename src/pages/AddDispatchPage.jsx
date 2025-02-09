'use client'
import React, { useState } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import { ImCross } from "react-icons/im";
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import base_url from '@/base_url';

const AddDispatchPage = () => {
    const { addDispatchStage, setDispatchStage, } = useFlowContext() || { addDispatchStage: false, setDispatchStage: () => { } };

    const [dispatchData, setDispatchData] = useState({
        reference_number: '',
        type: '',
        subject: '',
        sender: '',
        recipient: '',
        status: '',
        note: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDispatchData((prev) => ({ ...prev, [name]: value }));
    };

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            if (!decoded.exp) return false; // If no expiry time, assume it's valid
            return decoded.exp * 1000 < Date.now(); // Convert exp to milliseconds
        } catch (error) {
            console.error("Invalid token:", error);
            return true; // Assume expired if decoding fails
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!userId) {
            console.error("User ID not found in cookies.");
            toast.error("User ID is missing. Please log in again.");
            return;
        }

        const data = {
            user: parseInt(userId),
            reference_number: dispatchData.reference_number,
            type: dispatchData.type,
            subject: dispatchData.subject,
            sender: dispatchData.sender,
            recipient: dispatchData.recipient,
            status: dispatchData.status,
            note: dispatchData.note || "",
        };

        console.log('Form Data Submitted:', data);

        const submitContact = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/dispatches/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error: ${response.status} - ${errorData.message}`);
                }

                console.log("Dispatch added successfully");
                toast.success("Dispatch added successfully!");
                setDispatchStage(!addDispatchStage);
            } catch (err) {
                console.error("Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        const refreshAndRetry = async () => {
            try {
                console.log("Attempting to refresh token...");
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error("Token refresh failed. Please log in again.");
                }

                const refreshData = await refreshResponse.json();
                authToken = refreshData.token;
                localStorage.setItem("authToken", authToken);
                console.log("Token refreshed successfully:", authToken);

                // Retry submitting the contact with the new token
                await submitContact(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await submitContact(authToken);
            } else if (refreshToken) {
                await refreshAndRetry();
            } else {
                throw new Error("No valid authentication tokens found.");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.message || "An error occurred.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="w-full md:w-3/4 lg:w-2/3 bg-white shadow-2xl rounded-lg p-4">
                <div className='flex justify-end cursor-pointer text-red-500 pb-4' onClick={() => { setDispatchStage(!addDispatchStage) }}>
                    <ImCross />
                </div>
                <div className='flex justify-end'>
                    <input type="file" className="file-input file-input-bordered file-input-info w-full max-w-xs" />
                </div>
                <h2 className="text-3xl font-bold text-center mb-6">Submit Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col md:flex-row md:justify-around'>

                        {/* dispatchData Information */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-700">dispatchData Information</h3>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Name</label>
                                <input
                                    type="text"
                                    name="reference_number"
                                    value={dispatchData.reference_number}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Designation</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={dispatchData.type}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={dispatchData.subject}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input
                                    type="text"
                                    name="sender"
                                    value={dispatchData.sender}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div>
                            {/* <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                <input
                                    type="text"
                                    name="sender"
                                    value={dispatchData.sender}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div> */}
                        </div>

                        {/* dispatchData Information */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-700">dispatchData Information</h3>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">dispatchData Name</label>
                                <input
                                    type="text"
                                    name="recipient"
                                    value={dispatchData.recipient}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Address</label>
                                <input
                                    type="text"
                                    name="status"
                                    value={dispatchData.status}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input
                                    type="text"
                                    name="note"
                                    value={dispatchData.note}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div>
                            {/* <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Website</label>
                                <input
                                    type="url"
                                    name="web"
                                    value={dispatchData.web}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div> */}
                            {/* <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={dispatchData.phone}
                                    onChange={handleChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
                                />
                            </div> */}
                        </div>

                    </div>
                    {/* Submit Button */}
                    <div className="col-span-2 text-center mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default AddDispatchPage;