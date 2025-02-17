'use client'
import Calendar from '@/components/Calendar';
import Card from '@/components/Card';
import cardData from '@/data/cardData';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';
import Scheduler from '@/components/Schedular';




const page = () => {
  // const { setAppointments, events, setEvents } = useFlowContext();
  const[appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);

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
          console.log(`Error ${response.status}: ${errorText}`);
          return;
        }

        const data = await response.json();

        const formattedEvents = data.map(event => ({
          title: event.title || "No Title",
          start: event.start_time.slice(0, -4),
          end: event.end_time.slice(0, -4),
          id: event.id,
          description: event.description || "No Description",  // Include description
          location: event.location || "No Location" , // Include location
          with_contacts: event.with_contacts || [],  // Include with_contacts
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
    // <Layout>
    //   <div className='flex flex-col'>
    //     <div className='flex flex-col md:flex-row gap-5'>
    //       <div className="w-full md:w-3/4 flex items-center justify-center">
    //         <div className="p-5 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
    //           {cardData.map((card, i) => (
    //             <Card
    //               key={i}
    //               type={card.type}
    //               noOfContact={card.noOfContact}
    //               className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 "
    //             />
    //           ))}
    //         </div>
    //       </div>

    //       <div className='w-full md:w-1/4 flex items-center justify-center border shadow-xl rounded-lg '>

    //       </div>
    //     </div>
    //     <div className='w-full md:w-3/4'>
    //       <Scheduler events={events}/>
    //     </div>
    //   </div>
    //   {/* <div className=''>
    //     <Scheduler />
    //   </div> */}

    // </Layout>
    <Layout>
  <div className='container mx-auto px-4 py-6'>
    {/* Header Section */}
    <div className='mb-8'>
      <div className='flex items-center space-x-4'>
        <div className='text-sm text-gray-600'>
          {/* Today is: {new Date().toLocaleDateString()} */}
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className='flex flex-col space-y-8'>
      {/* Stats Cards Section */}
      <div className='flex flex-col md:flex-row gap-5'>
        {/* Left Section - Stats Cards */}
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cardData.map((card, i) => (
              <div key={i} className="transform hover:scale-105 transition-transform duration-300">
                <Card
                  type={card.type}
                  noOfContact={card.noOfContact}
                  className="p-6 border rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {/* Add icons and more visual elements */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-700">{card.type}</div>
                    <div className="text-2xl font-bold text-blue-600">{card.noOfContact}</div>
                  </div>
                  {/* Add a mini chart or trend indicator */}
                  {/* <div className="mt-4 text-sm text-gray-500">
                    +12% from last month
                  </div> */}
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Quick Actions/Summary */}
        <div className='w-full md:w-1/4 space-y-4'>
          <div className='bg-white p-6 rounded-xl shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
            <div className='space-y-3'>
              <button onClick={()=>location.replace('/appointment')} className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors'>
                🗓️ New Appointment
              </button>
              <button onClick={()=>location.replace('/contact')} className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors'>
                👥 Add Contact
              </button>
              <button onClick={()=>location.replace('/dispatch')} className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors'>
                📊 Add Dispatch
              </button>
            </div>
          </div>

          {/* Activity Feed */}

        </div>
      </div>

      {/* Calendar Section */}
      <div className='b'>
        <div className='mb-4 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-gray-800'>Schedule Overview</h2>
        </div>
        <div className=''>
          <Scheduler events={events}/>
        </div>
      </div>

    </div>
  </div>
</Layout>
  );
};

export default page;