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
import React, { useState } from 'react';
import Table from '@/components/ContactTable';
import contactData from '@/data/contactData';
import SearchBoxWithSuggestions from '@/components/SearchBox';
import { useFlowContext } from '@/context/FlowContext';

const ShowContactPage = () => {
    const { addContactInfoStage, setAddContactInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => {} };

    const [filteredData, setFilteredData] = useState(contactData);

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
                        data={contactData}
                        onFilter={handleFilter} // Pass filter handler
                    />
                </div>
                <Table
                    contactData={filteredData}
                    setContactData={setFilteredData} // Pass setFilteredData for updates
                    // onAdd={handleAddContact} // Pass handlers for Add, Update, Delete
                    // onUpdate={handleUpdateContact}
                    // onDelete={handleDeleteContact}
                />
            </div>
        </div>
    );
};

export default ShowContactPage;
