'use client'
import AppointmentTable from '@/components/AppointmentTable';
import React, { useState, useEffect } from 'react';
import appointmentData from '@/data/appointmentData';
import Calendar from '@/components/Calendar';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';

const ShowMeetings = () => {
  const { addMeetingInfoStage, setMeetingInfoStage } = useFlowContext() || { addContactInfoStage: false, setAddContactInfoStage: () => { } };
  const [events, setEvents] = useState([]);
  const [appointment, setAppointments] = useState(appointmentData)

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

      console.log("Fetching appointments for user:", userId);
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
        console.log("Appointments API Response:", data);
        setAppointments(data);
        setEvents(data);
      };

      // Function to refresh token and retry API call
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
                setAppointmentData={setAppointments}
              />
            </div>
          </div>



        </div>
        <div className='w-full md:w-1/4 border shadow-2xl'>


        </div>

      </div>
      <div className='flex flex-col md:flex-row'>
        {/* <div className='w-full md:w-3/4'>
          <Calendar events={events} />
        </div> */}
        <div className='w-full md:w-1/4'>
          This is the rest
        </div>

      </div>


    </div>
  );
};

export default ShowMeetings;