'use client'
import React, { useState, useEffect } from 'react';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';
import DispatchTable from '@/components/DispatchTable';

const ShowDispatchPage = () => {
    const { addDispatchStage, setDispatchStage, } = useFlowContext() || { addDispatchStage: false, setDispatchStage: () => { } };
    const [filteredData, setFilteredData] = useState([]);

    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    };

    // Fetch appointments from API
    const fetchDispatches = async () => {
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

            const fetchContactsWithToken = async (token) => {
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
        fetchDispatches();
    }, []);

    const handleFilter = (filteredResults) => {
        setFilteredData(filteredResults);
    };

    const changeStage = () => {
        setDispatchStage(!addDispatchStage);
    };


    return (
        <div className='flex flex-col w-full'>
        <div className='flex justify-end'>
            <div onClick={changeStage}>
                <button className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110">+ Add New Dispatch</button>
            </div>
        </div>
        <div className='mt-7'>
            {/* <div className='flex justify-end'>
                <SearchBoxWithSuggestions
                    data={filteredData}
                    onFilter={handleFilter} // Pass filter handler
                />
            </div> */}
            <DispatchTable
                dispatchData={filteredData}
                setDispatchData={setFilteredData} // Pass setFilteredData for updates
            />
        </div>
        
    </div>

    );
};

export default ShowDispatchPage;