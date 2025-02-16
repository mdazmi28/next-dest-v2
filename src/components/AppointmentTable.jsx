import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'
import base_url from "@/base_url";
import 'react-toastify/dist/ReactToastify.css';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ViewAppointmentModal from './modals/appointment/ViewAppointmentModal';
import EditAppointmentModal from './modals/appointment/EditAppointmentModal';
import DeleteAppointmentModal from './modals/appointment/DeleteAppointmentModal';

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);

const AppointmentTable = ({ appointmentData, setAppointmentData }) => {
    console.log(appointmentData)
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    // const { appointments } = useFlowContext();

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
        is_recurring: false,
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

    // const clearForm = () => {
    //     setEditData({
    //         meeting_type: "physical",
    //         location: "",
    //         title: "",
    //         description: "",
    //         start_time: "",
    //         end_time: "",
    //         hour: "",
    //         minute: "",
    //         ampm: "",
    //         end_hour: "",
    //         end_minute: "",
    //         end_ampm: "",
    //         is_recurring: true,
    //         note: ""
    //     });
    // };

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error("Invalid token:", error);
            return true;
        }
    };

    const isEndTimeValid = (startDate, startHour, startMinute, startAMPM, endDate, endHour, endMinute, endAMPM) => {
        if (!startDate || !startHour || !startMinute || !startAMPM ||
            !endDate || !endHour || !endMinute || !endAMPM) {
            return true; // Skip validation if any field is empty
        }

        const start = dayjs(`${startDate} ${startHour}:${startMinute} ${startAMPM}`, 'YYYY-MM-DD hh:mm A');
        const end = dayjs(`${endDate} ${endHour}:${endMinute} ${endAMPM}`, 'YYYY-MM-DD hh:mm A');

        // If dates are the same, check times
        if (startDate === endDate) {
            // Convert hours to 24-hour format for comparison
            const startHour24 = start.hour();
            const endHour24 = end.hour();

            if (startHour24 > endHour24) {
                return false;
            }

            if (startHour24 === endHour24 && parseInt(startMinute) >= parseInt(endMinute)) {
                return false;
            }
        }

        return end.isAfter(start);
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

    // const handleEdit = (data) => {
    //     const startDate = dayjs(data.start);
    //     const endDate = dayjs(data.end);

    //     setEditData({
    //         ...data,
    //         start_time: startDate.format('YYYY-MM-DD'),
    //         end_time: endDate.format('YYYY-MM-DD'),
    //         hour: startDate.format('hh'),
    //         minute: startDate.format('mm'),
    //         ampm: startDate.format('A'),
    //         end_hour: endDate.format('hh'),
    //         end_minute: endDate.format('mm'),
    //         end_ampm: endDate.format('A'),
    //         meeting_type: data.meeting_type || 'physical',
    //         location: data.location || '',
    //         title: data.title || '',
    //         description: data.description || '',
    //         is_recurring: Boolean(data.is_recurring), // Ensure it's a boolean
    //         note: data.note || '',
    //     });
    //     setSelectedAppointmentId(data.appointment_id);
    //     setIsEditOpen(true);
    // };

    const handleEdit = (data) => {
        const startDate = dayjs(data.start_time);
        const endDate = dayjs(data.end_time);

        const formattedData = {
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
            is_recurring: Boolean(data.is_recurring),
            note: data.note || '',
            appointment_id: data.appointment_id,
            contacts: data.with_contacts || [] // Include contacts if available
        };

        setEditData(formattedData);
        setIsEditOpen(true);
    };
    const clearForm = () => {
        setEditData(null);
    };
    const handleDelete = (appointment_id) => {
        setSelectedAppointmentId(appointment_id);
        setIsDeleteOpen(true);
    };


    const handleEditChange = (e) => {
        const { name, value } = e.target;

        // Special handling for is_recurring
        if (name === 'is_recurring') {
            const boolValue = value === 'true'; // Convert string to boolean
            setEditData(prev => ({
                ...prev,
                [name]: boolValue
            }));
            return;
        }

        // Create new state with the changed value
        const newEditData = {
            ...editData,
            [name]: value === undefined ? '' : value
        };

        // Validate end time when any date/time field changes
        const timeRelatedFields = ['start_time', 'hour', 'minute', 'ampm',
            'end_time', 'end_hour', 'end_minute', 'end_ampm'];

        if (timeRelatedFields.includes(name)) {
            const isValid = isEndTimeValid(
                newEditData.start_time,
                newEditData.hour,
                newEditData.minute,
                newEditData.ampm,
                newEditData.end_time,
                newEditData.end_hour,
                newEditData.end_minute,
                newEditData.end_ampm
            );

            if (!isValid) {
                toast.error("End time cannot be earlier than start time");
                // Optionally, prevent the change or reset the end time
                if (name.startsWith('end')) {
                    return; // Don't update if end time is invalid
                }
            }
        }

        setEditData(newEditData);
    };

    const saveEdit = async (id) => {
        const userId = Cookies.get("user_id");
        let authToken = localStorage.getItem("authToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!userId || !editData) {
            toast.error("User ID or appointment data is missing!");
            return;
        }

        // Validate times before saving
        const isValid = isEndTimeValid(
            editData.start_time,
            editData.hour,
            editData.minute,
            editData.ampm,
            editData.end_time,
            editData.end_hour,
            editData.end_minute,
            editData.end_ampm
        );

        if (!isValid) {
            toast.error("End time cannot be earlier than start time");
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
                    location.reload();
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
                    location.reload();
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
                            {/* <th>With</th> */}
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointmentData.map((data, index) => (
                            <tr key={data.appointment_id || index}>
                                <td>
                                    <div className="font-bold">
                                        {dayjs(data.start).format('DD-MM-YY hh:mm A')} - {dayjs(data.end).format('DD-MM-YY hh:mm A')}
                                    </div>
                                </td>
                                <td>{data.title}</td>
                                <td>{data.description}</td>
                                {/* {data.with_contacts.map((contact, index) => (
                                    <td className='flex flex-col' key={contact.contact_id || index}>
                                        <li>
                                            {contact.name}
                                        </li></td>
                                ))} */}
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

            <ViewAppointmentModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={selectedData}
            />

            {/* Edit Modal */}
            <EditAppointmentModal
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    clearForm();
                }}
                data={editData}
                setAppointmentData={setAppointmentData}
            />

            {/* Delete Confirmation Modal */}
            {/* {isDeleteOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            Are you sure you want to delete this appointment?
                        </h3>
                        <p className="py-4">This action cannot be undone.</p>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                className="btn"
                                onClick={() => setIsDeleteOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error text-white hover:bg-red-400"
                                onClick={() => confirmDelete(selectedAppointmentId)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

            <DeleteAppointmentModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => confirmDelete(selectedAppointmentId)}
            />
        </div>
    );
};

export default AppointmentTable;