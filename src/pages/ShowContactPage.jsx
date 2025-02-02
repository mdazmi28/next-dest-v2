// 'use client'
// import React,{useState} from 'react';
// import Table from '@/components/ContactTable';
// import contactData from '@/data/contactData';
// import SearchBoxWithSuggestions from '@/components/SearchBox';
// import { useFlowContext } from '@/context/FlowContext';

// const ShowContactPage = () => {
//     // const {addContactInfoStage, setAddContactInfoStage} = useFlowContext()
//     const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => {} };

//     const [filteredData, setFilteredData] = useState(contactData);

//     const handleFilter = (filteredResults) => {
//         setFilteredData(filteredResults);
//     };

//     const changeStage = () =>{
//         setAddContactInfoStage(!addContactInfoStage)
//     }

//     return (
//         <div className='flex flex-col w-full'>
//             <div className='flex justify-end'>
//                 <div onClick={changeStage}>
//                 <button className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110">+ Add New Contact</button>
//                 </div>
//             </div>
//             <div className='mt-7'>
//                 <div className='flex justify-end'>
//                     <SearchBoxWithSuggestions
//                         data={contactData}
//                         onFilter={handleFilter} // Pass filter handler
//                     />
//                 </div>
//                 <Table contactData={filteredData} />
//             </div>
//         </div>
//     );
// };

// export default ShowContactPage;

'use client';
import React, { useState, useEffect } from 'react';
import Table from '@/components/ContactTable';
import contactData from '@/data/contactData';
import SearchBoxWithSuggestions from '@/components/SearchBox';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';

const ShowContactPage = () => {
    const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };

    const [filteredData, setFilteredData] = useState([]);

    const fetchContacts = async () => {
        try {
            const userId = Cookies.get('user_id');
            // console.log(userId)
            if (!userId) {
                console.error("User ID not found in cookies.");
                return;
            }
            
            console.log("Fetching contacts for user:", userId);
            const authToken = localStorage.getItem('authToken');
            console.log("Auth Token:", authToken);

            const response = await fetch(`${base_url}/api/users/${userId}/contacts/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("API Response:", data);
            setFilteredData(data);
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

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
        </div>
    );
};

export default ShowContactPage;
