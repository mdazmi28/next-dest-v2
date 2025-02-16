import React from 'react';
import dayjs from 'dayjs';

const ViewAppointmentModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h4 className="text-md font-bold">Appointment Details</h4>
                <div className="space-y-2">
                    <p><strong>Title:</strong> {data.title || "Nothing Here"}</p>
                    <p><strong>Description:</strong> {data.description}</p>
                    <p><strong>Location:</strong> {data.location}</p>
                    {/* <p><strong>Meeting Type:</strong> {data.meeting_type || 'Not specified'}</p> */}
                    {/* <p><strong>With:</strong> {data.With || 'Not specified'}</p> */}
                    <p><strong>With:</strong></p>
                    {data.with_contacts.map((contact, index) => (
                        <p className='flex flex-col' key={contact.contact_id || index}>
                            <li className='pl-7'>
                                {contact.name} - {contact.designation} at {contact.organization?.name}
                            </li></p>
                    ))}
                    <div>
                        <strong>Time:</strong>
                        <p>From: {dayjs(data.start).format('DD-MM-YY hh:mm A')}</p>
                        <p>To: {dayjs(data.end).format('DD-MM-YY hh:mm A')}</p>
                    </div>
                    {data.note && (
                        <p><strong>Note:</strong> {data.note}</p>
                    )}
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAppointmentModal;