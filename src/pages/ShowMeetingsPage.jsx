'use client'
import AppointmentTable from '@/components/AppointmentTable';
import React, { useState, useEffect } from 'react';
import appointmentData from '@/data/appointmentData';
import Calendar from '@/components/Calendar';
import { useFlowContext } from '@/context/FlowContext';
const ShowMeetings = () => {
  const { addMeetingInfoStage, setMeetingInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };
  const [events, setEvents] = useState([]);
  const [appointment, setAppointment] = useState(appointmentData)

  useEffect(() => {
    setEvents(appointmentData);
  }, []);




  // Format events to match the calendar's expected structure
  // const formattedEvents = events.map((event) => ({
  //   start: new Date(event.start_date),
  //   end: new Date(event.end_date),
  //   title: event.summary,
  // }));

  //   const handleAddAppointment = (newContact) => {
  //     setFilteredData((prev) => [...prev, newContact]);
  // };

  // const handleUpdateAppointment = (updatedContact) => {
  //     setFilteredData((prev) =>
  //         prev.map((contact) =>
  //             contact.id === updatedContact.id ? updatedContact : contact
  //         )
  //     );
  // };

  // const handleDeleteAppointment = (id) => {
  //     setFilteredData((prev) => prev.filter((contact) => contact.id !== id));
  // };

  return (
    <div>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='w-full md:w-3/4 p-4'>
          <div className='flex justify-end' onClick={() => setMeetingInfoStage(!addMeetingInfoStage)}>
            {/* <Button>+ Add New Meeting</Button> */}
            <button className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110">+ Add New Meeting</button>
          </div>
          {/* <div className='w-full overflow-x-scroll'>
            <AppointmentTable
              appointmentData={appointment}
              setAppointmentData={setAppointment}
            />
          </div> */}
          <div className="w-full">
            <div className="overflow-x-auto">
              <AppointmentTable
                appointmentData={appointment}
                setAppointmentData={setAppointment}
              />
            </div>
          </div>



        </div>
        <div className='w-full md:w-1/4 border shadow-2xl'>


        </div>

      </div>
      <div className='flex flex-col md:flex-row'>
        <div className='w-full md:w-3/4'>
          <Calendar events={events} />
        </div>
        <div className='w-full md:w-1/4'>
          This is the rest
        </div>

      </div>


    </div>
  );
};

export default ShowMeetings;