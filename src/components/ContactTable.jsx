import base_url from "@/base_url";
import React, { useState, useEffect } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode'
import 'react-toastify/dist/ReactToastify.css';
import DeleteContactModal from "./modals/contact/DeleteContactModal";

const Table = ({ contactData, setContactData }) => {
    // console.log("Contact Data:", contactData);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    // for edit data state
    const [editData, setEditData] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [filteredContacts, setFilteredContacts] = useState(contactData);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsEditOpen(false);
                setIsDeleteOpen(false)
                setIsViewOpen(false)
                setEditData(null);
            }
        };

        if (isEditOpen) {
            window.addEventListener("keydown", handleKeyDown);
        } else if (isDeleteOpen) {
            window.addEventListener("keydown", handleKeyDown);
        } else if (isViewOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isEditOpen, isDeleteOpen, isViewOpen]);

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
        setEditData({ ...data });
        setSelectedContactId(data.contact_id);
        setIsEditOpen(true);
    };


    const handleDelete = (contact_id) => {
        setSelectedContactId(contact_id);
        setIsDeleteOpen(true);
    };


    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('organization_')) {
            // Handle organization fields
            const orgField = name.replace('organization_', '');
            setEditData(prev => ({
                ...prev,
                organization: {
                    ...prev.organization,
                    [orgField]: value
                }
            }));
        } else {
            // Handle other fields
            setEditData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const saveEdit = async (id) => {
        const userId = Cookies.get("user_id");
        let authToken = localStorage.getItem("authToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!userId || !editData) {
            toast.error("User ID or contact data is missing!");
            return;
        }

        // Create a helper function to remove empty fields
        const removeEmptyFields = (obj) => {
            return Object.fromEntries(
                Object.entries(obj).filter(([_, value]) =>
                    value !== "" && value !== null && value !== undefined
                )
            );
        };

        // Build organization data only with non-empty fields
        const organizationData = removeEmptyFields({
            name: editData.organization?.name || "",
            email: editData.organization?.email || "",
            address: editData.organization?.address || "",
            website: editData.organization?.website || "",
            phone: editData.organization?.phone || "",
            note: editData.organization?.note || ""
        });

        // Build the base request body with non-empty fields
        const baseRequestBody = removeEmptyFields({
            user: parseInt(userId),
            name: editData.name || "",
            email: editData.email || "",
            phone: editData.phone || "",
            designation: editData.designation || "",
            note: editData.note || "",
        });

        // Only add organization_data if there are non-empty organization fields
        const requestBody = {
            ...baseRequestBody,
            ...(Object.keys(organizationData).length > 0 && {
                organization_data: organizationData
            })
        };

        // If the request body is empty (except for user ID), don't proceed
        if (Object.keys(requestBody).length <= 1) {
            toast.warning("No changes to update!");
            return;
        }

        const updateContactWithToken = async (token) => {
            try {
                const response = await fetch(`${base_url}/users/${userId}/contacts/${id}/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                    const updatedContact = await response.json();
                    setContactData((prevContacts) =>
                        prevContacts.map((contact) =>
                            contact.contact_id === id
                                ? {
                                    ...contact,
                                    name: updatedContact.name,
                                    email: updatedContact.email,
                                    phone: updatedContact.phone,
                                    designation: updatedContact.designation,
                                    organization: updatedContact.organization,
                                    note: updatedContact.note
                                }
                                : contact
                        )
                    );
                    setIsEditOpen(false);
                    setEditData(null);
                    toast.success("Contact updated successfully!");
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.message || "Failed to update contact.");
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
                            {contactData.slice().reverse().map((data) => (
                                <tr key={data.contact_id}>
                                    <td>
                                        <div className="font-bold">{data.name}</div>
                                    </td>
                                    <td>{data.designation}</td>
                                    <td>{data.organization?.name || "N/A"}</td>
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
                            <h4 className="text-md font-bold">Personal Data</h4>
                            <p>Name: {selectedData.name}</p>
                            <p>Designation: {selectedData.designation}</p>
                            <p>Email: {selectedData.email}</p>
                            <p>Phone: {selectedData.phone}</p>
                            <h4 className="text-md font-bold pt-4">Organizational  Data</h4>
                            <p>Name: {selectedData.organization.name}</p>
                            <p>Address: {selectedData.organization.address}</p>
                            <p>Email: {selectedData.organization.email}</p>
                            <p>Website: {selectedData.organization.website}</p>
                            <p>Phone: {selectedData.organization.phone}</p>
                            <div className="modal-action">
                                <button className="btn" onClick={() => setIsViewOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}

                {isEditOpen && editData && Object.keys(editData).length > 0 && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h4 className="text-2xl font-bold">Edit Contact</h4>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                saveEdit(editData.contact_id);
                            }}>
                                <h1 className="text-xl">Person Information</h1>
                                <div className="form-control">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editData.name || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={editData.designation || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={editData.phone || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <h1 className="text-xl pt-5">Organization Information</h1>
                                <div className="form-control">
                                    <label>Organization Name</label>
                                    <input
                                        type="text"
                                        name="organization_name"
                                        value={editData.organization?.name || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Organization Email</label>
                                    <input
                                        type="email"
                                        name="organization_email"
                                        value={editData.organization?.email || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Organization Address</label>
                                    <input
                                        type="text"
                                        name="organization_address"
                                        value={editData.organization?.address || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Organization Website</label>
                                    <input
                                        type="text"
                                        name="organization_website"
                                        value={editData.organization?.website || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Organization Phone</label>
                                    <input
                                        type="text"
                                        name="organization_phone"
                                        value={editData.organization?.phone || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="form-control">
                                    <label>Organization Note</label>
                                    <input
                                        type="text"
                                        name="organization_note"
                                        value={editData.organization?.note || ""}
                                        onChange={handleEditChange}
                                        className="input input-bordered"
                                    />
                                </div>
                                <div className="modal-action">

                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => {
                                            setIsEditOpen(false);
                                            setEditData(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn bg-[#0BBFBF]">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Delete Confirmation Modal */}
                <DeleteContactModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={() => confirmDelete(selectedContactId)}
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
        </>
    );
};

export default Table;
