'use client'
import React, { useEffect, useState, useRef } from 'react';
import { ImCross } from "react-icons/im";
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import base_url from '@/base_url';

const AddContactModal = ({ isOpen, onClose, refreshData }) => {
    const initialPersonState = {
        name: '',
        designation: '',
        email: '',
        phone: '',
        tags: [],
        note: "",
    };

    const initialOrganizationState = {
        name: '',
        address: '',
        email: '',
        website: '',
        phone: ''
    };

    const modalRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [person, setPerson] = useState(initialPersonState);
    const [organization, setOrganization] = useState(initialOrganizationState);
    const [organizations, setOrganizations] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [files, setFiles] = useState([]);

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

    const resetForm = () => {
        setPerson(initialPersonState);
        setOrganization(initialOrganizationState);
        setSelectedTags([]);
        setFiles([]);
        setIsProcessing(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${base_url}/ocr-contact/`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                toast.error('File processing failed');
                return;
            }

            const data = await response.json();
            if (data && data.length > 0) {
                const ocrData = data[0];

                setPerson(prev => ({
                    ...prev,
                    name: ocrData['Name']?.trim() || '',
                    designation: ocrData['Designation']?.trim() || '',
                    email: ocrData['Email']?.trim() || '',
                    phone: ocrData['Phone Number']?.trim().replace(/\s/g, '') || '',
                }));

                setOrganization(prev => ({
                    ...prev,
                    name: ocrData['Company Name']?.trim() || '',
                }));

                toast.success('Business card data extracted successfully!');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            toast.error('Failed to process business card');
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchOrganizations = async () => {
        const userId = Cookies.get('user_id');
        if (!userId) return;

        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        const fetchOrgs = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/organizations/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch organizations');
                }
                const data = await response.json();
                setOrganizations(data);
            } catch (error) {
                console.error('Fetch Organizations Error:', error);
                toast.error('Failed to load organizations');
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await fetchOrgs(authToken);
            } else if (refreshToken) {
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
                if (!refreshResponse.ok) {
                    throw new Error('Token refresh failed');
                }
                const { access } = await refreshResponse.json();
                localStorage.setItem("authToken", access);
                await fetchOrgs(access);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Please log in again.');
        }
    };

    const fetchTags = async () => {
        const userId = Cookies.get('user_id');
        if (!userId) return;

        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        const fetchTag = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/tags/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const data = await response.json();
                setTags(data);
            } catch (error) {
                console.error('Fetch Tags Error:', error);
                toast.error('Failed to load tags');
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await fetchTag(authToken);
            } else if (refreshToken) {
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
                if (!refreshResponse.ok) {
                    throw new Error('Token refresh failed');
                }
                const { access } = await refreshResponse.json();
                localStorage.setItem("authToken", access);
                await fetchTag(access);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Please log in again.');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTags();
            fetchOrganizations();
        }
    }, [isOpen]);

    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPerson(prev => ({ ...prev, [name]: value }));
    };

    const handleOrganizationChange = (e) => {
        const { name, value } = e.target;
        setOrganization(prev => ({ ...prev, [name]: value }));
    };

    const handleOrganizationSelect = (e) => {
        const selectedOrgName = e.target.value;
        const selectedOrg = organizations.find(org => org.name === selectedOrgName);

        if (selectedOrg) {
            setOrganization({
                name: selectedOrg.name,
                address: selectedOrg.address || '',
                email: selectedOrg.email || '',
                phone: selectedOrg.phone || '',
                website: selectedOrg.website || ''
            });
        } else {
            setOrganization(prev => ({
                ...prev,
                name: selectedOrgName
            }));
        }
    };

    const handleTagSelect = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (newTag && !selectedTags.includes(newTag)) {
                setSelectedTags(prev => [...prev, newTag]);
                setPerson(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
            }
            e.target.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
        setPerson(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
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

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!userId) {
            toast.error("User ID is missing. Please log in again.");
            return;
        }

        const organization_data = {};
        if (organization.name) organization_data.name = organization.name;
        if (organization.address) organization_data.address = organization.address;
        if (organization.email) organization_data.email = organization.email;
        if (organization.website) organization_data.website = organization.website;
        if (organization.phone) organization_data.phone = organization.phone;

        const data = {
            user: parseInt(userId),
            name: person.name,
            email: person.email,
            ...(person.phone && { phone: person.phone }),
            ...(person.designation && { designation: person.designation }),
            ...(person.note && { note: person.note }),
            ...(selectedTags?.length > 0 && { tags: selectedTags }),
            ...(Object.keys(organization_data).length > 0 && { organization_data })
        };

        const submitContact = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/contacts/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error: ${response.status} - ${errorData.message}`);
                }

                toast.success("Contact added successfully!");
                if (refreshData) {
                    refreshData();
                }
                resetForm();
                onClose();
            } catch (err) {
                console.error("Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await submitContact(authToken);
            } else if (refreshToken) {
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error("Token refresh failed. Please log in again.");
                }

                const refreshData = await refreshResponse.json();
                authToken = refreshData.access;
                localStorage.setItem("authToken", authToken);
                await submitContact(authToken);
            } else {
                throw new Error("No valid authentication tokens found.");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.message || "An error occurred.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="relative w-full md:w-3/4 lg:w-2/3 bg-white shadow-2xl rounded-lg p-4 overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors pb-5"
                    aria-label="Close modal"
                >
                    <ImCross className="w-4 h-4" />
                </button>

                <h2 className="text-3xl font-bold text-center mb-6">Add New Contact</h2>
                <div className='flex justify-end pb-4'>
                    {/* <input
                        type="file"
                        className="file-input file-input-bordered file-input-info w-full max-w-xs "
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                    /> */}
                    <input
                        type="file"
                        className="file-input w-full max-w-xs
               file:mr-4 
               file:py-2 
               file:px-4
               file:rounded-full
               file:border-0
               file:text-sm
               file:font-semibold
               file:bg-[#0BBFBF]
               file:text-white
               hover:file:bg-[#0BBFBF]/80"
                        onChange={handleFileUpload}
                        disabled={isProcessing}
                    />
                    {isProcessing && (
                        <div className="ml-2 flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Processing...</span>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='flex flex-col md:flex-row md:justify-around'>
                        {/* Person Information */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-700">Person Information</h3>
                            {/* ... Person form fields ... */}
                            {/* Copy all your existing person form fields here */}
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
                                // required
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
                                // required
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
                                // required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Tags</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="tags"
                                        onKeyDown={handleTagSelect}
                                        list="tag-suggestions"
                                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        placeholder="Type tag and press Enter or comma to add"
                                    />
                                    <datalist id="tag-suggestions">
                                        {tags && tags.map((tag) => (
                                            <option key={tag.tag_id} value={tag.name}>
                                                {tag.name}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>

                                {/* Display Selected Tags */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Organization Information */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-700">Organization Information</h3>
                            {/* ... Organization form fields ... */}
                            {/* Copy all your existing organization form fields here */}
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Organization Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={organization.name}
                                    onChange={handleOrganizationSelect}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                    list="organization-suggestions"
                                    required
                                />

                                <datalist id="organization-suggestions">
                                    {organizations.map((org) => (
                                        <option key={`${org.id}-${org.name}`} value={org.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={organization.address}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
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
                                // required
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-600">Website</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={organization.website}
                                    onChange={handleOrganizationChange}
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                // required
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
                                // required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#0BBFBF] text-white rounded-md hover:bg-[#89D9D9]"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContactModal;