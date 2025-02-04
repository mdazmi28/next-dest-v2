import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'
import base_url from "@/base_url";
import 'react-toastify/dist/ReactToastify.css';

const AppointmentTable = ({ appointmentData, setAppointmentData }) => {
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [editData, setEditData] = useState(null);
     const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

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
        setEditData(data);
        setIsEditOpen(true);
    };

    const handleDelete = (appointment_id) => {
        setSelectedAppointmentId(appointment_id);
        setIsDeleteOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const saveEdit = () => {
        const updatedAppointments = appointmentData.map((appointment) =>
            appointment.appointment_id === editData.appointment_id ? editData : appointment
        );
        setAppointmentData(updatedAppointments);
        setIsEditOpen(false);
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
            const response = await fetch(`${base_url}/users/${userId}/appointments/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Remove the deleted contact from the local state
                setAppointmentData(appointmentData.filter((appointment) => appointment.appointment_id !== id));
                setIsDeleteOpen(false);
                console.log("Contact deleted successfully");
            } else {
                console.log("Failed to delete contact");
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
        <div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointmentData.map((data, index) => (
                            <tr key={data.appointment_id || index}>
                                {/* Time */}
                                <td>
                                    <div className="font-bold">
                                        {new Date(data.start_time).toLocaleDateString("en-GB")}
                                        {/* {new Date(data.start_time).toISOString().split("T")[0].split("-").reverse().join("-")} */}


                                    </div>
                                </td>
                                {/* With */}
                                <td>{data.title}</td>
                                {/* Designation */}
                                <td>{data.description}</td>
                                {/* Location */}
                                <td>{data.location}</td>
                                {/* Action */}
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
                                        onClick={() => handleDelete(data.appointment_id)}
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
                        <h4 className="text-md font-bold">Appointment Details</h4>
                        <p>Title: {selectedData.title}</p>
                        <p>Description: {selectedData.description}</p>
                        <p>Location: {selectedData.location}</p>
                        <p>
                            On: {format(new Date(selectedData.start_time), 'dd-MM-yyyy HH:mm')}
                        </p>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setIsViewOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && editData && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h4 className="text-2xl font-bold">Edit Appointment</h4>
                        <form>
                            <div className="form-control">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editData.title}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={editData.description}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={editData.location}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="start_time"
                                    value={editData.start_time}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                        </form>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={saveEdit}>
                                Save
                            </button>
                            <button className="btn" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            Are you sure you want to delete this appointment?
                        </h3>
                        <p className="py-4">This action cannot be undone.</p>
                        <div className="modal-action">
                            <button className="btn btn-error" onClick={() => confirmDelete(selectedAppointmentId)}>
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
    );
};

export default AppointmentTable;