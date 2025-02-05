'use client'
import Calendar from '@/components/Calendar';
import Card from '@/components/Card';
import cardData from '@/data/cardData';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';

const page = () => {
  const { appointments, setAppointments, events, setEvents } = useFlowContext()

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
    <Layout>
      <div className='flex flex-col'>
        <div className='flex flex-col md:flex-row gap-5'>
          <div className="w-full md:w-3/4 flex items-center justify-center">
            <div className="p-5 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {cardData.map((card, i) => (
                <Card
                  key={i}
                  type={card.type}
                  noOfContact={card.noOfContact}
                  className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 "
                />
              ))}
            </div>
          </div>

          <div className='w-full md:w-1/4 flex items-center justify-center border shadow-xl rounded-lg '>

          </div>
        </div>
        <div className='w-full md:w-3/4'>
          <Calendar events={events} />
        </div>
      </div>
    </Layout>
  );
};

export default page;