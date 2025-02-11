import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'
import base_url from "@/base_url";
import 'react-toastify/dist/ReactToastify.css';
import { useFlowContext } from '@/context/FlowContext';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);

const AppointmentTable = ({ appointmentData, setAppointmentData }) => {
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { appointments } = useFlowContext();

    // Initialize editData with all possible fields
    const [editData, setEditData] = useState({
        meeting_type: "physical",
        location: "",
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        hour: "",
        minute: "",
        ampm: "",
        end_hour: "",
        end_minute: "",
        end_ampm: "",
        is_recurring: true,
        note: ""
    });

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsEditOpen(false);
                setIsDeleteOpen(false);
                setIsViewOpen(false);
                clearForm();
            }
        };

        if (isEditOpen || isDeleteOpen || isViewOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isEditOpen, isDeleteOpen, isViewOpen]);

    const clearForm = () => {
        setEditData({
            meeting_type: "physical",
            location: "",
            title: "",
            description: "",
            start_time: "",
            end_time: "",
            hour: "",
            minute: "",
            ampm: "",
            end_hour: "",
            end_minute: "",
            end_ampm: "",
            is_recurring: true,
            note: ""
        });
    };

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error("Invalid token:", error);
            return true;
        }
    };

    const formatDateTime = (date, hour, minute, ampm) => {
        if (!date || !hour || !minute || !ampm) return '';

        let hours = parseInt(hour, 10);
        if (ampm.toLowerCase() === "pm" && hours !== 12) {
            hours += 12;
        } else if (ampm.toLowerCase() === "am" && hours === 12) {
            hours = 0;
        }

        const formattedHour = String(hours).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');

        return `${date}T${formattedHour}:${formattedMinute}:00Z`;
    };

    const handleView = (data) => {
        setSelectedData(data);
        setIsViewOpen(true);
    };

    const handleEdit = (data) => {
        const startDate = dayjs(data.start);
        const endDate = dayjs(data.end);

        setEditData({
            ...data,
            start_time: startDate.format('YYYY-MM-DD'),
            end_time: endDate.format('YYYY-MM-DD'),
            hour: startDate.format('hh'),
            minute: startDate.format('mm'),
            ampm: startDate.format('A'),
            end_hour: endDate.format('hh'),
            end_minute: endDate.format('mm'),
            end_ampm: endDate.format('A'),
            meeting_type: data.meeting_type || 'physical',
            location: data.location || '',
            title: data.title || '',
            description: data.description || '',
            is_recurring: data.is_recurring ?? true,
            note: data.note || '',
        });
        setSelectedAppointmentId(data.appointment_id);
        setIsEditOpen(true);
    };

    const handleDelete = (appointment_id) => {
        setSelectedAppointmentId(appointment_id);
        setIsDeleteOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value === undefined ? '' : value
        }));
    };

    const saveEdit = async (id) => {
        const userId = Cookies.get("user_id");
        let authToken = localStorage.getItem("authToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!userId || !editData) {
            toast.error("User ID or appointment data is missing!");
            return;
        }

        const formattedStartTime = editData.start_time
            ? formatDateTime(editData.start_time, editData.hour, editData.minute, editData.ampm)
            : undefined;
        const formattedEndTime = editData.end_time
            ? formatDateTime(editData.end_time, editData.end_hour, editData.end_minute, editData.end_ampm)
            : undefined;

        const requestBody = {};

        if (editData.title !== undefined) requestBody.title = editData.title;
        if (editData.description !== undefined) requestBody.description = editData.description;
        if (formattedStartTime !== undefined) requestBody.start_time = formattedStartTime;
        if (formattedEndTime !== undefined) requestBody.end_time = formattedEndTime;
        if (editData.location !== undefined) requestBody.location = editData.location;
        if (editData.note !== undefined) requestBody.note = editData.note;
        requestBody.is_recurring = true;

        const updateAppointmentWithToken = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/appointments/${id}/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                    const updatedAppointment = await response.json();
                    setAppointmentData((prevAppointments) =>
                        prevAppointments.map((appointment) =>
                            appointment.appointment_id === id
                                ? { ...appointment, ...updatedAppointment }
                                : appointment
                        )
                    );

                    toast.success("Appointment updated successfully!");
                    setIsEditOpen(false);
                    clearForm();
                    location.reload()
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || "Failed to update appointment.");
                }
            } catch (error) {
                console.error("Error updating appointment:", error);
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
                await updateAppointmentWithToken(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error("Session expired. Please log in again.");
            }
        };

        if (authToken && !isTokenExpired(authToken)) {
            await updateAppointmentWithToken(authToken);
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

        if (!id) {
            console.error("ID is undefined or null!");
            return;
        }

        if (!authToken && !refreshToken) {
            toast.error("Please log in first.");
            return;
        }

        const deleteAppointmentWithToken = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/appointments/${id}/`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setAppointmentData(appointmentData.filter((appointment) =>
                        appointment.appointment_id !== id
                    ));
                    setIsDeleteOpen(false);
                    toast.success("Appointment deleted successfully");
                } else {
                    toast.error("Failed to delete appointment");
                }
            } catch (error) {
                console.error("Error deleting appointment:", error);
                toast.error("An error occurred while deleting");
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
                await deleteAppointmentWithToken(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error("Session expired. Please log in again.");
            }
        };

        if (authToken && !isTokenExpired(authToken)) {
            await deleteAppointmentWithToken(authToken);
        } else if (refreshToken) {
            await refreshAndRetry();
        } else {
            toast.error("Authentication error. Please log in.");
        }
    };

    return (
        <div>
            {/* Table Component */}
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
                                <td>
                                    <div className="font-bold">
                                        {dayjs(data.start).format('DD-MM-YY hh:mm A')}
                                    </div>
                                </td>
                                <td>{data.title}</td>
                                <td>{data.description}</td>
                                <td>{data.location}</td>
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
                            From: {dayjs(selectedData.start).format('DD-MM-YY hh:mm A')}
                            <br></br>
                            To: {dayjs(selectedData.end).format('DD-MM-YY hh:mm A')}
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
            {isEditOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h4 className="text-2xl font-bold">Edit Appointment</h4>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            saveEdit(editData.appointment_id);
                        }}>
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
                                    // required
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
                                    // required
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
                                        // required
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                        <div className="flex gap-2">
                                            {/* Hour Selection */}
                                            <select
                                                name="hour"
                                                value={editData.hour || ''}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="">Hour</option>
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const hour = i + 1;
                                                    return (
                                                        <option key={hour} value={String(hour).padStart(2, '0')}>
                                                            {String(hour).padStart(2, '0')}
                                                        </option>
                                                    );
                                                })}
                                            </select>

                                            {/* Minute Selection */}
                                            <select
                                                name="minute"
                                                value={editData.minute}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            // required
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
                                            // required
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
                                        // required
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    <div className="w-full md:w-1/2">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                        <div className="flex gap-2">
                                            {/* Hour Selection */}
                                            <select
                                                name="end_hour"
                                                value={editData.end_hour || ''}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="">Hour</option>
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const hour = i + 1;
                                                    return (
                                                        <option key={hour} value={String(hour).padStart(2, '0')}>
                                                            {String(hour).padStart(2, '0')}
                                                        </option>
                                                    );
                                                })}
                                            </select>

                                            {/* Minute Selection */}
                                            <select
                                                name="end_minute"
                                                value={editData.end_minute}
                                                onChange={handleEditChange}
                                                className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            // required
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
                                            // required
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
                                    // required
                                    >
                                        <option value="physical">Physical</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>

                                {/* Conditional Location Input */}
                                {/* {editData.meeting_type === 'physical' ? (
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-600">Physical Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={editData.location}
                                            onChange={handleEditChange}
                                            placeholder="Enter the location address"
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        // required
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
                                        // required
                                        />
                                    </div>
                                )} */}

                                {/* Conditional Location Input */}
                                {(editData.meeting_type === 'physical' || !editData.meeting_type) ? (
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-600">Physical Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={editData.location}
                                            onChange={handleEditChange}
                                            placeholder="Enter the location address"
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
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
                                    // required
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
                                    // required
                                    />
                                </div>
                            </div>
                            {/* Form fields here - same as in your original code */}
                            {/* Make sure all inputs have value={editData[fieldName] || ''} */}

                            <div className="modal-action">
                                <button type="submit" className="btn btn-primary">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setIsEditOpen(false);
                                        clearForm();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
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
                            <button
                                className="btn btn-error"
                                onClick={() => confirmDelete(selectedAppointmentId)}
                            >
                                Delete
                            </button>
                            <button
                                className="btn"
                                onClick={() => setIsDeleteOpen(false)}
                            >
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