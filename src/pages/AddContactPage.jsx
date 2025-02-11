'use client'
import React, { useEffect, useState } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import { ImCross } from "react-icons/im";
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import base_url from '@/base_url';

const AddContactPage = () => {
    const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };
    const [isProcessing, setIsProcessing] = useState(false);

    const [person, setPerson] = useState({
        name: '',
        designation: '',
        email: '',
        phone: '',
        tags: [],
        note: "",
    });

    const [organization, setOrganization] = useState({});

    const [organizations, setOrganizations] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

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
            }

            const data = await response.json();
            if (data && data.length > 0) {
                const ocrData = data[0];

                setPerson({
                    name: ocrData['Name']?.trim() || '',
                    designation: ocrData['Designation']?.trim() || '',
                    email: ocrData['Email']?.trim() || '',
                    phone: ocrData['Phone Number']?.trim().replace(/\s/g, '') || '',
                    note: person.note
                });

                setOrganization({
                    name: ocrData['Company Name']?.trim() || '',
                    address: organization.address,
                    email: organization.email,
                    website: organization.website,
                    phone: organization.phone
                });

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
                if (!response.ok) console.log('Failed to fetch organizations');
                const data = await response.json();
                setOrganizations(data);
            } catch (error) {
                console.error('Fetch Organizations Error:', error);
                toast.error('Failed to load organizations');
            }
        };

        const refreshAndFetch = async () => {
            try {
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
                if (!refreshResponse.ok) toast.error('Token refresh failed');
                const { token } = await refreshResponse.json();
                localStorage.setItem("authToken", token);
                await fetchOrgs(token);
            } catch (error) {
                console.error('Refresh Token Error:', error);
                toast.error('Session expired. Please log in again.');
            }
        };

        if (authToken && !isTokenExpired(authToken)) {
            await fetchOrgs(authToken);
        } else if (refreshToken) {
            await refreshAndFetch();
        } else {
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
                if (!response.ok) toast.error('Failed to fetch tags');
                const data = await response.json();
                console.log("Fetched tags:", data); // Debug log
                setTags(data); // Make sure data is an array of tag objects
            } catch (error) {
                console.error('Fetch Tags Error:', error);
                toast.error('Failed to load tags');
            }
        };

        const refreshAndFetch = async () => {
            try {
                const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
                if (!refreshResponse.ok) toast.error('Token refresh failed');
                const { token } = await refreshResponse.json();
                localStorage.setItem("authToken", token);
                await fetchTag(token);
            } catch (error) {
                console.error('Refresh Token Error:', error);
                toast.error('Session expired. Please log in again.');
            }
        };

        if (authToken && !isTokenExpired(authToken)) {
            await fetchTag(authToken);
        } else if (refreshToken) {
            await refreshAndFetch();
        } else {
            toast.error('Please log in again.');
        }
    };

    useEffect(() => {
        fetchTags();
        fetchOrganizations();
    }, []);

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
                address: selectedOrg.address,
                email: selectedOrg.email,
                phone: selectedOrg.phone,
                website: selectedOrg.website
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
            e.target.value = ''; // Clear input after adding tag
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
                    console.log(`Error: ${response.status} - ${errorData.message}`);
                }

                toast.success("Contact added successfully!");
                setAddContactInfoStage(!addContactInfoStage);
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
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!refreshResponse.ok) {
                    console.log("Token refresh failed. Please log in again.");
                }

                const refreshData = await refreshResponse.json();
                authToken = refreshData.token;
                localStorage.setItem("authToken", authToken);
                await submitContact(authToken);
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
                <div className='flex justify-end cursor-pointer text-red-500 pb-4'
                    onClick={() => setAddContactInfoStage(!addContactInfoStage)}>
                    <ImCross />
                </div>
                <div className='flex justify-end'>
                    <input
                        type="file"
                        className="file-input file-input-bordered file-input-info w-full max-w-xs"
                        onChange={handleFileUpload}
                        // accept="image/*"
                        disabled={isProcessing}
                    />
                    {isProcessing && (
                        <div className="ml-2 flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Processing...</span>
                        </div>
                    )}
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
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default AddContactPage;