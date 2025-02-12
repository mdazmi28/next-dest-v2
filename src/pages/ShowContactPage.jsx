'use client';
import React, { useState, useEffect } from 'react';
import Table from '@/components/ContactTable';
import SearchBoxWithSuggestions from '@/components/SearchBox';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { ToastContainer, toast } from "react-toastify";
import {jwtDecode} from 'jwt-decode'
import AddContactModal from '@/components/modals/contact/AddContactModal';

const ShowContactPage = () => {
    // Maintain both original and filtered data
    const [originalData, setOriginalData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
     const [isModalOpen, setIsModalOpen] = useState(false); // Add state for modal


     const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchContacts(); // Refetch data after modal closes
    };

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            if (!decoded.exp) return false;
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error("Invalid token:", error);
            return true;
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
                // Set both original and filtered data
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
        fetchContacts();
    }, []);

    const handleFilter = (filtered) => {
        setFilteredData(filtered);
    };

    const changeStage = () => {
        setAddContactInfoStage(!addContactInfoStage);
    };

    // Update table data handler
    const handleTableDataUpdate = (updatedData) => {
        setOriginalData(updatedData);
        setFilteredData(updatedData);
    };

    return (
        <div className='flex flex-col w-full'>
            <div className='flex justify-end'>
                <div onClick={handleOpenModal}>
                    <button className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110">
                        + Add New Contact
                    </button>
                </div>
            </div>
            <div className='mt-7'>
                <div className='flex justify-end'>
                    <SearchBoxWithSuggestions
                        data={originalData} // Pass original data for filtering
                        onFilter={handleFilter}
                    />
                </div>
                <Table
                    contactData={filteredData}
                    setContactData={handleTableDataUpdate} // Use the new update handler
                />
            </div>
            <AddContactModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
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

export default ShowContactPage;