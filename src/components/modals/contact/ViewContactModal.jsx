'use client'
import React, { useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

const ViewContactModal = ({ isOpen, onClose, data }) => {
    console.log("LUUUUUUUUUUUUUUUUUUUUUU: ", data);
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
    
        {/* Modal Container */}
        <div className="flex items-center justify-center min-h-screen p-4">
            {/* Modal Content */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto p-8"
            >
                {/* Modal Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
                </div>
    
                {/* Modal Body */}
                <div className='grid grid-cols-2 gap-8'>
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Data</h4>
                        <div className="space-y-4">
                            <InfoField label="Name" value={data.name} />
                            <InfoField label="Designation" value={data.designation} />
                            <InfoField label="Email" value={data.email} />
                            <InfoField label="Phone" value={data.phone} />
                            <InfoField label="Location" value={data.location} />
                        </div>
                    </div>
    
                    {/* Organization Information Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Organizational Data</h4>
                        <div className="space-y-4">
                            <InfoField label="Name" value={data.organization.name} />
                            <InfoField label="Address" value={data.organization.address} />
                            <InfoField label="Email" value={data.organization.email} />
                            <InfoField label="Phone" value={data.organization.phone} />
                            <InfoField label="Website" value={data.organization.website} />
                        </div>
                    </div>
                </div>
    
                {/* Modal Footer */}
                <div className="mt-8 flex justify-end">
                    <button
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 
                                 transition-colors duration-200 font-medium focus:outline-none 
                                 focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF]"
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

const InfoField = ({ label, value }) => (
    <div>
        <strong className="text-gray-700">{label}:</strong>
        <p className="mt-1">{value || `No ${label.toLowerCase()} provided`}</p>
    </div>
);

ViewContactModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object,
};

export default ViewContactModal;