// import React, { useState } from 'react';
// import { format } from 'date-fns';
// import { FaEdit } from "react-icons/fa";
// import { FaEye } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";

// const AppointmentTable = ({ appointmentData, setAppointmentData }) => {
//     const [isViewOpen, setIsViewOpen] = useState(false);
//     const [isEditOpen, setIsEditOpen] = useState(false);
//     const [isDeleteOpen, setIsDeleteOpen] = useState(false);
//     const [selectedData, setSelectedData] = useState(null);
//     const [editData, setEditData] = useState(null);

//     const handleView = (data) => {
//         setSelectedData(data);
//         setIsViewOpen(true);
//     };

//     const handleEdit = (data) => {
//         setEditData(data);
//         setIsEditOpen(true);
//     };

//     const handleDelete = (data) => {
//         setSelectedData(data);
//         setIsDeleteOpen(true);
//     };

//     const handleEditChange = (e) => {
//         const { name, value } = e.target;
//         setEditData((prev) => ({
//             ...prev,
//             person: { ...prev.person, [name]: value },
//         }));
//     };

//     const saveEdit = () => {
//         const updatedAppointments = appointmentData.map((contact) =>
//             contact.id === editData.id ? editData : contact
//         );
//         setAppointmentData(updatedAppointments);
//         setIsEditOpen(false);
//     };

//     const confirmDelete = () => {
//         const updatedAppointments = appointmentData.filter(
//             (appointmnet) => appointmnet.id !== selectedData.id
//         );
//         setAppointmentData(updatedAppointments);
//         setIsDeleteOpen(false);
//     };
//     return (
//         <div>
//             <div className="overflow-x-auto">
//                 <table className="table">
//                     {/* head */}
//                     <thead>
//                         <tr>

//                             <th>Time</th>
//                             <th>With</th>
//                             <th>Designation of The Company</th>
//                             <th>Location</th>
//                             {/* <th>Phone</th> */}
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {/* row 1 */}
//                         {
//                             appointmentData.map((data) => {
//                                 return (
//                                     <tr key={data.id}>
//                                         {/* Time */}
//                                         <td>
//                                             <div className="flex items-center gap-3">
//                                                 <div>
//                                                     <div className="font-bold"> {format(new Date(data.start_date), 'dd-MM-yyyy')} - {data.start_time}</div>
//                                                 </div>
//                                             </div>
//                                         </td>

//                                         {/* With */}
//                                         <td>
//                                             {data.with}
//                                         </td>
//                                         {/* Designation */}
//                                         <td>
//                                             {data.designation_of_the_with}
//                                         </td>
//                                         {/* Location */}
//                                         <td>
//                                             {data.meeting_location}
//                                         </td>


//                                         {/* Action */}
//                                         <td className='flex justify-between gap-5'>
//                                             <FaEye className='h-5 w-5 text-green-500 cursor-pointer' onClick={() => handleView(data)} />
//                                             <FaEdit className='h-5 w-5 text-blue-500 cursor-pointer' onClick={() => handleEdit(data)} />
//                                             <MdDelete className='h-5 w-5 text-red-500 cursor-pointer' onClick={() => handleDelete(data)} />
//                                         </td>


//                                     </tr>

//                                 )
//                             })
//                         }


//                     </tbody>
//                     {/* foot */}
//                     <tfoot>
//                         <tr>

//                             <th>Time</th>
//                             <th>With</th>
//                             <th>Designation of The Company</th>
//                             <th>Location</th>
//                             {/* <th>Phone</th> */}
//                             <th>Action</th>
//                         </tr>
//                     </tfoot>
//                 </table>
//             </div>
//             {/* View Modal */}
//             {isViewOpen && selectedData && (
//                 <div className="modal modal-open">
//                     <div className="modal-box">
//                         <h4 className="text-md font-bold">Appointment</h4>
//                         <p>With: {selectedData.with}</p>
//                         <p>Designaton: {selectedData.designation_of_the_with}</p>
//                         <p>Location: {selectedData.meeting_location}</p>
//                         <p>On: {format(new Date(selectedData.start_date), 'dd-MM-yyyy')} at {selectedData.start_time}</p>
//                         <div className="modal-action">
//                             <button className="btn" onClick={() => setIsViewOpen(false)}>
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}


//             {/* Edit Modal */}
//             {isEditOpen && editData && (
//                 <div className="modal modal-open">
//                     <div className="modal-box">
//                         <h4 className="text-2xl font-bold">Edit Appointment</h4>
//                         <form>
//                             <h1 className="text-xl">Person Informaton</h1>
//                             <div className="form-control">
//                                 <label>With</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={editData.with}
//                                     onChange={handleEditChange}
//                                     className="input input-bordered"
//                                 />
//                             </div>
//                             <div className="form-control">
//                                 <label>Designation</label>
//                                 <input
//                                     type="text"
//                                     name="designation"
//                                     value={editData.designation_of_the_with}
//                                     onChange={handleEditChange}
//                                     className="input input-bordered"
//                                 />
//                             </div>
//                             <div className="form-control">
//                                 <label>Location</label>
//                                 <input
//                                     type="text"
//                                     name="designation"
//                                     value={editData.meeting_location}
//                                     onChange={handleEditChange}
//                                     className="input input-bordered"
//                                 />
//                             </div>
                            
                            
//                             <div className="form-control">
//                                 <label>Date</label>
//                                 <input
//                                     type="text"
//                                     name="designation"
//                                     value={editData.start_date}
//                                     onChange={handleEditChange}
//                                     className="input input-bordered"
//                                 />
//                             </div>
//                             <div className="form-control">
//                                 <label>Time</label>
//                                 <input
//                                     type="text"
//                                     name="designation"
//                                     value={editData.start_time}
//                                     onChange={handleEditChange}
//                                     className="input input-bordered"
//                                 />
//                             </div>
                            
                            

//                         </form>
//                         <div className="modal-action">
//                             <button className="btn btn-primary" onClick={saveEdit}>
//                                 Save
//                             </button>
//                             <button className="btn" onClick={() => setIsEditOpen(false)}>
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}



//             {/* Delete Confirmation Modal */}
//             {isDeleteOpen && (
//                 <div className="modal modal-open">
//                     <div className="modal-box">
//                         <h3 className="font-bold text-lg">
//                             Are you sure you want to delete this contact?
//                         </h3>
//                         <p className="py-4">
//                             This action cannot be undone. The contact will be permanently
//                             removed.
//                         </p>
//                         <div className="modal-action">
//                             <button className="btn btn-error" onClick={confirmDelete}>
//                                 Delete
//                             </button>
//                             <button className="btn" onClick={() => setIsDeleteOpen(false)}>
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

// export default AppointmentTable;


import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const AppointmentTable = ({ appointmentData, setAppointmentData }) => {
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
        setEditData(data); // Set the data to be edited
        setIsEditOpen(true); // Open the edit modal
    };

    const handleDelete = (data) => {
        setSelectedData(data); // Set the data to be deleted
        setIsDeleteOpen(true); // Open the delete confirmation modal
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value, // Update the correct property
        }));
    };

    const saveEdit = () => {
        const updatedAppointments = appointmentData.map((appointment) =>
            appointment.id === editData.id ? editData : appointment
        );
        setAppointmentData(updatedAppointments);
        setIsEditOpen(false); // Close the modal
    };

    const confirmDelete = () => {
        const updatedAppointments = appointmentData.filter(
            (appointment) => appointment.id !== selectedData.id
        );
        setAppointmentData(updatedAppointments);
        setIsDeleteOpen(false); // Close the modal
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>With</th>
                            <th>Designation of The Company</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointmentData.map((data) => (
                            <tr key={data.id}>
                                {/* Time */}
                                <td>
                                    <div className="font-bold">
                                        {format(new Date(data.start_date), 'dd-MM-yyyy')} - {data.start_time}
                                    </div>
                                </td>
                                {/* With */}
                                <td>{data.with}</td>
                                {/* Designation */}
                                <td>{data.designation_of_the_with}</td>
                                {/* Location */}
                                <td>{data.meeting_location}</td>
                                {/* Action */}
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
                        <h4 className="text-md font-bold">Appointment</h4>
                        <p>With: {selectedData.with}</p>
                        <p>Designation: {selectedData.designation_of_the_with}</p>
                        <p>Location: {selectedData.meeting_location}</p>
                        <p>
                            On: {format(new Date(selectedData.start_date), 'dd-MM-yyyy')} at {selectedData.start_time}
                        </p>
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
                        <h4 className="text-2xl font-bold">Edit Appointment</h4>
                        <form>
                            <div className="form-control">
                                <label>With</label>
                                <input
                                    type="text"
                                    name="with"
                                    value={editData.with}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Designation</label>
                                <input
                                    type="text"
                                    name="designation_of_the_with"
                                    value={editData.designation_of_the_with}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="meeting_location"
                                    value={editData.meeting_location}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={editData.start_date}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={editData.start_time}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
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
                            Are you sure you want to delete this appointment?
                        </h3>
                        <p className="py-4">This action cannot be undone.</p>
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

export default AppointmentTable;
