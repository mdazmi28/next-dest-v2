'use client'
import React, { useState } from 'react';
import { toast } from "react-toastify";
import base_url from '@/base_url';
import Cookies from 'js-cookie';

const EditDispatchModal = ({ isOpen, onClose, data, setDispatchData }) => {
    if (!isOpen || !data) return null;

    const [editData, setEditData] = useState({
        // reference_number: data.reference_number || '',
        type: data.type || '',
        subject: data.subject || '',
        sender: data.sender || '',
        recipient: data.recipient || '',
        status: data.status || '',
        note: data.note || '',
    });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal')) {
            onClose();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Add file size validation (5MB limit)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!userId) {
            toast.error("User ID is missing. Please log in again.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();

        // Handle sender/recipient logic
        if (editData.type === 'Incoming') {
            formData.append('sender', editData.sender);
            formData.append('recipient', userId);
        } else if (editData.type === 'Outgoing') {
            formData.append('sender', userId);
            formData.append('recipient', editData.recipient);
        }

        // Append other form data
        // formData.append('reference_number', editData.reference_number);
        formData.append('type', editData.type);
        formData.append('subject', editData.subject);
        formData.append('status', editData.status);
        if (editData.note) formData.append('note', editData.note);
        if (file) formData.append('attachments', file);

        const submitDispatch = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/dispatches/${data.dispatch_id}/`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to update dispatch");
                }

                const responseData = await response.json();

                setDispatchData(prev =>
                    prev.map(dispatch =>
                        dispatch.dispatch_id === data.dispatch_id ? responseData : dispatch
                    )
                );

                toast.success("Dispatch updated successfully!");
                onClose();
            } catch (err) {
                console.error("Submit Error:", err);
                toast.error(err.message || "An error occurred while updating.");
            } finally {
                setIsLoading(false);
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
                toast.error("Session expired. Please log in again.");
                setIsLoading(false);
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
            setIsLoading(false);
        }
    };

    return (
        <div className="modal modal-open" onClick={handleOverlayClick}>
            <div className="modal-box">
                <h4 className="text-2xl font-bold mb-4">Edit Dispatch</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* <div className="form-control">
                        <label className="label">Reference Number</label>
                        <input
                            type="text"
                            name="reference_number"
                            value={editData.reference_number}
                            onChange={handleInputChange}
                            className="input input-bordered"
                            required
                            maxLength={50}
                        />
                    </div> */}

                    <div className="form-control">
                        <label className="label">Type</label>
                        <select
                            name="type"
                            value={editData.type}
                            onChange={handleInputChange}
                            className="select select-bordered w-full"
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Incoming">Incoming</option>
                            <option value="Outgoing">Outgoing</option>
                        </select>
                    </div>

                    {editData.type && (
                        <div className="form-control">
                            <label className="label">
                                {editData.type === 'Incoming' ? 'Sender' : 'Recipient'}
                            </label>
                            <input
                                type="text"
                                name={editData.type === 'Incoming' ? 'sender' : 'recipient'}
                                value={editData.type === 'Incoming' ? editData.sender : editData.recipient}
                                onChange={handleInputChange}
                                className="input input-bordered"
                                required
                            />
                        </div>
                    )}

                    <div className="form-control">
                        <label className="label">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={editData.subject}
                            onChange={handleInputChange}
                            className="input input-bordered"
                            required
                            maxLength={255}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">Status</label>
                        <select
                            name="status"
                            value={editData.status}
                            onChange={handleInputChange}
                            className="select select-bordered w-full"
                            required
                        >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">Attachment</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                        />
                        {data.attachments && (
                            <div className="text-sm text-gray-600 mt-1">
                                Current file: {data.attachments}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0BBFBF] text-white hover:bg-[#89D9D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:col-start-2 sm:text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Updating...' : 'Update Dispatch'} 
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
        </div>
    );
};

export default EditDispatchModal;