'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ImCross } from "react-icons/im";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddAppointmentModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
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
        contact_ids: [], // This will store contact_id values
    });

    // Contact-related states
    const [originalData, setOriginalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Add this useEffect for debugging
    useEffect(() => {
        // console.log('Selected Contacts:', selectedContacts);
        // console.log('Contact IDs:', meetingData.contact_ids);
    }, [selectedContacts, meetingData.contact_ids]);

    const modalRef = useRef(null);
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);
    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.form-group')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const fetchContacts = async () => {
        try {
            const userId = Cookies.get('user_id');
            if (!userId) {
                console.error("User ID not found in cookies.");
                return;
            }

            let authToken = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!authToken && !refreshToken) {
                toast.error("Please log in first.");
                return;
            }

            const fetchContactsWithToken = async (token) => {
                const response = await fetch(`${base_url}/users/${userId}/contacts/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    toast.error(`Error ${response.status}: ${errorText}`);
                    return;
                }

                const data = await response.json();
                // console.log('Fetched contacts:', data); // Add this line
                setOriginalData(data);
                setFilteredData(data);
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
                    await fetchContactsWithToken(authToken);
                } catch (err) {
                    console.error("Refresh and Retry Error:", err);
                    toast.error(err.message || "An error occurred.");
                }
            };

            if (authToken && !isTokenExpired(authToken)) {
                await fetchContactsWithToken(authToken);
            } else if (refreshToken) {
                await refreshAndRetry();
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
            toast.error("Failed to fetch contacts");
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    const isEndTimeValid = (startDate, startHour, startMinute, startAMPM, endDate, endHour, endMinute, endAMPM) => {
        if (!startDate || !startHour || !startMinute || !startAMPM ||
            !endDate || !endHour || !endMinute || !endAMPM) {
            return true;
        }

        const convertTo24Hour = (hour, ampm) => {
            hour = parseInt(hour);
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return hour;
        };

        const startHour24 = convertTo24Hour(startHour, startAMPM);
        const endHour24 = convertTo24Hour(endHour, endAMPM);

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

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error("Invalid token:", error);
            return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (searchInput.trim()) {
            toast.error("Please select a contact from the suggestions or clear the input");
            return;
        }

        if (meetingData.contact_ids.length === 0) {
            toast.error("Please select at least one contact");
            return;
        }


        if (!meetingData.title || !meetingData.description ||
            !meetingData.start_time || !meetingData.end_time ||
            !meetingData.hour || !meetingData.minute || !meetingData.ampm ||
            !meetingData.end_hour || !meetingData.end_minute || !meetingData.end_ampm ||
            !meetingData.location) {
            toast.error("Please fill in all required fields");
            return;
        }

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
            contact_ids: meetingData.contact_ids, // This should now be an array of IDs

        };

        try {
            const response = await fetch(`${base_url}/users/${userId}/appointments/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Appointment added successfully!");
                onClose();
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
                    contact_ids: [],
                });
                window.location.reload();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to add appointment");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while adding the appointment");
        }
    };

    const resetForm = () => {
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
            contact_ids: [],
        });
        setSelectedContacts([]);
        setSearchInput('');
        setShowSuggestions(false);
        setFilteredData([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div ref={modalRef} className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Close modal"
                >
                    <ImCross className="w-4 h-4" />
                </button>

                {/* Modal Content */}
                <div className="p-6">
                    <h2 id="modal-title" className="text-2xl font-bold text-center mb-6">Add New Meeting</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

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
                            <textarea
                                type="text"
                                name="description"
                                value={meetingData.description}
                                onChange={handleChange}
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        {/* Appointment with */}
                        <div className="form-group relative">
                            <label className="block text-sm font-medium text-gray-600">Appointment With</label>

                            {/* Input field with selected contacts */}
                            <div className="relative">
                                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                                    {selectedContacts.map((contact) => (
                                        <div
                                            key={`selected-${contact.contact_id}`}
                                            className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-2 text-sm"
                                        >
                                            <span>{contact.name}</span>
                                            {contact.organization && (
                                                <span className="text-xs text-gray-500">
                                                    ({contact.organization.name})
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedContacts(prev =>
                                                        prev.filter(c => c.contact_id !== contact.contact_id)
                                                    );
                                                    setMeetingData(prev => ({
                                                        ...prev,
                                                        contact_ids: prev.contact_ids.filter(id =>
                                                            id !== contact.contact_id
                                                        )
                                                    }));
                                                }}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <ImCross className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            setSearchInput(inputValue);

                                            if (inputValue.trim().length >= 1) { // Only show suggestions if input length >= 1
                                                // Filter based on input
                                                const filtered = originalData.filter(contact =>
                                                    (contact.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                                                        (contact.organization?.name || '').toLowerCase().includes(inputValue.toLowerCase())) &&
                                                    !selectedContacts.some(selected => selected.contact_id === contact.contact_id)
                                                );
                                                setFilteredData(filtered);
                                                setShowSuggestions(true);
                                            } else {
                                                setShowSuggestions(false);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (searchInput.trim() && !showSuggestions) {
                                                    toast.error("Please select a contact from the suggestions");
                                                }
                                            }
                                        }}
                                        className="flex-grow outline-none min-w-[120px]"
                                        placeholder={selectedContacts.length === 0 ? "Type to search contacts..." : "Add more contacts..."}
                                    // required
                                    />
                                </div>
                            </div>

                            {/* Suggestions dropdown */}
                            {showSuggestions && searchInput.trim().length >= 1 && (
                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((contact) => (
                                            <div
                                                key={`suggestion-${contact.contact_id}`}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    if (!selectedContacts.some(selected =>
                                                        selected.contact_id === contact.contact_id
                                                    )) {
                                                        setSelectedContacts(prev => [...prev, contact]);
                                                        setMeetingData(prev => ({
                                                            ...prev,
                                                            contact_ids: [...prev.contact_ids, contact.contact_id]
                                                        }));
                                                        setSearchInput('');
                                                        setShowSuggestions(false);
                                                    }
                                                }}
                                            >
                                                <div className="font-medium text-sm">{contact.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    {/* {contact.email && <span>{contact.email}</span>} */}
                                                    {contact.organization && (
                                                        <span>• {contact.organization.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-red-500">
                                            No matching contacts found
                                        </div>
                                    )}
                                </div>
                            )}
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

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0BBFBF] text-white hover:bg-[#89D9D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:col-start-2 sm:text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Saving...' : 'Save Meeting'}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:mt-0 sm:col-start-1 sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAppointmentModal;