import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaCalendarAlt } from "react-icons/fa";
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
import DatePicker from 'react-datepicker'; // You'll need to install this
import "react-datepicker/dist/react-datepicker.css";
import { ImCross } from "react-icons/im";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter); // Add this extension

const AppointmentTable = ({ appointmentData, setAppointmentData }) => {
    console.log(appointmentData)
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    // const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(dayjs());

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

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error("Invalid token:", error);
            return true;
        }
    };


    const handleView = (data) => {
        setSelectedData(data);
        setIsViewOpen(true);
    };

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

    // Add this filter function
    const filterAppointments = (data) => {
        const now = dayjs(); // Current system date and time
        const appointmentStart = dayjs(data.start);

        // If a date is selected in the filter
        if (selectedDateTime) {
            // If appointment is on the same day as selected date, check time
            if (appointmentStart.isSame(selectedDateTime, 'day')) {
                return appointmentStart.isSameOrAfter(selectedDateTime);
            }
            return appointmentStart.isAfter(selectedDateTime, 'day');
        }

        // Default filter: show appointments from current time onwards
        return appointmentStart.isSameOrAfter(now);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside both the calendar icon and the datepicker
            if (!event.target.closest('.calendar-container') &&
                !event.target.closest('.datepicker-dropdown') &&
                !event.target.closest('.react-datepicker')) {
                setShowDatePicker(false);
            }
        };

        // Add event listener only when datepicker is shown
        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    const CustomDatePicker = () => (
        <DatePicker
            selected={selectedDateTime.toDate()}
            onChange={(date) => {
                setSelectedDateTime(dayjs(date));
                setShowDatePicker(false);
            }}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            inline
            renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled
            }) => (
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="text-lg font-semibold">
                        {dayjs(date).format('MMMM YYYY')}
                    </div>
                    <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        />
    );


    return (
        <div>
            {/* Table Component */}
            <div className="">

                <div className="mb-4 flex items-center gap-2">


                </div>
                <table className="table">
                    <thead>
                        <tr>

                        <th className='relative'>
                                <div className='flex gap-4 items-center'>
                                    Time
                                    <div className="relative inline-block">
                                        <img
                                            src="/assets/icons/filter_appointment.png"
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            className="h-4 w-5 cursor-pointer"
                                        />
                                        {showDatePicker && (
                                            <div className="absolute left-0 top-8 z-[1000] fixed-calendar">
                                                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                                                    <CustomDatePicker />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointmentData
                            .filter(filterAppointments)
                            .map((data, index) => (
                                <tr key={data.appointment_id || index}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold">
                                                {dayjs(data.start).format('DD-MM-YY hh:mm A')} - {dayjs(data.end).format('DD-MM-YY hh:mm A')}
                                            </div>
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

            <DeleteAppointmentModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => confirmDelete(selectedAppointmentId)}
            />
        </div>
    );
};

export default AppointmentTable;