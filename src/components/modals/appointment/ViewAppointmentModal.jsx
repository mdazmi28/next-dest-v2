'use client'
import React, { useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

const ViewAppointmentModal = ({ isOpen, onClose, data }) => {
    const modalRef = useRef(null);

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

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div
                    ref={modalRef}
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6"
                >
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Appointment Details</h4>
                    <div className="space-y-3">
                        <div>
                            <strong className="text-gray-700">Title:</strong>
                            <p className="mt-1">{data.title || "Nothing Here"}</p>
                        </div>

                        <div>
                            <strong className="text-gray-700">Description:</strong>
                            <p className="mt-1">{data.description || "No description provided"}</p>
                        </div>

                        <div>
                            <strong className="text-gray-700">With:</strong>
                            <div className="mt-1">
                                {data.with_contacts?.map((contact, index) => (
                                    <div 
                                        key={contact.contact_id || index}
                                        className="ml-4 py-1"
                                    >
                                        • {contact.name}
                                        {contact.designation && ` - ${contact.designation}`}
                                        {contact.organization?.name && ` at ${contact.organization.name}`}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <strong className="text-gray-700">Location:</strong>
                            <p className="mt-1">{data.location || "No location specified"}</p>
                        </div>

                        <div>
                            <strong className="text-gray-700">Time:</strong>
                            <div className="mt-1">
                                <p>From: {dayjs(data.start).format('DD-MM-YY hh:mm A')}</p>
                                <p>To: {dayjs(data.end).format('DD-MM-YY hh:mm A')}</p>
                            </div>
                        </div>

                        {data.note && (
                            <div>
                                <strong className="text-gray-700">Note:</strong>
                                <p className="mt-1">{data.note}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ViewAppointmentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object,
};

export default ViewAppointmentModal;