'use client'
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ImCross } from "react-icons/im";
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

// Helper functions
const formatDateTime = (date, hour, minute, ampm) => {
    if (!date || !hour || !minute || !ampm) return null;

    const formattedHour = ampm === 'PM' && hour !== '12'
        ? String(Number(hour) + 12)
        : (ampm === 'AM' && hour === '12' ? '00' : hour);

    return `${date}T${formattedHour.padStart(2, '0')}:${minute}:00`;
};

const isEndTimeValid = (startDate, startHour, startMinute, startAmPm,
    endDate, endHour, endMinute, endAmPm) => {
    if (!startDate || !startHour || !startMinute || !startAmPm ||
        !endDate || !endHour || !endMinute || !endAmPm) {
        return true;
    }

    const start = new Date(formatDateTime(startDate, startHour, startMinute, startAmPm));
    const end = new Date(formatDateTime(endDate, endHour, endMinute, endAmPm));

    return end > start;
};

const EditAppointmentModal = ({ isOpen, onClose, data, setAppointmentData }) => {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editData, setEditData] = useState({
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

    const [originalData, setOriginalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const modalRef = useRef(null);

    // Effects
    useEffect(() => {
        if (isOpen && data) {
            const startDate = dayjs(data.start_time);
            const endDate = dayjs(data.end_time);

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
                is_recurring: Boolean(data.is_recurring),
                note: data.note || '',
                contact_ids: data.contact_ids || [],
            });

            if (data.contacts) {
                setSelectedContacts(data.contacts);
            }
        }
    }, [isOpen, data]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            fetchContacts();
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handlers
    const handleClose = () => {
        setEditData({
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
        setError(null);
        onClose();
    };

    const validateForm = () => {
        if (!editData.title.trim()) {
            toast.error('Title is required');
            return false;
        }

        if (!editData.start_time || !editData.hour || !editData.minute || !editData.ampm) {
            toast.error('Start time is required');
            return false;
        }

        if (!editData.end_time || !editData.end_hour || !editData.end_minute || !editData.end_ampm) {
            toast.error('End time is required');
            return false;
        }

        if (!isEndTimeValid(
            editData.start_time,
            editData.hour,
            editData.minute,
            editData.ampm,
            editData.end_time,
            editData.end_hour,
            editData.end_minute,
            editData.end_ampm
        )) {
            toast.error('End time must be after start time');
            return false;
        }

        return true;
    };

    const fetchContacts = async () => {
        try {
            const userId = Cookies.get('user_id');
            if (!userId) {
                throw new Error("User ID not found in cookies.");
            }

            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`${base_url}/users/${userId}/contacts/`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }

            const data = await response.json();
            setOriginalData(data);
            setFilteredData(data);
        } catch (error) {
            toast.error(error.message);
            setError(error.message);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        if (name === 'is_recurring') {
            setEditData(prev => ({
                ...prev,
                [name]: value === 'true'
            }));
            return;
        }

        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchChange = (e) => {
        const inputValue = e.target.value;
        setSearchInput(inputValue);

        if (inputValue.trim().length >= 1) {
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
    };

    const handleContactSelect = (contact) => {
        if (!selectedContacts.some(selected => selected.contact_id === contact.contact_id)) {
            setSelectedContacts(prev => [...prev, contact]);
            setEditData(prev => ({
                ...prev,
                contact_ids: [...(prev.contact_ids || []), contact.contact_id]
            }));
            setSearchInput('');
            setShowSuggestions(false);
        }
    };

    const handleContactRemove = (contactId) => {
        setSelectedContacts(prev =>
            prev.filter(c => c.contact_id !== contactId)
        );
        setEditData(prev => ({
            ...prev,
            contact_ids: prev.contact_ids.filter(id => id !== contactId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);

        try {
            const userId = Cookies.get('user_id');
            const authToken = localStorage.getItem('authToken');

            if (!userId || !authToken) {
                throw new Error('Authentication required');
            }

            const formattedStartTime = formatDateTime(
                editData.start_time,
                editData.hour,
                editData.minute,
                editData.ampm
            );

            const formattedEndTime = formatDateTime(
                editData.end_time,
                editData.end_hour,
                editData.end_minute,
                editData.end_ampm
            );

            const requestBody = {
                title: editData.title.trim(),
                description: editData.description.trim(),
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                location: editData.location.trim(),
                meeting_type: editData.meeting_type,
                is_recurring: editData.is_recurring,
                note: editData.note.trim(),
                contact_ids: selectedContacts.map(contact => contact.contact_id)
            };

            const response = await fetch(`${base_url}/users/${userId}/appointments/${data.appointment_id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update appointment');
            }

            const updatedAppointment = await response.json();
            setAppointmentData(prev =>
                prev.map(apt =>
                    apt.appointment_id === data.appointment_id ? updatedAppointment : apt
                )
            );

            toast.success('Appointment updated successfully');
            handleClose();
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'visible' : 'invisible'}`}>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    ref={modalRef}
                    className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                >
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0BBFBF]"></div>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <span className="sr-only">Close</span>
                            <ImCross className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="sm:flex sm:items-start">
                        <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Edit Appointment
                            </h3>

                            {/* Error Display */}
                            {error && (
                                <div className="mt-2 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editData.title}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={editData.description}
                                        onChange={handleEditChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                    />
                                </div>

                                {/* Contacts Selection */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Participants
                                    </label>
                                    <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                                        {selectedContacts.map((contact) => (
                                            <div
                                                key={contact.contact_id}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E6F7F7] text-[#0BBFBF]"
                                            >
                                                <span>{contact.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleContactRemove(contact.contact_id)}
                                                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[#0BBFBF] hover:text-[#89D9D9]"
                                                >
                                                    <ImCross className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={handleSearchChange}
                                            className="flex-1 min-w-[120px] outline-none"
                                            placeholder={selectedContacts.length === 0 ? "Search participants..." : "Add more participants..."}
                                        />
                                    </div>

                                    {/* Contacts Dropdown */}
                                    {showSuggestions && (
                                        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                                            {filteredData.length > 0 ? (
                                                filteredData.map((contact) => (
                                                    <div
                                                        key={contact.contact_id}
                                                        onClick={() => handleContactSelect(contact)}
                                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {contact.name}
                                                        </div>
                                                        {contact.organization && (
                                                            <div className="text-sm text-gray-500">
                                                                {contact.organization.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No matching contacts found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Date and Time Selection */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* Start Date/Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="start_time"
                                            value={editData.start_time}
                                            onChange={handleEditChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                            required
                                        />

                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            <select
                                                name="hour"
                                                value={editData.hour}
                                                onChange={handleEditChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                                required
                                            >
                                                <option value="">Hour</option>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                name="minute"
                                                value={editData.minute}
                                                onChange={handleEditChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                                required
                                            >
                                                <option value="">Minute</option>
                                                {["00", "15", "30", "45"].map(minute => (
                                                    <option key={minute} value={minute}>{minute}</option>
                                                ))}
                                            </select>

                                            <select
                                                name="ampm"
                                                value={editData.ampm}
                                                onChange={handleEditChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                                required
                                            >
                                                <option value="">AM/PM</option>
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* End Date/Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="end_time"
                                            value={editData.end_time}
                                            onChange={handleEditChange}
                                            min={editData.start_time}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                            required
                                        />

                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            <select
                                                name="end_hour"
                                                value={editData.end_hour}
                                                onChange={handleEditChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                                required
                                            >
                                                <option value="">Hour</option>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                name="end_minute"
                                                value={editData.end_minute}
                                                onChange={handleEditChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                                required
                                            >
                                                <option value="">Minute</option>
                                                {["00", "15", "30", "45"].map(minute => (
                                                    <option key={minute} value={minute}>{minute}</option>
                                                ))}
                                            </select>

                                            <select
                                                name="end_ampm"
                                                value={editData.end_ampm}
                                                onChange={handleEditChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                                required
                                            >
                                                <option value="">AM/PM</option>
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Meeting Type and Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Meeting Type
                                    </label>
                                    <select
                                        name="meeting_type"
                                        value={editData.meeting_type}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                    >
                                        <option value="physical">Physical</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {editData.meeting_type === 'online' ? 'Meeting Link' : 'Location'}
                                    </label>
                                    <input
                                        type={editData.meeting_type === 'online' ? 'url' : 'text'}
                                        name="location"
                                        value={editData.location}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                        placeholder={editData.meeting_type === 'online'
                                            ? 'Enter meeting link'
                                            : 'Enter location'
                                        }
                                    />
                                </div>

                                {/* Is Recurring */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Recurring Meeting
                                    </label>
                                    <select
                                        name="is_recurring"
                                        value={String(editData.is_recurring)}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0BBFBF] focus:ring-[#0BBFBF] sm:text-sm"
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0BBFBF] text-white hover:bg-[#89D9D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:col-start-2 sm:text-sm ${
                                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
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
            </div>
        </div>
    );
};

EditAppointmentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object,
    setAppointmentData: PropTypes.func.isRequired
};

export default EditAppointmentModal;