'use client'
import React, { useState, useEffect } from 'react'; 
import { useFlowContext } from '@/context/FlowContext';
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import base_url from '@/base_url';

const AddContactPage = () => {
    const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };

    const [person, setPerson] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [organization, setOrganization] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        web: '',
    });

    const [organizations, setOrganizations] = useState([]); // New state for organizations

    // Fetch organizations on component mount
    useEffect(() => {
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
                    if (!response.ok) throw new Error('Failed to fetch organizations');
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
                    if (!refreshResponse.ok) throw new Error('Token refresh failed');
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

        fetchOrganizations();
    }, []);

    // Helper function to check if the token is expired
    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now(); // Token expired check
        } catch (error) {
            return true;
        }
    };

    // Handle person field changes
    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPerson(prev => ({ ...prev, [name]: value }));
    };

    // Handle organization field changes
    const handleOrganizationChange = (e) => {
        const { name, value } = e.target;
        setOrganization(prev => ({ ...prev, [name]: value }));
    };

    // Handle selecting organization and auto-filling fields
    const handleOrganizationSelect = (e) => {
        const selectedOrgName = e.target.value;
        const selectedOrg = organizations.find((org) => org.name === selectedOrgName);

        if (selectedOrg) {
            setOrganization({
                name: selectedOrg.name,
                address: selectedOrg.address,
                email: selectedOrg.email,
                phone: selectedOrg.phone,
                web: selectedOrg.web
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // Check if organization exists
        const existingOrg = organizations.find(org => org.name === organization.name);

        const data = {
            user: parseInt(userId),
            first_name: person.first_name,
            last_name: person.last_name,
            email: person.email,
            phone: person.phone,
            address: person.address,
            organization_name: organization.name,
            // Conditionally include organization details only if it's new
            ...(!existingOrg ? {
                organization_address: organization.address,
                organization_email: organization.email,
                organization_website: organization.web,
                organization_phone: organization.phone,
            } : {})
        };

        try {
            const response = await fetch(`${base_url}/users/${userId}/contacts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to add contact');
            const result = await response.json();
            toast.success('Contact added successfully');
            // Handle success and close modal or redirect as necessary
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error('Failed to add contact');
        }
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <ToastContainer />
            <h2 className="text-2xl mb-4">Add Contact</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-lg">
                {/* Person Info */}
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={person.first_name}
                        onChange={handlePersonChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={person.last_name}
                        onChange={handlePersonChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={person.email}
                        onChange={handlePersonChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={person.phone}
                        onChange={handlePersonChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={person.address}
                        onChange={handlePersonChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                {/* Organization Info */}
                <div className="form-group">
                    <label>Organization Name</label>
                    <input
                        type="text"
                        name="name"
                        value={organization.name}
                        onChange={handleOrganizationSelect}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                        list="organization-suggestions"
                    />
                    <datalist id="organization-suggestions">
                        {organizations.map((org) => (
                            <option key={`${org.id}-${org.name}`} value={org.name} />
                        ))}
                    </datalist>
                </div>
                <div className="form-group">
                    <label>Organization Address</label>
                    <input
                        type="text"
                        name="address"
                        value={organization.address}
                        onChange={handleOrganizationChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Organization Email</label>
                    <input
                        type="email"
                        name="email"
                        value={organization.email}
                        onChange={handleOrganizationChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Organization Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={organization.phone}
                        onChange={handleOrganizationChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>
                <div className="form-group">
                    <label>Organization Website</label>
                    <input
                        type="text"
                        name="web"
                        value={organization.web}
                        onChange={handleOrganizationChange}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-4 p-2 bg-blue-500 text-white rounded-md"
                >
                    Add Contact
                </button>
            </form>
        </div>
    );
};

export default AddContactPage;
