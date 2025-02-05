'use client';
import React, { useState } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import { ImCross } from "react-icons/im";
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import base_url from '@/base_url';

const AddMeetingsPage = () => {
    const { addMeetingInfoStage, setMeetingInfoStage } = useFlowContext() || { addMeetingInfoStage: false, setMeetingInfoStage: () => { } };
    const [meetingData, setMeetingData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        meeting_type: "physical",
        is_recurring: false,
        note: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMeetingData((prev) => ({ ...prev, [name]: value }));
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

        // Convert 12-hour format to 24-hour format
        let hours = parseInt(hour, 10);
        if (ampm.toLowerCase() === "pm" && hours !== 12) {
            hours += 12;
        } else if (ampm.toLowerCase() === "am" && hours === 12) {
            hours = 0;
        }

        // Ensure two-digit formatting for hours and minutes
        const formattedHour = String(hours).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');

        // Create an ISO-formatted date string
        return `${date}T${formattedHour}:${formattedMinute}:00Z`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!userId) {
            console.error("User ID not found in cookies.");
            toast.error("User ID is missing. Please log in again.");
            return;
        }

        const formattedStartTime = formatDateTime(meetingData.start_time, meetingData.hour, meetingData.minute, meetingData.ampm);
        const formattedEndTime = formatDateTime(meetingData.end_time, meetingData.end_hour, meetingData.end_minute, meetingData.end_ampm);

        const data = {
            user: parseInt(userId),
            title: meetingData.title,
            description: meetingData.description,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            location: meetingData.location,
            is_recurring: meetingData.is_recurring,
            note: meetingData.note || "",
        };

        console.log('Form Data Submitted:', data);

        const submitContact = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/appointments/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.log(`Error: ${response.status} - ${errorData.message}`);
                }

                console.log("Contact added successfully");
                toast.success("Contact added successfully!");
                setMeetingInfoStage(!addMeetingInfoStage);
            } catch (err) {
                console.error("Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        const refreshAndRetry = async () => {
            try {
                console.log("Attempting to refresh token...");
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!refreshResponse.ok) {
                    console.log("Token refresh failed. Please log in again.");
                }

                const refreshData = await refreshResponse.json();
                authToken = refreshData.token;
                localStorage.setItem("authToken", authToken);
                console.log("Token refreshed successfully:", authToken);

                // Retry submitting the contact with the new token
                await submitContact(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await submitContact(authToken);
            } else if (refreshToken) {
                await refreshAndRetry();
            } else {
                console.log("No valid authentication tokens found.");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.message || "An error occurred.");
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

                        {/* Start Date */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Start Date Input */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="start_time"
                                    value={meetingData.start_time}
                                    onChange={handleChange}
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
                                        value={meetingData.hour}
                                        onChange={handleChange}
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



                        {/* End Date */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Start Date Input */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="end_time"
                                    value={meetingData.end_time}
                                    onChange={handleChange}
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
                                        value={meetingData.end_hour}
                                        onChange={handleChange}
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
                                        value={meetingData.end_minute}
                                        onChange={handleChange}
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
                        {meetingData.meeting_type === 'physical' ? (
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Physical Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={meetingData.location}
                                    onChange={handleChange}
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
                                    value={meetingData.location}
                                    onChange={handleChange}
                                    placeholder="Enter the online meeting link"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Meeting Type</label>
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
