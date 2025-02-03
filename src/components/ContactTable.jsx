// import React, { useState } from 'react';
// import { FaEdit } from "react-icons/fa";
// import { FaEye } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";

// const Table = ({ contactData }) => {
//     const [isOpen, setIsOpen] = useState(false)
//     const [selectedData, setSelectedData] = useState(null)

//     const handleView = (data)=>{
//         setIsOpen(true)
//         setSelectedData(data)
//         console.log(data)
//     }
//     return (
//         <div>

//             <div className="overflow-x-auto">
//                 <table className="table">
//                     {/* head */}
//                     <thead>
//                         <tr>

//                             <th>Name</th>
//                             <th>Designation</th>
//                             <th>Organizaton</th>
//                             <th>Email</th>
//                             <th>Phone</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {/* row 1 */}
//                         {
//                             contactData.map((data) => {
//                                 return (
//                                     <tr key={data.id}>
//                                         {/* Name */}
//                                         <td>
//                                             <div className="flex items-center gap-3">
//                                                 <div>
//                                                     <div className="font-bold">{data.person.name}</div>
//                                                 </div>
//                                             </div>
//                                         </td>

//                                         {/* Designation */}
//                                         <td>
//                                             {data.person.designation}
//                                         </td>
//                                         {/* Organization */}
//                                         <td>
//                                             {data.organization.name}
//                                         </td>
//                                         {/* Email */}
//                                         <td>
//                                             {data.person.email}
//                                         </td>
//                                         {/* Phone */}
//                                         <td>
//                                             {data.person.phone}
//                                         </td>
//                                         {/* Action */}
//                                         <td className='flex justify-between gap-5'>
//                                             <label htmlFor="showContactModal" onClick={() => handleView(data)}> <FaEye className='h-5 w-5 text-green-500 cursor-pointer' /></label>

//                                             <FaEdit className='h-5 w-5 text-blue-500 cursor-pointer' />
//                                             <MdDelete className='h-5 w-5 text-red-500 cursor-pointer' />
//                                         </td>

//                                     </tr>

//                                 )
//                             })
//                         }

//                     </tbody>
//                     {/* foot */}
//                     <tfoot>
//                         <tr>

//                             <th>Name</th>
//                             <th>Designation</th>
//                             <th>Organizaton</th>
//                             <th>Email</th>
//                             <th>Phone</th>
//                             <th>Action</th>
//                         </tr>
//                     </tfoot>
//                 </table>

//                 {
//                     isOpen && selectedData && (
//                         <div>
//                             <input type="checkbox" id="showContactModal" className="modal-toggle" />
//                             <div className="modal" role="dialog">
//                                 <div className="modal-box">
//                                 <div>
// <h4 className="text-md font-bold">Person</h4>
// <p>Name: {selectedData.person.name}</p>
// <p>Designation: {selectedData.person.designation}</p>
// <p>Email: {selectedData.person.email}</p>
// <p>Phone: {selectedData.person.phone}</p>

// <h4 className="text-md font-bold mt-4">Organization</h4>
// <p>Name: {selectedData.organization.name}</p>
// <p>Address: {selectedData.organization.address}</p>
// <p>Email: {selectedData.organization.email}</p>
// <p>
//     Website:{" "}
//     <a
//         href={selectedData.organization.web}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-500 underline"
//     >
//         {selectedData.organization.web}
//     </a>
// </p>
// <p>Phone: {selectedData.organization.phone}</p>
//                         </div>
//                                 </div>
//                                 <label className="modal-backdrop" htmlFor="showContactModal">Close</label>
//                             </div>
//                         </div>
//                     )
//                 }
//             </div>
//         </div>
//     );
// };

// export default Table;

import base_url from "@/base_url";
import React, { useState } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import {jwtDecode} from 'jwt-decode'
import 'react-toastify/dist/ReactToastify.css';

const Table = ({ contactData, setContactData }) => {
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [editData, setEditData] = useState([]);
    const [selectedContactId, setSelectedContactId] = useState(null);

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


    const handleView = (data) => {
        setSelectedData(data);
        setIsViewOpen(true);
    };

    const handleEdit = (data) => {
        setEditData(data);
        setSelectedContactId(data.contact_id);
        setIsEditOpen(true);
    };

    const handleDelete = (contact_id) => {
        setSelectedContactId(contact_id);
        setIsDeleteOpen(true);
    };

    // const handleEditChange = (e) => {
    //     const { name, value } = e.target;
    //     setEditData((prev) => ({
    //         ...prev,
    //         person: { ...prev.person, [name]: value },
    //     }));
    // };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value, // Directly update the field
        }));
    };
    

    // const saveEdit = () => {
    //     const updatedContacts = contactData.map((contact) =>
    //         contact.id === editData.id ? editData : contact
    //     );
    //     setContactData(updatedContacts);
    //     setIsEditOpen(false);
    // };

    const saveEdit = async (id) => {
        console.log(id)
        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
    
        if (!userId || !editData) {
            toast.error("User ID or contact data is missing!");
            return;
        }
    
        const requestBody = {
            user: parseInt(userId),
            name: editData.name,
            email: editData.email,
            phone: editData.phone,
            designation: editData.designation,
            organization: editData.organization,
            tags: [],
            note: editData.note || "",
        };
    
        const updateContactWithToken = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/contacts/${id}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                });
    
                if (response.ok) {
                    const updatedContacts = contactData.map((contact) =>
                        contact.id === editData.id ? { ...contact, ...requestBody } : contact
                    );
                    toast.success("Contact updated successfully!");
                    setContactData(updatedContacts);
                    setIsEditOpen(false);
                    
                } else {
                    toast.error("Failed to update contact.");
                }
            } catch (error) {
                console.error("Error updating contact:", error);
                toast.error("An error occurred while updating.");
            }
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
                await updateContactWithToken(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error("Session expired. Please log in again.");
            }
        };
    
        if (authToken && !isTokenExpired(authToken)) {
            await updateContactWithToken(authToken);
        } else if (refreshToken) {
            await refreshAndRetry();
        } else {
            toast.error("Authentication error. Please log in.");
        }
    };
    

    // fix v1
    // const confirmDelete = async (id) => {
    //     const userId = Cookies.get('user_id');
    //     const authToken = localStorage.getItem('authToken');
    //     console.log("user id is: ",userId)
    //     console.log("Deleting Contact ID:", id);

    //     if (!id) {
    //         console.error("ID is undefined or null!");
    //         return;
    //     }

    //     try {
    //         const response = await fetch(`${base_url}/api/users/${userId}/contacts/${id}`, {
    //             method: "DELETE",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${authToken}`,
    //             },
    //         });

    //         if (response.ok) {
    //             // Remove the deleted contact from the local state
    //             setContactData(contactData.filter((contact) => contact.contact_id !== id));
    //             setIsDeleteOpen(false);
    //             console.log("Contact deleted successfully");
    //         } else {
    //             console.log("Failed to delete contact");
    //         }
    //     } catch (error) {
    //         console.log("Error:", error);
    //     }
    // };

    // fix v2
    const confirmDelete = async (id) => {
        const userId = Cookies.get('user_id');
        let authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        console.log("User ID is:", userId);
        console.log("Deleting Contact ID:", id);

        if (!id) {
            console.error("ID is undefined or null!");
            return;
        }

        if (!authToken && !refreshToken) {
            toast.error("Please log in first.");
            return;
        }

        const deleteContactWithToken = async (token) => {
            const response = await fetch(`${base_url}/users/${userId}/contacts/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Remove the deleted contact from the local state
                setContactData(contactData.filter((contact) => contact.contact_id !== id));
                setIsDeleteOpen(false);
                console.log("Contact deleted successfully");
            } else {
                console.log("Failed to delete contact");
            }
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
                    throw new Error("Token refresh failed. Please log in again.");
                }

                const refreshData = await refreshResponse.json();
                authToken = refreshData.access;
                localStorage.setItem("authToken", authToken);
                console.log("Token refreshed successfully:", authToken);

                // Retry the delete request with the new token
                await deleteContactWithToken(authToken);
            } catch (err) {
                console.error("Refresh and Retry Error:", err);
                toast.error(err.message || "An error occurred.");
            }
        };

        try {
            if (authToken && !isTokenExpired(authToken)) {
                await deleteContactWithToken(authToken);
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
    };





    return (
       
        <>
         <div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Organization</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactData.map((data) => (
                            <tr key={data.contact_id}>
                                <td>
                                    <div className="font-bold">{data.name}</div>
                                </td>
                                <td>{data.designation}</td>
                                <td>{data.organization}</td>
                                <td>{data.email}</td>
                                <td>{data.phone}</td>
                                {/* <td>{data.phone}</td> */}

                                <td className="flex justify-between gap-5">
                                    <FaEye
                                        className="h-5 w-5 text-green-500 cursor-pointer"
                                        onClick={() => handleView(data)}
                                    />
                                    <FaEdit
                                        className="h-5 w-5 text-blue-500 cursor-pointer"
                                        onClick={() => handleEdit(data)}
                                    />
                                    <MdDelete
                                        className="h-5 w-5 text-red-500 cursor-pointer"
                                        onClick={() => handleDelete(data.contact_id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            {isViewOpen && selectedData && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h4 className="text-md font-bold">Person</h4>
                        <p>Name: {selectedData.name}</p>
                        <p>Designation: {selectedData.designation}</p>
                        <p>Email: {selectedData.email}</p>
                        <p>Phone: {selectedData.phone}</p>

                        {/* <h4 className="text-md font-bold mt-4">Organization</h4>
                        <p>Name: {selectedData.name}</p>
                        <p>Address: {}</p>
                        <p>Email: {}</p>
                        <p>
                            Website:{" "}
                            <a
                                href={selectedData.organization.web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                {selectedData}
                            </a>
                        </p>
                        <p>Phone: {selectedData.organization.phone}</p>*/}
                        <div className="modal-action">
                            <button className="btn" onClick={() => setIsViewOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && editData && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h4 className="text-2xl font-bold">Edit Contact</h4>
                        <form>
                            <h1 className="text-xl">Person Informaton</h1>
                            <div className="form-control">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={editData.designation}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editData.phone}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <h1 className="text-xl pt-5">Organizational Information</h1>
                            <div className="form-control">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={editData.organization}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            {/* <div className="form-control">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div> */}
                            {/* <div className="form-control">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div> */}
                            {/* <div className="form-control">
                                <label>Website</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div> */}
                            {/* <div className="form-control">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div> */}
                        </form>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={()=>saveEdit(selectedContactId)}>
                                Save
                            </button>
                            <button className="btn" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            Are you sure you want to delete this contact?
                        </h3>
                        <p className="py-4">
                            This action cannot be undone. The contact will be permanently
                            removed.
                        </p>
                        <div className="modal-action">
                            <button className="btn btn-error" onClick={() => confirmDelete(selectedContactId)}>
                                Delete
                            </button>
                            <button className="btn" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

           
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
        </>
    );
};

export default Table;
