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
