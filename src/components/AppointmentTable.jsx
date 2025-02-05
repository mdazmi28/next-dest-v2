import React, { useState, useEffect } from 'react';
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
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [editData, setEditData] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsEditOpen(false);
                setIsDeleteOpen(false)
                setIsViewOpen(false)
                setEditData(null);
            }
        };

        if (isEditOpen) {
            window.addEventListener("keydown", handleKeyDown);
        } else if (isDeleteOpen) {
            window.addEventListener("keydown", handleKeyDown);
        } else if (isViewOpen) {
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
        setEditData({ ...data });
        setSelectedAppointmentId(data.appointment_id);
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
            [name]: value || "",
        }));
    };

    const saveEdit = async (id) => {
        const userId = Cookies.get("user_id");
        let authToken = localStorage.getItem("authToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!userId || !editData) {
            toast.error("User ID or contact data is missing!");
            return;
        }

        const requestBody = {
            user: parseInt(userId),
            name: editData.name || "",
            email: editData.email || "",
            phone: editData.phone || "",
            designation: editData.designation || "",
            organization: editData.organization || "",
            tags: [],
            note: editData.note || "",
        };

        const updateContactWithToken = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/appointments/${id}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                    const updatedAppointment = await response.json();

                    // Update the contact in the state immediately
                    setContactData((prevContacts) =>
                        prevContacts.map((appointment) =>
                            appointment.appointment_id === id
                                ? {
                                    ...contact,
                                    name: updatedAppointment.name,
                                    email: updatedAppointment.email,
                                    phone: updatedAppointment.phone,
                                    designation: updatedAppointment.designation,
                                    organization: updatedAppointment.organization,
                                    note: updatedAppointment.note
                                }
                                : contact
                        )
                    );

                    // toast.success("Contact updated successfully!");
                    setIsEditOpen(false);
                    setEditData(null); // Clear the edit data
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || "Failed to update contact.");
                }
            } catch (error) {
                console.error("Error updating contact:", error);
                toast.error("An error occurred while updating.");
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
                await updateContactWithToken(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error("Session expired. Please log in again.");
            }
        };

        if (authToken && !isTokenExpired(authToken)) {
            await updateContactWithToken(authToken);
        } else if (refreshToken) {
            await refreshAndRetry();
        } else {
            toast.error("Authentication error. Please log in.");
        }
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
                location.reload();
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
                        {appointmentData.slice().reverse().map((data, index) => (
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
                            {/* <div className="form-control">
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
                            </div> */}

                            <div className="space-y-4">
                                {/* Appointment Subject */}
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-600">Appointment Subject</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editData.title}
                                        onChange={handleEditChange}
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                {/* Appointment Details */}
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-600">Appointment Details</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={editData.description}
                                        onChange={handleEditChange}
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Start Date Input */}
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_time"
                                            value={editData.start_time}
                                            onChange={handleEditChange}
                                            className="p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            required
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                        <div className="flex gap-2">
                                            {/* Hour Selection */}
                                            <select
                                                name="hour"
                                                value={editData.hour}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                required
                                            >
                                                <option value="">Hour</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>

                                            {/* Minute Selection */}
                                            <select
                                                name="minute"
                                                value={editData.minute}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                required
                                            >
                                                <option value="">Minute</option>
                                                {["00", "15", "30", "45"].map((minute) => (
                                                    <option key={minute} value={minute}>{minute}</option>
                                                ))}
                                            </select>

                                            {/* AM/PM Selection */}
                                            <select
                                                name="ampm"
                                                value={editData.ampm}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                required
                                            >
                                                <option value="">AM/PM</option>
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>



                                {/* End Date */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Start Date Input */}
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            name="end_time"
                                            value={editData.end_time}
                                            onChange={handleEditChange}
                                            className="p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            required
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                        <div className="flex gap-2">
                                            {/* Hour Selection */}
                                            <select
                                                name="end_hour"
                                                value={editData.end_hour}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                required
                                            >
                                                <option value="">Hour</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((end_hour) => (
                                                    <option key={end_hour} value={end_hour}>{end_hour}</option>
                                                ))}
                                            </select>

                                            {/* Minute Selection */}
                                            <select
                                                name="end_minute"
                                                value={editData.end_minute}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                required
                                            >
                                                <option value="">Minute</option>
                                                {["00", "15", "30", "45"].map((end_minute) => (
                                                    <option key={end_minute} value={end_minute}>{end_minute}</option>
                                                ))}
                                            </select>

                                            {/* AM/PM Selection */}
                                            <select
                                                name="end_ampm"
                                                value={editData.end_ampm}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                required
                                            >
                                                <option value="">AM/PM</option>
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>



                                {/* Meeting Type */}
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-600">Meeting Type</label>
                                    <select
                                        name="meeting_type"
                                        value={editData.meeting_type}
                                        onChange={handleEditChange}
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="physical">Physical</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>

                                {/* Conditional Location Input */}
                                {editData.meeting_type === 'physical' ? (
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-600">Physical Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={editData.location}
                                            onChange={handleEditChange}
                                            placeholder="Enter the location address"
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-600">Online Meeting Link</label>
                                        <input
                                            type="url"
                                            name="location"
                                            value={editData.location}
                                            onChange={handleEditChange}
                                            placeholder="Enter the online meeting link"
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-600">Is Recurring</label>
                                    <select
                                        name="is_recurring"
                                        value={editData.is_recurring}
                                        onChange={handleEditChange}
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-600">Note</label>
                                    <input
                                        type="text"
                                        name="note"
                                        value={editData.note}
                                        onChange={handleEditChange}
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="text-center mt-6">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                                    >
                                        Submit
                                    </button>
                                </div>
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