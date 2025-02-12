import React, { useState } from 'react';
import { toast } from "react-toastify";
import base_url from '@/base_url';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const EditDispatchModal = ({ isOpen, onClose, data, setDispatchData }) => {
    if (!isOpen || !data) return null;

    const [editData, setEditData] = useState({
        reference_number: data.reference_number || '',
        type: data.type || '',
        subject: data.subject || '',
        recipient: data.recipient || '',
        status: data.status || '',
        note: data.note || '',
    });
    const [file, setFile] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
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

        // Create FormData instance
        const formData = new FormData();
        
        // Only append non-empty values
        if (editData.reference_number) formData.append('reference_number', editData.reference_number);
        if (editData.type) formData.append('type', editData.type);
        if (editData.subject) formData.append('subject', editData.subject);
        formData.append('sender', userId); // Always append sender as userId
        if (editData.recipient) formData.append('recipient', editData.recipient);
        if (editData.status) formData.append('status', editData.status);
        if (editData.note) formData.append('note', editData.note);
        
        // Append file if selected
        if (file) {
            formData.append('attachments', file);
        }

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
                
                // Update the dispatches list
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

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h4 className="text-2xl font-bold mb-4">Edit Dispatch</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
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
                    </div>

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
                            <option value="incoming">Incoming</option>
                            <option value="outgoing">Outgoing</option>
                        </select>
                    </div>

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
                        <label className="label">Recipient</label>
                        <input
                            type="text"
                            name="recipient"
                            value={editData.recipient}
                            onChange={handleInputChange}
                            className="input input-bordered"
                            required
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
                        <label className="label">Note</label>
                        <textarea
                            name="note"
                            value={editData.note}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered"
                            rows="3"
                        />
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
    );
};

export default EditDispatchModal;