'use client';
import React, { useState, useEffect } from 'react';
import Table from '@/components/ContactTable';
import SearchBoxWithSuggestions from '@/components/SearchBox';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'
import AttachmentTable from '@/components/AttachmentTable';

const ShowAttachmentPage = () => {
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

    const fetchAttachments = async () => {
        try {
            const userId = Cookies.get('user_id');
            if (!userId) {
                console.error("User ID not found in cookies.");
                return;
            }

            // console.log("Fetching contacts for user:", userId);
            let authToken = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');

            // If no authToken, check refresh token and try refreshing
            if (!authToken && !refreshToken) {
                toast.error("Please log in first.");
                return;
            }

            const fetchAttachmentsWithToken = async (token) => {
                const response = await fetch(`${base_url}/users/${userId}/dispatches/`, {
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
                    await fetchAttachmentsWithToken(authToken);
                } catch (err) {
                    console.error("Refresh and Retry Error:", err);
                    toast.error(err.message || "An error occurred.");
                }
            };

            try {
                if (authToken && !isTokenExpired(authToken)) {
                    await fetchAttachmentsWithToken(authToken);
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
        fetchAttachments();
    }, []);


    return (
        <div>
              <AttachmentTable
                    attachmentData={filteredData}
                    setAttachmentData={setFilteredData} // Pass setFilteredData for updates
                />

        </div>
    );
};

export default ShowAttachmentPage;