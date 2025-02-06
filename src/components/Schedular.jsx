import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFlowContext } from '@/context/FlowContext';
import Cookies from 'js-cookie';
import base_url from '@/base_url';
import { toast } from 'react-toastify';

const Scheduler = ({events}) => {
    // const { setAppointments, events, setEvents } = useFlowContext();

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
