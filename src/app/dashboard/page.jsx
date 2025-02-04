'use client'
import Calendar from '@/components/Calendar';
import Card from '@/components/Card';
import cardData from '@/data/cardData';
import React, { useState, useEffect } from 'react';
// import appointmentData from '@/data/appointmentData';
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';

const page = () => {
  const {events} = useFlowContext()
  console.log("events are", events)


  // Format events to match the calendar's expected structure
  // const formattedEvents = events.map((event) => ({
  //   start: new Date(event.start_date),
  //   end: new Date(event.end_date),
  //   title: event.summary,
  // }));

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