'use client';
import React, { useState, useEffect } from 'react';
import Table from '@/components/ContactTable';
import SearchBoxWithSuggestions from '@/components/SearchBox';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { ToastContainer, toast } from "react-toastify";
import {jwtDecode} from 'jwt-decode'

const ShowContactPage = () => {
    const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };

    const [filteredData, setFilteredData] = useState([]);

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            if (!decoded.exp) return false; // If no expiry time, assume it's valid
            return decoded.exp * 1000 < Date.now(); // Convert exp to milliseconds
        } catch (error) {
            console.error("Invalid token:", error);
            return true; // Assume expired if decoding fails
        }
    };


    // const fetchContacts = async () => {
    //     try {
    //         const userId = Cookies.get('user_id');
    //         // console.log(userId)
    //         if (!userId) {
    //             console.error("User ID not found in cookies.");
    //             return;
    //         }

    //         console.log("Fetching contacts for user:", userId);
    //         const authToken = localStorage.getItem('authToken');
    //         console.log("Auth Token:", authToken);

    //         const response = await fetch(`${base_url}/api/users/${userId}/contacts/`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${authToken}`,
    //             },
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             console.log(`Error ${response.status}: ${errorText}`);
    //         }

    //         const data = await response.json();
    //         console.log("API Response:", data);
    //         setFilteredData(data);
    //     } catch (error) {
    //         console.error("Failed to fetch contacts:", error);
    //     }
    // };

    // const fetchContacts = async () => {
    //     try {
    //         const userId = Cookies.get("user_id");
    //         if (!userId) {
    //             console.error("User ID not found in cookies.");
    //             return;
    //         }

    //         let token = localStorage.getItem("authToken");
    //         const rToken = localStorage.getItem("refreshToken");

    //         if (!token && !rToken) {
    //             toast.error("Please log in first.");
    //             return;
    //         }

    //         // Fetch contacts with the current token
    //         const fetchContactsWithToken = async (authToken) => {
    //             console.log("Using Token:", authToken);

    //             const response = await fetch(`${base_url}/api/users/${userId}/contacts/`, {
    //                 method: "GET",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     "Authorization": `Bearer ${authToken}`,
    //                 },
    //             });

    //             if (!response.ok) {
    //                 if (response.status === 401) {
    //                     throw new Error("401 Unauthorized"); // Triggers token refresh
    //                 }
    //                 const errorData = await response.text();
    //                 console.log(`Error ${response.status}: ${errorData}`);
    //             }

    //             const data = await response.json();
    //             console.log("API Response:", data);
    //             setFilteredData(data);
    //         };

    //         // Refresh token if access token is expired
    //         const refreshAndRetry = async () => {
    //             try {
    //                 console.log("Attempting to refresh token...");
    //                 const refreshResponse = await fetch(`${base_url}/refresh`, {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({ refresh_token: rToken }),
    //                 });

    //                 if (!refreshResponse.ok) {
    //                     console.log("Token refresh failed. Please log in again.");
    //                 }

    //                 const refreshData = await refreshResponse.json();
    //                 token = refreshData.token;
    //                 localStorage.setItem("authToken", token);
    //                 console.log("Token refreshed successfully:", token);

    //                 // Retry with new token
    //                 await fetchContactsWithToken(token);
    //             } catch (err) {
    //                 console.error("Refresh and Retry Error:", err);
    //                 toast.error(err.message || "An error occurred.");
    //                 handleLogout();
    //             }
    //         };

    //         try {
    //             if (token) {
    //                 await fetchContactsWithToken(token);
    //             } else if (rToken) {
    //                 await refreshAndRetry();
    //             }
    //         } catch (err) {
    //             if (err.message.includes("401")) {
    //                 console.log("Token expired, attempting refresh...");
    //                 await refreshAndRetry();
    //             } else {
    //                 console.error("Error:", err);
    //                 toast.error(err.message || "An error occurred.");
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch contacts:", error);
    //     }
    // };


    const fetchContacts = async () => {
        try {
            const userId = Cookies.get('user_id');
            if (!userId) {
                console.error("User ID not found in cookies.");
                return;
            }

            console.log("Fetching contacts for user:", userId);
            let authToken = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');

            // If no authToken, check refresh token and try refreshing
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
                }

                const data = await response.json();
                console.log("API Response:", data);
                setFilteredData(data);
            };

            // Function to refresh the token if expired
            const refreshAndRetry = async () => {
                try {
                    console.log("Attempting to refresh token...");
                    const refreshResponse = await fetch(`${base_url}/token/refresh/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ refresh: refreshToken }),
                    });

                    if (!refreshResponse.ok) {
                        toast.error("Token refresh failed. Please log in again.");
                    }

                    const refreshData = await refreshResponse.json();
                    authToken = refreshData.access;
                    localStorage.setItem("authToken", authToken);
                    console.log("Token refreshed successfully:", authToken);

                    // Retry the API request with the new token
                    await fetchContactsWithToken(authToken);
                } catch (err) {
                    console.error("Refresh and Retry Error:", err);
                    toast.error(err.message || "An error occurred.");
                }
            };

            try {
                if (authToken && !isTokenExpired(authToken)) {
                    await fetchContactsWithToken(authToken);
                } else if (refreshToken) {
                    await refreshAndRetry();
                }
            } catch (err) {
                if (err.message.includes("401")) {
                    console.log("Token expired, attempting refresh...");
                    await refreshAndRetry();
                } else {
                    console.error("Error:", err);
                    toast.error(err.message || "An error occurred.");
                }
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };



    useEffect(() => {
        fetchContacts();
    }, []);

    const handleFilter = (filteredResults) => {
        setFilteredData(filteredResults);
    };

    const changeStage = () => {
        setAddContactInfoStage(!addContactInfoStage);
    };

    // const handleAddContact = (newContact) => {
    //     setFilteredData((prev) => [...prev, newContact]);
    // };

    // const handleUpdateContact = (updatedContact) => {
    //     setFilteredData((prev) =>
    //         prev.map((contact) =>
    //             contact.id === updatedContact.id ? updatedContact : contact
    //         )
    //     );
    // };

    // const handleDeleteContact = (id) => {
    //     setFilteredData((prev) => prev.filter((contact) => contact.id !== id));
    // };



    return (
        <div className='flex flex-col w-full'>
            <div className='flex justify-end'>
                <div onClick={changeStage}>
                    <button className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110">+ Add New Contact</button>
                </div>
            </div>
            <div className='mt-7'>
                <div className='flex justify-end'>
                    <SearchBoxWithSuggestions
                        data={filteredData}
                        onFilter={handleFilter} // Pass filter handler
                    />
                </div>
                <Table
                    contactData={filteredData}
                    setContactData={setFilteredData} // Pass setFilteredData for updates
                />
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

export default ShowContactPage;
