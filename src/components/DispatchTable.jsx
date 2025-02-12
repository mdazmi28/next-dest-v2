import base_url from "@/base_url";
import React, { useState, useEffect } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'
import 'react-toastify/dist/ReactToastify.css';
import EditDispatchModal from "./modals/dispatch/EditDispatchModal";

const DispatchTable = ({ dispatchData, setDispatchData }) => {
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    // for edit data state
    // const [editData, setEditData] = useState(null);
    // const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDispatchId, setSelectedDispatchId] = useState(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsEditOpen(false);
                setIsDeleteOpen(false)
                setIsViewOpen(false)
                setSelectedData(null);
            }
        };

        if (isEditOpen || isDeleteOpen || isViewOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isEditOpen, isDeleteOpen, isViewOpen]);

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


    const handleView = (data) => {
        setSelectedData(data);
        setIsViewOpen(true);
    };

    const handleEdit = (data) => {
        setSelectedData(data);
        setIsEditOpen(true);
    };


    const handleDelete = (contact_id) => {
        setSelectedContactId(contact_id);
        setIsDeleteOpen(true);
    };


    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value || "",
        }));
    };

    const confirmDelete = async (id) => {
        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        console.log("User ID is:", userId);
        console.log("Deleting Contact ID:", id);

        if (!id) {
            console.error("ID is undefined or null!");
            return;
        }

        if (!authToken && !refreshToken) {
            toast.error("Please log in first.");
            return;
        }

        const deleteContactWithToken = async (token) => {
            const response = await fetch(`${base_url}/users/${userId}/dispatches/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Remove the deleted contact from the local state
                setDispatchData(dispatchData.filter((dispatch) => dispatch.dispatch_id !== id));
                setIsDeleteOpen(false);
                console.log("Dispatch deleted successfully");
            } else {
                console.log("Failed to delete Dispatch");
            }
        };

        // Function to refresh the token if expired
        const refreshAndRetry = async () => {
            try {
                console.log("Attempting to refresh token...");
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
                console.log("Token refreshed successfully:", authToken);

                // Retry the delete request with the new token
                await deleteContactWithToken(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await deleteContactWithToken(authToken);
            } else if (refreshToken) {
                await refreshAndRetry();
            }
        } catch (err) {
            if (err.message.includes("401")) {
                console.log("Token expired, attempting refresh...");
                await refreshAndRetry();
            } else {
                console.error("Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        }
    };


    return (

        <>
            <div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ref No.</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Sender/Reciver</th>
                                <th>Reciver</th>
                                {/* <th>Date</th> */}
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dispatchData.map((data) => (
                                <tr key={data.dispatch_id}>
                                    <td>
                                        <div className="font-bold">{data.reference_number}</div>
                                    </td>
                                    <td>{data.type.charAt(0).toUpperCase() + data.type.slice(1)}</td>

                                    <td>{data.subject}</td>
                                    <td>{data.sender}</td>
                                    <td>{data.recipient}</td>
                                    {/* <td>{data.sender}</td> */}
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${data.status === "pending"
                                                ? "bg-red-100 text-red-800"
                                                : data.status === "in_progress"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : data.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {data.status.charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' ')}
                                        </span>
                                    </td>
                                    {/* <td>{data.status}</td> */}
                                    {/* <td>{data.phone}</td> */}

                                    <td className="flex justify-between gap-5">
                                        <FaEye
                                            className="h-5 w-5 text-green-500 cursor-pointer"
                                            onClick={() => handleView(data)}
                                        />
                                        <FaEdit
                                            className="h-5 w-5 text-blue-500 cursor-pointer"
                                            onClick={() => handleEdit(data)}
                                        />
                                        <MdDelete
                                            className="h-5 w-5 text-red-500 cursor-pointer"
                                            onClick={() => handleDelete(data.dispatch_id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* View Modal */}
                {isViewOpen && selectedData && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h4 className="text-md font-bold">Dispatch Data</h4>
                            <p>Reference No.: {selectedData.reference_number}</p>
                            <p>Type: {selectedData.type}</p>
                            <p>Subject: {selectedData.subject}</p>
                            <p>Sender: {selectedData.sender}</p>
                            <p>Reciever: {selectedData.recipient}</p>
                            <p>Status: {selectedData.status}</p>
                            {/* <p>Phone: {selectedData.note}</p> */}

                            <div className="modal-action">
                                <button className="btn" onClick={() => setIsViewOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}

                {/* Edit Modal */}
                {isEditOpen && selectedData && (
                    <EditDispatchModal
                        isOpen={isEditOpen}
                        onClose={() => {
                            setIsEditOpen(false);
                            setSelectedData(null);
                        }}
                        data={selectedData}
                        setDispatchData={setDispatchData}
                    />
                )}


                {/* Delete Confirmation Modal */}
                {isDeleteOpen && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">
                                Are you sure you want to delete this contact?
                            </h3>
                            <p className="py-4">
                                This action cannot be undone. The contact will be permanently
                                removed.
                            </p>
                            <div className="modal-action">
                                <button className="btn btn-error" onClick={() => confirmDelete(selectedContactId)}>
                                    Delete
                                </button>
                                <button className="btn" onClick={() => setIsDeleteOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}


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
        </>
    );
};

export default DispatchTable;
