'use client'
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import base_url from '@/base_url';

const AddDispatchModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const initialState = {
        reference_number: '',
        type: '',
        subject: '',
        recipient: '',
        status: '',
        // note: '',
    };

    const [dispatchData, setDispatchData] = useState({
        reference_number: '',
        type: '',
        subject: '',
        recipient: '',
        status: '',
        // note: '',
    });
    const [files, setFiles] = useState([]);
    // const [fileNotes, setFileNotes] = useState({}); // Object to store notes for each file
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);


    const resetForm = () => {
        setDispatchData(initialState);
        setFiles([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDispatchData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        // Also remove the note for this file if it exists
        // setFileNotes(prevNotes => {
        //     const newNotes = { ...prevNotes };
        //     delete newNotes[indexToRemove];
        //     return newNotes;
        // });
    };

    // const handleFileNoteChange = (e, fileIndex) => {
    //     setFileNotes(prevNotes => ({
    //         ...prevNotes,
    //         [fileIndex]: e.target.value
    //     }));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!userId) {
            toast.error("User ID is missing. Please log in again.");
            return;
        }

        // Create FormData instance
        const formData = new FormData();

        // Append basic dispatch data
        formData.append('user', userId);
        formData.append('reference_number', dispatchData.reference_number);
        formData.append('type', dispatchData.type);
        formData.append('subject', dispatchData.subject);
        formData.append('sender', userId);
        formData.append('recipient', dispatchData.recipient);
        formData.append('status', dispatchData.status);
        // formData.append('note', dispatchData.note || "");

        // console.log("Submitting data:", formData); // Debug log

        files.forEach((file, index) => {
            formData.append('attachments', file);
            // if (fileNotes[index]) {
            //     formData.append(`attachment_notes_${index}`, fileNotes[index]);
            // }
        });

        if (files.length > 0) {
            formData.append('attachments', files[0]); // Only taking the first file
        }
        const submitDispatch = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/dispatches/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    throw new Error(`Error: ${response.status} - ${JSON.stringify(errorData)}`);
                }

                const responseData = await response.json();
                console.log("API Success Response:", responseData);

                toast.success("Dispatch added successfully!");
                resetForm();
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
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

                        {/* <div>
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
                        </div> */}

                        <div className="form-control">
                            <label className="label">Type</label>
                            <select
                                name="type"
                                value={dispatchData.type}
                                onChange={handleInputChange}
                                className="select select-bordered w-full"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Incoming">Incoming</option>
                                <option value="Outgoing">Outgoing</option>
                            </select>
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
                                Attachments
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                multiple // Enable multiple file selection
                            />
                        </div>

                        {/* {files.length > 0 && (
                    <div className="text-sm text-gray-600">
                        Selected file: {files[0].name} ({(files[0].size / 1024).toFixed(2)} KB)
                    </div>
                )} */}


                        {files.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">Selected Files:</h4>
                                {files.map((file, index) => (
                                    <div key={index} className="flex flex-col space-y-2 p-3 border rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">
                                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        {/* <input
                                    type="text"
                                    placeholder="Add a note for this file (optional)"
                                    value={fileNotes[index] || ''}
                                    onChange={(e) => handleFileNoteChange(e, index)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBFBF]"
                                /> */}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* {files.map((file, index) => (
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
                        ))} */}

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0BBFBF] text-white hover:bg-[#89D9D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:col-start-2 sm:text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Adding...' : 'Add Dispatch'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:mt-0 sm:col-start-1 sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default AddDispatchModal;