'use client'
import React, { useState } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import { ImCross } from "react-icons/im";

const AddContactPage = () => {
    // const { addContactInfoStage, setAddContactInfoStage } = useFlowContext()
    const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };

    const [person, setPerson] = useState({
        name: '',
        designation: '',
        email: '',
        phone: '',
    });

    const [organization, setOrganization] = useState({
        name: '',
        address: '',
        email: '',
        web: '',
        phone: '',
    });

    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPerson((prev) => ({ ...prev, [name]: value }));
    };

    const handleOrganizationChange = (e) => {
        const { name, value } = e.target;
        setOrganization((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            person,
            organization,
        };
        console.log('Form Data Submitted:', data);
        setAddContactInfoStage(!addContactInfoStage)
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="w-full md:w-3/4 lg:w-2/3 bg-white shadow-2xl rounded-lg p-4">
                <div className='flex justify-end cursor-pointer text-red-500 pb-4' onClick={() => { setAddContactInfoStage(!addContactInfoStage) }}>
                    <ImCross />
                </div>
                <div className='flex justify-end'>
                    <input type="file" className="file-input file-input-bordered file-input-info w-full max-w-xs" />
                </div>
                <h2 className="text-3xl font-bold text-center mb-6">Submit Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col md:flex-row md:justify-around'>

                        {/* Person Information */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-700">Person Information</h3>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={person.name}
                                    onChange={handlePersonChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={person.designation}
                                    onChange={handlePersonChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={person.email}
                                    onChange={handlePersonChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={person.phone}
                                    onChange={handlePersonChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        {/* Organization Information */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-700">Organization Information</h3>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Organization Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={organization.name}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={organization.address}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={organization.email}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Website</label>
                                <input
                                    type="url"
                                    name="web"
                                    value={organization.web}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={organization.phone}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>

                    </div>






                    {/* Submit Button */}
                    <div className="col-span-2 text-center mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContactPage;