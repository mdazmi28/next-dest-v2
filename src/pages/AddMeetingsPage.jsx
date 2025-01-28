'use client';
import React, { useState } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import { ImCross } from "react-icons/im";
const AddMeetingsPage = () => {
    const { addMeetingInfoStage, setMeetingInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };
    const [meetingData, setMeetingData] = useState({
        appointment_subject: '',
        appointment_with: '',
        date: '',
        start_time: '',
        end_time: '',
        meeting_type: 'physical', // Default to physical
        meeting_location: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMeetingData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Meeting Data:', meetingData);
        // Submit or process the meetingData here
        setMeetingInfoStage(!addMeetingInfoStage)
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="w-full md:w-3/4 lg:w-2/3 bg-white shadow-2xl rounded-lg p-4">
                <div className='flex justify-end cursor-pointer text-red-500' onClick={()=>{setMeetingInfoStage(!addMeetingInfoStage)}}>
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
                                name="appointment_subject"
                                value={meetingData.appointment_subject}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* Appointment With */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Appointment With</label>
                            <input
                                type="text"
                                name="appointment_with"
                                value={meetingData.appointment_with}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={meetingData.date}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* Start Time */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={meetingData.start_time}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* End Time */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-600">End Time</label>
                            <input
                                type="time"
                                name="end_time"
                                value={meetingData.end_time}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
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
                                    name="meeting_location"
                                    value={meetingData.meeting_location}
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
                                    name="meeting_location"
                                    value={meetingData.meeting_location}
                                    onChange={handleChange}
                                    placeholder="Enter the online meeting link"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        )}

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
