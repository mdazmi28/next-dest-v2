'use client'
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import base_url from '@/base_url';

const AddDispatchModal = ({ isOpen, onClose }) => {
    const [dispatchData, setDispatchData] = useState({
        reference_number: '',
        type: '',
        subject: '',
        sender: '',
        recipient: '',
        status: '',
        note: '',
    });

    const [files, setFiles] = useState([]);
    const [fileNotes, setFileNotes] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDispatchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleFileNoteChange = (e, index) => {
        const newNotes = [...fileNotes];
        newNotes[index] = e.target.value;
        setFileNotes(newNotes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!userId) {
            toast.error("User ID is missing. Please log in again.");
            return;
        }

        // Format the data according to API requirements
        const formData = {
            user: parseInt(userId),
            reference_number: dispatchData.reference_number,
            type: dispatchData.type,
            subject: dispatchData.subject,
            sender: dispatchData.sender,
            recipient: dispatchData.recipient,
            status: dispatchData.status,
            note: dispatchData.note || "",
            attachments: ["http://example.com"], // Replace with actual file URLs if needed
            attachment_notes: fileNotes.length > 0 ? fileNotes : [""]
        };

        console.log("Submitting data:", formData); // Debug log

        const submitDispatch = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/dispatches/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData); // Debug log
                    throw new Error(`Error: ${response.status} - ${JSON.stringify(errorData)}`);
                }

                const responseData = await response.json();
                console.log("API Success Response:", responseData); // Debug log

                toast.success("Dispatch added successfully!");
                onClose();
            } catch (err) {
                console.error("Submit Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        const refreshAndRetry = async () => {
            try {
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error("Token refresh failed. Please log in again.");
                }

                const refreshData = await refreshResponse.json();
                authToken = refreshData.access;
                localStorage.setItem("authToken", authToken);

                await submitDispatch(authToken);
            } catch (err) {
                console.error("Refresh Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        try {
            if (authToken) {
                await submitDispatch(authToken);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Add New Dispatch</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Number
                            </label>
                            <input
                                type="text"
                                name="reference_number"
                                value={dispatchData.reference_number}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <input
                                type="text"
                                name="type"
                                value={dispatchData.type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={dispatchData.subject}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sender
                            </label>
                            <input
                                type="text"
                                name="sender"
                                value={dispatchData.sender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipient
                            </label>
                            <input
                                type="text"
                                name="recipient"
                                value={dispatchData.recipient}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={dispatchData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="in_progress">In Progress</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note
                            </label>
                            <textarea
                                name="note"
                                value={dispatchData.note}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Attachments
                            </label>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                            />
                        </div>

                        {files.map((file, index) => (
                            <div key={index}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note for {file.name}
                                </label>
                                <input
                                    type="text"
                                    value={fileNotes[index] || ''}
                                    onChange={(e) => handleFileNoteChange(e, index)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                />
                            </div>
                        ))}

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#0BBFBF] text-white rounded-md hover:bg-[#89D9D9]"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddDispatchModal;