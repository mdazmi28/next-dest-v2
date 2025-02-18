import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import ViewSchedularModal from './modals/ViewSchedularModal';
import ViewAppointmentModal from './modals/appointment/ViewAppointmentModal';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

const Scheduler = ({ events }) => {
    // console.log("Events are: ", events)
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsViewOpen(false);
            }
        };

        if (isViewOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isViewOpen]);

    const handleEventClick = (clickInfo) => {
        // Get the clicked event data
        const eventData = {
            appointment_id: clickInfo.event.extendedProps.appointment_id,
            title: clickInfo.event.title,
            description: clickInfo.event.extendedProps.description,
            location: clickInfo.event.extendedProps.location,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            with_contacts: clickInfo.event.extendedProps.with_contacts || []
        };

        setSelectedData(eventData);
        setIsViewOpen(true);
    };

    return (
        <div>
            {events.length === 0 ? <p>Loading or No Events Found</p> : null}
            <div className="w-full h-screen">
                {/* <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    timeZone="local"
                    headerToolbar={{
                        // left: 'prev',
                        center: 'prev,title,next',
                        // right: 'next'
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
                    eventClick={handleEventClick} // Changed this line
                /> */}
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    timeZone="local"
                    headerToolbar={{
                        left: 'prev',
                        center: `title`,
                        right: 'next'
                    }}
                    editable={true}
                    selectable={true}
                    // selectMirror={true}
                    // dayMaxEvents={true}
                    // weekends={true}
                    events={events}
                    // height="auto"
                    // slotMinTime="06:00:00"
                    // slotMaxTime="22:00:00"
                    eventDisplay="block"
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: 'short'
                    }}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }}
                    eventDidMount={(info) => {
                        tippy(info.el, {
                            content: `
                <div class="event-tooltip">
                    <h4><strong>Title:</strong> ${info.event.title}</h4>
                    <p><strong>Description:</strong> ${info.event.extendedProps.description || 'N/A'}</p>
                    <p><strong>Location:</strong> ${info.event.extendedProps.location || 'N/A'}</p>
                </div>
            `,
                            allowHTML: true,
                            theme: 'light',
                            placement: 'top',
                            arrow: true
                        });
                    }}
                    eventClick={handleEventClick}
                    eventClassNames="calendar-event"
                    // Add some custom styling classes
                    className="custom-calendar"
                />
            </div>

            <ViewAppointmentModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={selectedData}
            />

        </div>
    );
};

export default Scheduler;
