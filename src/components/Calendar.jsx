// -------------------------------------------------------------Date Color-------------------------------------------------




// ------------------------------------------------------------------------------------------------------------
// 'use client'
// import React, { useState } from "react";
// import { format, eachDayOfInterval, parseISO } from "date-fns";

// const Calendar = ({ events }) => {
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [selectedEvents, setSelectedEvents] = useState([]);

//     // Create a list of all event dates (single-day or multi-day ranges)
//     const getEventDates = () => {
//         const eventDates = [];
//         events.forEach((event) => {
//             const start = parseISO(event.start_date);
//             const end = parseISO(event.end_date);
//             const daysInRange = eachDayOfInterval({ start, end }).map((date) =>
//                 format(date, "dd-MM-yyyy")
//             );
//             eventDates.push({ days: daysInRange, title: event.title, priority: event.priority });
//         });
//         return eventDates;
//     };

//     const eventDates = getEventDates();

//     const handleDateClick = (date) => {
//         setSelectedDate(date);

//         // Find all events for the clicked date
//         const eventsForDate = eventDates
//             .filter((event) => event.days.includes(date))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForDate);
//     };

//     const renderCalendar = () => {
//         const today = new Date();
//         const currentMonth = today.getMonth();
//         const currentYear = today.getFullYear();
//         const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

//         const daysInMonth = [];
//         for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
//             daysInMonth.push(new Date(currentYear, currentMonth, i));
//         }

//         return daysInMonth.map((date) => {
//             const formattedDate = format(date, "dd-MM-yyyy");
//             const isEventDay = eventDates.some((event) =>
//                 event.days.includes(formattedDate)
//             );

//             return (
//                 <div
//                     key={formattedDate}
//                     className={`p-2 ${
//                         isEventDay ? "bg-blue-500 text-white" : "bg-gray-200"
//                     } cursor-pointer`}
//                     onClick={() => handleDateClick(formattedDate)}
//                 >
//                     {format(date, "d")}
//                 </div>
//             );
//         });
//     };

//     const getPriorityClass = (priority) => {
//         switch (priority) {
//             case "Low Priority":
//                 return "bg-green-500 text-white";
//             case "Medium Priority":
//                 return "bg-yellow-500 text-black";
//             case "Very Important":
//                 return "bg-orange-500 text-white";
//             case "Urgent":
//                 return "bg-red-500 text-white";
//             default:
//                 return "bg-gray-200 text-black";
//         }
//     };

//     return (
//         <div className="flex flex-col-reverse md:flex-row">
//             <div className="w-full md:w-3/4">
//                 <div className="grid grid-cols-7 gap-4 p-4">
//                     <div className="col-span-7 text-center font-bold">
//                         {format(new Date(), "MMMM yyyy")}
//                     </div>
//                     <div className="col-span-7 grid grid-cols-7 gap-2 text-center">
//                         {renderCalendar()}
//                     </div>
//                 </div>
//             </div>
//             <div className="w-full items-center justify-center md:w-1/4 p-4">
//                 {selectedDate && (
//                     <div className="mt-4">
//                         <div className="font-bold mb-2 flex justify-center">Selected Date: {selectedDate}</div>
//                         {selectedEvents.length > 0 ? (
//                             <ul>
//                                 {selectedEvents.map((event, index) => (
//                                     <li
//                                         key={index}
//                                         className={`${getPriorityClass(event.priority)} p-2 rounded mb-2 flex justify-center`}
//                                     >
//                                         {event.title}
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div className="bg-yellow-200 p-2 rounded mb-2 flex justify-center">No events for this date.</div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Calendar;


// import React from 'react';
// import { InlineWidget } from "react-calendly";
// const Calendar = () => {
//     return (
//         <div className="App">
//       <InlineWidget url="https://calendly.com/md-azmi-siddique/" />
//     </div>
//     );
// };

// export default Calendar;



// 'use client';
// import React, { useState, useEffect, useMemo } from "react";
// import { format, eachDayOfInterval, parseISO } from "date-fns";
// import { useFlowContext } from "@/context/FlowContext";

// const Calendar = ({ events }) => {
//     const [selectedDate, setSelectedDate] = useState(format(new Date(), "dd-MM-yyyy"));
//     const [selectedEvents, setSelectedEvents] = useState([]);

//     // Memoize the event dates calculation to avoid unnecessary recalculations
//     const getEventDates = (events) => {
//         if (!events || !Array.isArray(events)) {
//             console.log("Invalid events data:", events);
//             return [];
//         }
    
//         const eventDates = [];
//         events.forEach((event) => {
//             if (!event.start_time || !event.end_time) {
//                 console.warn("Missing date fields in event:", event);
//                 return;
//             }
    
//             try {
//                 const start = parseISO(event.start_time);
//                 const end = parseISO(event.end_time);
//                 const daysInRange = eachDayOfInterval({ start, end }).map((date) =>
//                     format(date, "dd-MM-yyyy")
//                 );
//                 eventDates.push({ days: daysInRange, title: event.title, priority: event.priority });
//             } catch (error) {
//                 console.error("Error parsing dates for event:", event, error);
//             }
//         });
    
//         return eventDates;
//     };

//     const eventDates = useMemo(() => getEventDates(), [events]);

//     useEffect(() => {
//         const today = format(new Date(), "dd-MM-yyyy");
//         setSelectedDate(today);

//         // Get tasks for today's date
//         const eventsForToday = eventDates
//             .filter((event) => event.days.includes(today))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForToday);
//     }, [eventDates]);

//     const handleDateClick = (date) => {
//         setSelectedDate(date);

//         // Find all events for the clicked date
//         const eventsForDate = eventDates
//             .filter((event) => event.days.includes(date))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForDate);
//     };

//     const renderCalendar = () => {
//         const today = new Date();
//         const currentMonth = today.getMonth();
//         const currentYear = today.getFullYear();
//         const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

//         const daysInMonth = [];
//         for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
//             daysInMonth.push(new Date(currentYear, currentMonth, i));
//         }

//         return daysInMonth.map((date) => {
//             const formattedDate = format(date, "dd-MM-yyyy");
//             const isEventDay = eventDates.some((event) =>
//                 event.days.includes(formattedDate)
//             );

//             return (
//                 <div
//                     key={formattedDate}
//                     className={`p-2 ${
//                         isEventDay ? "bg-[#0BBFBF] text-white" : "bg-gray-200"
//                     } cursor-pointer`}
//                     onClick={() => handleDateClick(formattedDate)}
//                 >
//                     {format(date, "d")}
//                 </div>
//             );
//         });
//     };

//     // const getPriorityClass = (priority) => {
//     //     const priorityMap = {
//     //         "Low Priority": "bg-green-500 text-white",
//     //         "Medium Priority": "bg-yellow-500 text-black",
//     //         "Very Important": "bg-orange-500 text-white",
//     //         "Urgent": "bg-red-500 text-white",
//     //     };
//     //     return priorityMap[priority] || "bg-gray-200 text-black"; // Default to gray if not matched
//     // };

//     return (
//         <div className="flex flex-col-reverse md:flex-row">
//             <div className="w-full md:w-3/4">
//                 <div className="grid grid-cols-7 gap-4 p-4">
//                     <div className="col-span-7 text-center font-bold">
//                         {format(new Date(), "MMMM yyyy")}
//                     </div>
//                     <div className="col-span-7 grid grid-cols-7 gap-2 text-center">
//                         {renderCalendar()}
//                     </div>
//                 </div>
//             </div>
//             <div className="w-full items-center justify-center md:w-1/4 p-4">
//                 {selectedDate && (
//                     <div className="mt-4">
//                         <div className="font-bold mb-2 flex justify-center">Selected Date: {selectedDate}</div>
//                         {selectedEvents.length > 0 ? (
//                             <ul>
//                                 {selectedEvents.map((event, index) => (
//                                     <li
//                                         key={index}
//                                         className={`${getPriorityClass(event.priority)} p-2 rounded mb-2 flex justify-center`}
//                                     >
//                                         {event.title}
//                                         {event.title}
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div className="bg-yellow-200 p-2 rounded mb-2 flex justify-center">No events for this date.</div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Calendar;

// import { useState, useEffect, useMemo } from "react";
// import { parseISO, eachDayOfInterval, format } from "date-fns";

// const Calendar = ({ events }) => {
//     const [selectedDate, setSelectedDate] = useState(format(new Date(), "dd-MM-yyyy"));
//     const [selectedEvents, setSelectedEvents] = useState([]);

//     const getEventDates = (events) => {
//         if (!events || !Array.isArray(events)) {
//             console.log("Invalid events data:", events);
//             return [];
//         }

//         const eventDates = [];
//         events.forEach((event) => {
//             if (!event.start_time || !event.end_time) {
//                 console.warn("Missing date fields in event:", event);
//                 return;
//             }

//             try {
//                 let start = parseISO(event.start_time);
//                 let end = parseISO(event.end_time);

//                 // Ensure start is before end
//                 if (start > end) {
//                     console.warn("Invalid date range for event:", event);
//                     return;
//                 }

//                 const daysInRange = eachDayOfInterval({ start, end }).map((date) =>
//                     format(date, "dd-MM-yyyy")
//                 );
//                 eventDates.push({ days: daysInRange, title: event.title, priority: event.priority });
//             } catch (error) {
//                 console.error("Error parsing dates for event:", event, error);
//             }
//         });

//         return eventDates;
//     };

//     // Corrected: Now passing events to getEventDates
//     const eventDates = useMemo(() => getEventDates(events), [events]);

//     useEffect(() => {
//         const today = format(new Date(), "dd-MM-yyyy");
//         setSelectedDate(today);

//         // Get tasks for today's date
//         const eventsForToday = eventDates
//             .filter((event) => event.days.includes(today))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForToday);
//     }, [eventDates]);

//     const handleDateClick = (date) => {
//         setSelectedDate(date);

//         // Find all events for the clicked date
//         const eventsForDate = eventDates
//             .filter((event) => event.days.includes(date))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForDate);
//     };

//     const renderCalendar = () => {
//         const today = new Date();
//         const currentMonth = today.getMonth();
//         const currentYear = today.getFullYear();
//         const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

//         const daysInMonth = [];
//         for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
//             daysInMonth.push(new Date(currentYear, currentMonth, i));
//         }

//         return daysInMonth.map((date) => {
//             const formattedDate = format(date, "dd-MM-yyyy");
//             const isEventDay = eventDates.some((event) =>
//                 event.days.includes(formattedDate)
//             );

//             return (
//                 <div
//                     key={formattedDate}
//                     className={`p-2 ${
//                         isEventDay ? "bg-[#0BBFBF] text-white" : "bg-gray-200"
//                     } cursor-pointer`}
//                     onClick={() => handleDateClick(formattedDate)}
//                 >
//                     {format(date, "d")}
//                 </div>
//             );
//         });
//     };

//     // Uncommented the function to prevent an error
//     const getPriorityClass = (priority) => {
//         const priorityMap = {
//             "Low Priority": "bg-green-500 text-white",
//             "Medium Priority": "bg-yellow-500 text-black",
//             "Very Important": "bg-orange-500 text-white",
//             "Urgent": "bg-red-500 text-white",
//         };
//         return priorityMap[priority] || "bg-gray-200 text-black"; // Default to gray if not matched
//     };

//     return (
//         <div className="flex flex-col-reverse md:flex-row">
//             <div className="w-full md:w-3/4">
//                 <div className="grid grid-cols-7 gap-4 p-4">
//                     <div className="col-span-7 text-center font-bold">
//                         {format(new Date(), "MMMM yyyy")}
//                     </div>
//                     <div className="col-span-7 grid grid-cols-7 gap-2 text-center">
//                         {renderCalendar()}
//                     </div>
//                 </div>
//             </div>
//             <div className="w-full items-center justify-center md:w-1/4 p-4">
//                 {selectedDate && (
//                     <div className="mt-4">
//                         <div className="font-bold mb-2 flex justify-center">Selected Date: {selectedDate}</div>
//                         {selectedEvents.length > 0 ? (
//                             <ul>
//                                 {selectedEvents.map((event, index) => (
//                                     <li
//                                         key={index}
//                                         className={`${getPriorityClass(event.priority)} p-2 rounded mb-2 flex justify-center`}
//                                     >
//                                         {event.title}
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div className="bg-yellow-200 p-2 rounded mb-2 flex justify-center">No events for this date.</div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Calendar;

import { useState, useEffect, useMemo } from "react";
import { parseISO, eachDayOfInterval, format } from "date-fns";

const Calendar = ({ events }) => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "dd-MM-yyyy"));
    const [selectedEvents, setSelectedEvents] = useState([]);

    const getEventDates = (events) => {
        if (!events || !Array.isArray(events)) {
            console.log("Invalid events data:", events);
            return [];
        }

        const eventDates = [];
        events.forEach((event) => {
            if (!event.start_time || !event.end_time) {
                console.warn("Missing date fields in event:", event);
                return;
            }

            try {
                let start = parseISO(event.start_time);
                let end = parseISO(event.end_time);

                // Ensure start is before end
                if (start > end) {
                    console.warn("Invalid date range for event:", event);
                    return;
                }

                const daysInRange = eachDayOfInterval({ start, end }).map((date) =>
                    format(date, "dd-MM-yyyy")
                );
                eventDates.push({ days: daysInRange, title: event.title, description:event.description ,priority: event.priority });
            } catch (error) {
                console.error("Error parsing dates for event:", event, error);
            }
        });

        return eventDates;
    };

    // Corrected: Now passing events to getEventDates
    const eventDates = useMemo(() => getEventDates(events), [events]);

    useEffect(() => {
        const today = format(new Date(), "dd-MM-yyyy");
        setSelectedDate(today);

        // Get tasks for today's date
        const eventsForToday = eventDates
            .filter((event) => event.days.includes(today))
            .map((event) => ({
                title: event.title,
                description : event.description,
                priority: event.priority,
            }));
        setSelectedEvents(eventsForToday);
    }, [eventDates]);

    const handleDateClick = (date) => {
        setSelectedDate(date);

        // Find all events for the clicked date
        const eventsForDate = eventDates
            .filter((event) => event.days.includes(date))
            .map((event) => ({
                title: event.title,
                description : event.description,
                priority: event.priority,
            }));
        setSelectedEvents(eventsForDate);
    };

    const renderCalendar = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const daysInMonth = [];
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            daysInMonth.push(new Date(currentYear, currentMonth, i));
        }

        return daysInMonth.map((date) => {
            const formattedDate = format(date, "dd-MM-yyyy");
            const isEventDay = eventDates.some((event) =>
                event.days.includes(formattedDate)
            );

            return (
                <div
                    key={formattedDate}
                    className={`p-2 ${
                        isEventDay ? "bg-[#0BBFBF] text-white" : "bg-gray-200"
                    } cursor-pointer`}
                    onClick={() => handleDateClick(formattedDate)}
                >
                    {format(date, "d")}
                </div>
            );
        });
    };

    // Uncommented the function to prevent an error
    const getPriorityClass = (priority) => {
        const priorityMap = {
            "Low Priority": "bg-green-500 text-white",
            "Medium Priority": "bg-yellow-500 text-black",
            "Very Important": "bg-orange-500 text-white",
            "Urgent": "bg-red-500 text-white",
        };
        return priorityMap[priority] || "bg-gray-200 text-black"; // Default to gray if not matched
    };

    return (
        <div className="flex flex-col-reverse md:flex-row">
            <div className="w-full md:w-3/4">
                <div className="grid grid-cols-7 gap-4 p-4">
                    <div className="col-span-7 text-center font-bold">
                        {format(new Date(), "MMMM yyyy")}
                    </div>
                    <div className="col-span-7 grid grid-cols-7 gap-2 text-center">
                        {renderCalendar()}
                    </div>
                </div>
            </div>
            <div className="w-full items-center justify-center md:w-1/4 p-4">
                {selectedDate && (
                    <div className="mt-4">
                        <div className="font-bold mb-2 flex justify-center">Selected Date: {selectedDate}</div>
                        {selectedEvents.length > 0 ? (
                            <ul className="md:h-[250px] overflow-y-auto">
                                {selectedEvents.slice().reverse().map((event, index) => (
                                    <li
                                        key={index}
                                        className={`${getPriorityClass(event.priority)} p-2 rounded mb-2 flex justify-center`}
                                    >
                                        {event.title}
                                        <br></br>
                                        {event.description}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="bg-yellow-200 p-2 rounded mb-2 flex justify-center">No events for this date.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;




// 'use client';
// import React, { useState, useEffect, useMemo } from "react";
// import { format, eachDayOfInterval, parseISO } from "date-fns";

// const Calendar = ({ events }) => {
//     const [selectedDate, setSelectedDate] = useState(format(new Date(), "dd-MM-yyyy"));
//     const [selectedEvents, setSelectedEvents] = useState([]);

//     // Memoize the event dates calculation to avoid unnecessary recalculations
//     const getEventDates = () => {
//         const eventDates = [];
//         events.forEach((event) => {
//             const start = parseISO(event.start_date);
//             const end = parseISO(event.end_date);
//             const daysInRange = eachDayOfInterval({ start, end }).map((date) =>
//                 format(date, "dd-MM-yyyy")
//             );
//             eventDates.push({ days: daysInRange, title: event.title, priority: event.priority });
//         });
//         return eventDates;
//     };

//     const eventDates = useMemo(() => getEventDates(), [events]);

//     useEffect(() => {
//         const today = format(new Date(), "dd-MM-yyyy");
//         setSelectedDate(today);

//         // Get tasks for today's date
//         const eventsForToday = eventDates
//             .filter((event) => event.days.includes(today))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForToday);
//     }, [eventDates]);

//     const handleDateClick = (date) => {
//         setSelectedDate(date);

//         // Find all events for the clicked date
//         const eventsForDate = eventDates
//             .filter((event) => event.days.includes(date))
//             .map((event) => ({
//                 title: event.title,
//                 priority: event.priority,
//             }));
//         setSelectedEvents(eventsForDate);
//     };

//     const renderCalendar = () => {
//         const today = new Date();
//         const currentMonth = today.getMonth();
//         const currentYear = today.getFullYear();
//         const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

//         const daysInMonth = [];
//         for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
//             daysInMonth.push(new Date(currentYear, currentMonth, i));
//         }

//         return daysInMonth.map((date) => {
//             const formattedDate = format(date, "dd-MM-yyyy");
//             const isEventDay = eventDates.some((event) =>
//                 event.days.includes(formattedDate)
//             );

//             return (
//                 <div
//                     key={formattedDate}
//                     className={`p-2 ${
//                         isEventDay ? "bg-[#0BBFBF] text-white" : "bg-gray-200"
//                     } cursor-pointer`}
//                     onClick={() => handleDateClick(formattedDate)}
//                 >
//                     {format(date, "d")}
//                 </div>
//             );
//         });
//     };

//     const getPriorityClass = (priority) => {
//         const priorityMap = {
//             "Low Priority": "bg-green-500 text-white",
//             "Medium Priority": "bg-yellow-500 text-black",
//             "Very Important": "bg-orange-500 text-white",
//             "Urgent": "bg-red-500 text-white",
//         };
//         return priorityMap[priority] || "bg-gray-200 text-black"; // Default to gray if not matched
//     };

//     return (
//         <div className="flex flex-col-reverse md:flex-row">
//             <div className="w-full md:w-3/4">
//                 <div className="grid grid-cols-7 gap-4 p-4">
//                     <div className="col-span-7 text-center font-bold">
//                         {format(new Date(), "MMMM yyyy")}
//                     </div>
//                     {/* Add day name shortforms */}
//                     <div className="col-span-7 grid grid-cols-7 gap-2 text-center font-medium">
//                         {["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
//                             <div key={index} className="p-2 text-gray-700">
//                                 {day}
//                             </div>
//                         ))}
//                     </div>
//                     <div className="col-span-7 grid grid-cols-7 gap-2 text-center">
//                         {renderCalendar()}
//                     </div>
//                 </div>
//             </div>
//             <div className="w-full items-center justify-center md:w-1/4 p-4">
//                 {selectedDate && (
//                     <div className="mt-4">
//                         <div className="font-bold mb-2 flex justify-center">Selected Date: {selectedDate}</div>
//                         {selectedEvents.length > 0 ? (
//                             <ul>
//                                 {selectedEvents.map((event, index) => (
//                                     <li
//                                         key={index}
//                                         className={`${getPriorityClass(event.priority)} p-2 rounded mb-2 flex justify-center`}
//                                     >
//                                         {event.title}
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : (
//                             <div className="bg-yellow-200 p-2 rounded mb-2 flex justify-center">No events for this date.</div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Calendar;
