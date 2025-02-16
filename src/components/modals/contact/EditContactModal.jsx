'use client'
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditContactModal = ({ isOpen, onClose, data, onSave }) => {
    const modalRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

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
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto p-6 overflow-y-auto max-h-[90vh]"
                >
                    <h4 className="text-2xl font-bold mb-6">Edit Contact</h4>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        onSave(data.contact_id);
                    }}>
                        <div className="space-y-6">
                            {/* Person Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Person Information</h2>
                                <div className="grid gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={data.name || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Designation</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={data.designation || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={data.email || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Phone</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={data.phone || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Organization Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Organization Information</h2>
                                <div className="grid gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Organization Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_name"
                                            value={data.organization?.name || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Organization Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="organization_email"
                                            value={data.organization?.email || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Organization Address</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_address"
                                            value={data.organization?.address || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Organization Website</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_website"
                                            value={data.organization?.website || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Organization Phone</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_phone"
                                            value={data.organization?.phone || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Organization Note</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="organization_note"
                                            value={data.organization?.note || ""}
                                            onChange={data.handleEditChange}
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0BBFBF] text-white hover:bg-[#89D9D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:col-start-2 sm:text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Updating...' : 'Update Contact'} 
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0BBFBF] sm:mt-0 sm:col-start-1 sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn bg-[#0BBFBF] text-white hover:bg-[#89D9D9]"
                            >
                                Save Changes
                            </button>
                        </div> */}
                    </form>
                </div>
            </div>
        </div>
    );
};

EditContactModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.shape({
        contact_id: PropTypes.string.isRequired,
        name: PropTypes.string,
        designation: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        organization: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            address: PropTypes.string,
            website: PropTypes.string,
            phone: PropTypes.string,
            note: PropTypes.string,
        }),
        handleEditChange: PropTypes.func.isRequired,
    }),
    onSave: PropTypes.func.isRequired,
};

export default EditContactModal;