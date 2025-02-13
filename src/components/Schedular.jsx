// import React, { useState, useEffect } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import ViewSchedularModal from './modals/ViewSchedularModal';

// const Scheduler = ({events}) => {
//     console.log(events);
//     const [isViewOpen, setIsViewOpen] = useState(false);
//     const [selectedData, setSelectedData] = useState(null);

//         useEffect(() => {
//             const handleKeyDown = (event) => {
//                 if (event.key === "Escape") {
//                     setIsEditOpen(false);
//                     setIsDeleteOpen(false);
//                     setIsViewOpen(false);
//                     clearForm();
//                 }
//             };
    
//             if ( isViewOpen) {
//                 window.addEventListener("keydown", handleKeyDown);
//             }
    
//             return () => {
//                 window.removeEventListener("keydown", handleKeyDown);
//             };
//         }, [isViewOpen]);

//     const handleView = (data) => {
//         setSelectedData(data);
//         setIsViewOpen(true);
//     };
//     return (
//         <div>
//             {events.length === 0 ? <p>Loading or No Events Found</p> : null}
//             <div className="w-full h-screen">
//                 <FullCalendar
//                     plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//                     initialView="timeGridWeek"
//                     timeZone="local"
//                     headerToolbar={{
//                         left: 'prev,next',
//                         center: 'title',
//                         right: 'dayGridYear,dayGridWeek,dayGridDay'
//                     }}
//                     editable={true}
//                     selectable={true}
//                     events={events}
//                     eventDidMount={(info) => {
//                         info.el.setAttribute(
//                             "title",
//                             `Title: ${info.event.title}\nDescription: ${info.event.extendedProps.description || 'N/A'}\nLocation: ${info.event.extendedProps.location || 'N/A'}`
//                         );
//                     }}
//                     eventClick={() => handleView(events)}

//                 />
//             </div>

//             <ViewSchedularModal
//                 isOpen={isViewOpen}
//                 onClose={() => setIsViewOpen(false)}
//                 data={events}
//             />

//         </div>
//     );
// };

// export default Scheduler;



import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ViewSchedularModal from './modals/ViewSchedularModal';

const Scheduler = ({events}) => {
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
            // Add any other properties you need
        };
        
        setSelectedData(eventData);
        setIsViewOpen(true);
    };

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
                    eventClick={handleEventClick} // Changed this line
                />
            </div>

            <ViewSchedularModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={selectedData} // Pass selectedData instead of events
            />
        </div>
    );
};

export default Scheduler;
