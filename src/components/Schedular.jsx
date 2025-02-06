import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';

const Scheduler = () => {
    const { setAppointments, events, setEvents } = useFlowContext();

    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    };

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

                const formattedEvents = data.map(event => ({
                    title: event.title || "No Title",
                    start : event.start_time.slice(0, -4),
                    end: event.end_time.slice(0,-4),
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
        <div>
            {events.length === 0 ? <p>Loading or No Events Found</p> : null}
            <div className="w-full h-screen">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    timeZone="local"
                    headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: 'dayGridYear,dayGridWeek,dayGridDay'
                    }}
                    editable={true}
                    selectable={true}
                    events={events}
                    eventDidMount={(info) => {
                        info.el.setAttribute(
                            "title",
                            `Title: ${info.event.title}\nDescription: ${info.event.extendedProps.description || 'N/A'}\nLocation: ${info.event.extendedProps.location || 'N/A'}`
                        );
                    }}

                />
            </div>

        </div>
    );
};

export default Scheduler;
