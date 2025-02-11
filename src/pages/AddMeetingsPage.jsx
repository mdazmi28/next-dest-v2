'use client';
import React, { useState } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import { ImCross } from "react-icons/im";
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie';

import base_url from '@/base_url';
import dayjs from "dayjs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMeetingsPage = () => {
    const { addMeetingInfoStage, setMeetingInfoStage } = useFlowContext() || { addMeetingInfoStage: false, setMeetingInfoStage: () => { } };
    const [meetingData, setMeetingData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        hour: '',
        minute: '',
        ampm: '',
        end_hour: '',
        end_minute: '',
        end_ampm: '',
        location: '',
        meeting_type: "physical",
        is_recurring: false,
        note: '',
    });

    const isEndTimeValid = (startDate, startHour, startMinute, startAMPM, endDate, endHour, endMinute, endAMPM) => {
        if (!startDate || !startHour || !startMinute || !startAMPM ||
            !endDate || !endHour || !endMinute || !endAMPM) {
            return true; // Skip validation if any field is empty
        }

        // Convert to 24-hour format
        const convertTo24Hour = (hour, ampm) => {
            hour = parseInt(hour);
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return hour;
        };

        const startHour24 = convertTo24Hour(startHour, startAMPM);
        const endHour24 = convertTo24Hour(endHour, endAMPM);

        // Create Date objects for comparison
        const start = new Date(startDate);
        start.setHours(startHour24, parseInt(startMinute), 0);

        const end = new Date(endDate);
        end.setHours(endHour24, parseInt(endMinute), 0);

        return end > start;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        const newMeetingData = {
            ...meetingData,
            [name]: value
        };

        // Validate end time when any date/time field changes
        const timeRelatedFields = ['start_time', 'hour', 'minute', 'ampm',
            'end_time', 'end_hour', 'end_minute', 'end_ampm'];

        if (timeRelatedFields.includes(name)) {
            const isValid = isEndTimeValid(
                newMeetingData.start_time,
                newMeetingData.hour,
                newMeetingData.minute,
                newMeetingData.ampm,
                newMeetingData.end_time,
                newMeetingData.end_hour,
                newMeetingData.end_minute,
                newMeetingData.end_ampm
            );

            if (!isValid && name.startsWith('end')) {
                toast.error("End date and time must be after start date and time");
            }
        }

        setMeetingData(newMeetingData);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check if all required fields are filled
        if (!meetingData.title || !meetingData.description || 
            !meetingData.start_time || !meetingData.end_time ||
            !meetingData.hour || !meetingData.minute || !meetingData.ampm ||
            !meetingData.end_hour || !meetingData.end_minute || !meetingData.end_ampm ||
            !meetingData.location) {
            toast.error("Please fill in all required fields");
            return;
        }
    
        // Validate end time
        const isValid = isEndTimeValid(
            meetingData.start_time,
            meetingData.hour,
            meetingData.minute,
            meetingData.ampm,
            meetingData.end_time,
            meetingData.end_hour,
            meetingData.end_minute,
            meetingData.end_ampm
        );
    
        if (!isValid) {
            toast.error("End date and time must be after start date and time");
            return;
        }
    
        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
    
        if (!userId) {
            toast.error("User ID is missing. Please log in again.");
            return;
        }
    
        const formattedStartTime = formatDateTime(
            meetingData.start_time, 
            meetingData.hour, 
            meetingData.minute, 
            meetingData.ampm
        );
        const formattedEndTime = formatDateTime(
            meetingData.end_time, 
            meetingData.end_hour, 
            meetingData.end_minute, 
            meetingData.end_ampm
        );
    
        const data = {
            user: parseInt(userId),
            title: meetingData.title,
            description: meetingData.description,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            location: meetingData.location,
            meeting_type: meetingData.meeting_type,
            is_recurring: meetingData.is_recurring === 'true',
            note: meetingData.note || "",
        };
    
        const submitAppointment = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/appointments/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });
    
                if (response.ok) {
                    toast.success("Appointment added successfully!");
                    setMeetingInfoStage(false);
                    // Optionally reset form
                    setMeetingData({
                        title: '',
                        description: '',
                        start_time: '',
                        end_time: '',
                        hour: '',
                        minute: '',
                        ampm: '',
                        end_hour: '',
                        end_minute: '',
                        end_ampm: '',
                        location: '',
                        meeting_type: "physical",
                        is_recurring: false,
                        note: '',
                    });
                    setMeetingInfoStage(!addMeetingInfoStage);
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || "Failed to add appointment");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("An error occurred while adding the appointment");
            }
        };
    
        try {
            if (authToken && !isTokenExpired(authToken)) {
                await submitAppointment(authToken);
            } else if (refreshToken) {
                // Refresh token logic
                try {
                    const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ refresh: refreshToken }),
                    });
    
                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        authToken = refreshData.access;
                        localStorage.setItem("authToken", authToken);
                        await submitAppointment(authToken);
                    } else {
                        toast.error("Session expired. Please log in again.");
                    }
                } catch (err) {
                    console.error("Refresh Error:", err);
                    toast.error("Authentication failed. Please log in again.");
                }
            } else {
                toast.error("Please log in to add appointments");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="w-full md:w-3/4 lg:w-2/3 bg-white shadow-2xl rounded-lg p-4">
                <div className='flex justify-end cursor-pointer text-red-500' onClick={() => { setMeetingInfoStage(!addMeetingInfoStage) }}>
                    <ImCross />
                </div>
                <h2 className="text-3xl font-bold text-center mb-6">Add New Meeting</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Appointment Subject */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Appointment Subject</label>
                            <input
                                type="text"
                                name="title"
                                value={meetingData.title}
                                onChange={handleChange}
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
                                value={meetingData.description}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* Start Date and Time */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Start Date Input */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="start_time"
                                    value={meetingData.start_time}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>

                            {/* Start Time Selection */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                <div className="flex gap-2">
                                    {/* Hour Selection */}
                                    <select
                                        name="hour"
                                        value={meetingData.hour}
                                        onChange={handleChange}
                                        className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
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
                                        value={meetingData.minute}
                                        onChange={handleChange}
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
                                        value={meetingData.ampm}
                                        onChange={handleChange}
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

                        {/* End Date and Time */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* End Date Input */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="end_time"
                                    value={meetingData.end_time}
                                    onChange={handleChange}
                                    min={meetingData.start_time || new Date().toISOString().split('T')[0]}
                                    className="p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>

                            {/* End Time Selection */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                                <div className="flex gap-2">
                                    {/* End Hour Selection */}
                                    <select
                                        name="end_hour"
                                        value={meetingData.end_hour}
                                        onChange={handleChange}
                                        className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
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

                                    {/* End Minute Selection */}
                                    <select
                                        name="end_minute"
                                        value={meetingData.end_minute}
                                        onChange={handleChange}
                                        className="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    >
                                        <option value="">Minute</option>
                                        {["00", "15", "30", "45"].map((minute) => (
                                            <option key={minute} value={minute}>{minute}</option>
                                        ))}
                                    </select>

                                    {/* End AM/PM Selection */}
                                    <select
                                        name="end_ampm"
                                        value={meetingData.end_ampm}
                                        onChange={handleChange}
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


                        {/* Time Validation Message */}
                        {!isEndTimeValid(
                            meetingData.start_time,
                            meetingData.hour,
                            meetingData.minute,
                            meetingData.ampm,
                            meetingData.end_time,
                            meetingData.end_hour,
                            meetingData.end_minute,
                            meetingData.end_ampm
                        ) && (
                                <div className="text-red-500 text-sm mt-1">
                                    End date and time must be after start date and time
                                </div>
                            )}

                        {/* Meeting Type */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Meeting Type</label>
                            <select
                                name="meeting_type"
                                value={meetingData.meeting_type}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            >
                                <option value="physical">Physical</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        {/* Conditional Location Input */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">
                                {meetingData.meeting_type === 'online' ? 'Online Meeting Link' : 'Physical Location'}
                            </label>
                            <input
                                type={meetingData.meeting_type === 'online' ? 'url' : 'text'}
                                name="location"
                                value={meetingData.location}
                                onChange={handleChange}
                                placeholder={meetingData.meeting_type === 'online'
                                    ? "Enter the online meeting link"
                                    : "Enter the location address"
                                }
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* Is Recurring */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Is Recurring</label>
                            <select
                                name="is_recurring"
                                value={meetingData.is_recurring}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>

                        {/* Note */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Note</label>
                            <input
                                type="text"
                                name="note"
                                value={meetingData.note}
                                onChange={handleChange}
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
            </div>
        </div>
    );
};

export default AddMeetingsPage;