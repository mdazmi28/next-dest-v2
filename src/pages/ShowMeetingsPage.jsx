'use client'
import AppointmentTable from '@/components/AppointmentTable';
import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';
import Scheduler from '@/components/Schedular';

const ShowMeetings = () => {
  const { addMeetingInfoStage, setMeetingInfoStage, appointments, setAppointments, events, setEvents  } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      const userId = Cookies.get('user_id');
      if (!userId) {
        console.error("User ID not found in cookies.");
        return;
      }

      let authToken = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!authToken && !refreshToken) {
        toast.error("Please log in first.");
        return;
      }

      const fetchWithToken = async (token) => {
        const response = await fetch(`${base_url}/users/${userId}/appointments/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          toast.error(`Error ${response.status}: ${errorText}`);
          return;
        }

        const data = await response.json();
        // console.log("Appointments fetched:", data);

        const formattedEvents = data.map(event => ({
          appointment_id: event.appointment_id,
          title: event.title || "No Title",
          start: event.start_time.slice(0, -4),
          end: event.end_time.slice(0, -4),
          id: event.id,
          description: event.description || "No Description",  // Include description
          location: event.location || "No Location"  // Include location
        }));

        setAppointments(formattedEvents);
        setEvents(formattedEvents);
        console.log("Events fetched:", formattedEvents);
      };

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
            toast.error("Token refresh failed. Please log in again.");
            return;
          }

          const refreshData = await refreshResponse.json();
          authToken = refreshData.access;
          localStorage.setItem("authToken", authToken);
          console.log("Token refreshed successfully:", authToken);

          await fetchWithToken(authToken);
        } catch (err) {
          console.error("Refresh and Retry Error:", err);
          toast.error(err.message || "An error occurred.");
        }
      };

      try {
        if (authToken && !isTokenExpired(authToken)) {
          await fetchWithToken(authToken);
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
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    console.log("Events updated:", events);
  }, [events]);


  return (
    // <div className='min-h-screen'>
    //   <div className='flex flex-col md:flex-row gap-4 h-1/2'>
    //     <div className='w-full md:w-3/4 p-4'>
    //       <div className='flex justify-end' onClick={() => setMeetingInfoStage(!addMeetingInfoStage)}>
    //         {/* <Button>+ Add New Meeting</Button> */}
    //         <button className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110">+ Add New Meeting</button>
    //       </div>
    //       {/* <div className='w-full overflow-x-scroll'>
    //         <AppointmentTable
    //           appointmentData={appointment}
    //           setAppointmentData={setAppointment}
    //         />
    //       </div> */}
    //       <div className="w-full">
    //         <div className="overflow-x-auto">
    //           <AppointmentTable
    //             appointmentData={appointments}
    //             setAppointmentData={setAppointments}
    //           />
    //         </div>
    //       </div>



    //     </div>
    //     <div className='w-full md:w-1/4 border shadow-2xl'>
    //     </div>

    //   </div>
    //   <div className='flex flex-col md:flex-row h-1/2'>
    //     <div className='w-full md:w-3/4'>
    //       <Calendar events={events} />
    //     </div>
    //     <div className='w-full md:w-1/4'>
    //       This is the rest
    //     </div>
    //   </div>
    // </div>

    <div className="h-screen flex flex-col">
      {/* Top Half - Appointments Table & Sidebar */}
      <div className="flex flex-row gap-4 h-1/2">
        {/* Left - Appointment Table */}
        <div className="w-3/4 p-4 flex flex-col">
          {/* Add Meeting Button */}
          <div className="flex justify-end mb-2">
            <button
              className="btn btn-active bg-[#0BBFBF] hover:bg-[#89D9D9] hover:scale-110"
              onClick={() => setMeetingInfoStage(!addMeetingInfoStage)}
            >
              + Add New Meeting
            </button>
          </div>

          {/* Table Wrapper */}
          <div className="flex-1 overflow-hidden">
            <div className="overflow-x-auto h-full">
              <AppointmentTable
                appointmentData={appointments}
                setAppointmentData={setAppointments}
              />
            </div>
          </div>
        </div>

        {/* Right - Sidebar */}
        <div className="w-1/4 border shadow-2xl p-4">
          {/* Sidebar Content (if any) */}
        </div>
      </div>

      {/* Bottom Half - Calendar & Another Section */}
      <div className="flex flex-row h-1/2">
        {/* Left - Calendar */}
        <div className="w-3/4 ">
          {/* <Calendar events={events} /> */}
          <Scheduler events={events} />
        </div>

        {/* Right - Additional Section */}
        <div className="w-1/4">
          <p>This is the rest</p>
        </div>
      </div>
    </div>

  );
};

export default ShowMeetings;