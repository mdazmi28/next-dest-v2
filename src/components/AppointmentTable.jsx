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
            [name]: value,
        }));
    };

    const saveEdit = () => {
        const updatedAppointments = appointmentData.map((appointment) =>
            appointment.appointment_id === editData.appointment_id ? editData : appointment
        );
        setAppointmentData(updatedAppointments);
        setIsEditOpen(false);
    };

    const confirmDelete = () => {
        const updatedAppointments = appointmentData.filter(
            (appointment) => appointment.appointment_id !== selectedData.appointment_id
        );
        setAppointmentData(updatedAppointments);
        setIsDeleteOpen(false);
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointmentData.map((data, index) => (
                            <tr key={data.appointment_id || index}>
                                {/* Time */}
                                <td>
                                    <div className="font-bold">
                                    {new Date(data.start_time).toLocaleDateString("en-GB")}
                                    {/* {new Date(data.start_time).toISOString().split("T")[0].split("-").reverse().join("-")} */}


                                    </div>
                                </td>
                                {/* With */}
                                <td>{data.title}</td>
                                {/* Designation */}
                                <td>{data.description}</td>
                                {/* Location */}
                                <td>{data.location}</td>
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
                        <h4 className="text-md font-bold">Appointment Details</h4>
                        <p>Title: {selectedData.title}</p>
                        <p>Description: {selectedData.description}</p>
                        <p>Location: {selectedData.location}</p>
                        <p>
                            On: {format(new Date(selectedData.start_time), 'dd-MM-yyyy HH:mm')}
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
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editData.title}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={editData.description}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={editData.location}
                                    onChange={handleEditChange}
                                    className="input input-bordered"
                                />
                            </div>
                            <div className="form-control">
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
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