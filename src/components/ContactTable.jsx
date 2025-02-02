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

import React, { useState } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Table = ({ contactData, setContactData }) => {
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [editData, setEditData] = useState(null);

    const handleView = (data) => {
        setSelectedData(data);
        setIsViewOpen(true);
    };

    const handleEdit = (data) => {
        setEditData(data);
        setIsEditOpen(true);
    };

    const handleDelete = (data) => {
        setSelectedData(data);
        setIsDeleteOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            person: { ...prev.person, [name]: value },
        }));
    };

    const saveEdit = () => {
        const updatedContacts = contactData.map((contact) =>
            contact.id === editData.id ? editData : contact
        );
        setContactData(updatedContacts);
        setIsEditOpen(false);
    };

    const confirmDelete = () => {
        const updatedContacts = contactData.filter(
            (contact) => contact.id !== selectedData.id
        );
        setContactData(updatedContacts);
        setIsDeleteOpen(false);
    };

    return (
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
                                        onClick={() => handleDelete(data)}
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
                                    value={editData.person.name}
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
                                    name="designation"
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
                            <button className="btn btn-primary" onClick={saveEdit}>
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
                            <button className="btn btn-error" onClick={confirmDelete}>
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
    );
};

export default Table;
