'use client'
import ShowMeetings from '@/pages/ShowMeetingsPage';
import React from 'react';
import { useFlowContext } from '@/context/FlowContext';
import AddMeetingsPage from '@/pages/AddMeetingsPage';

const page = () => {
    const { addMeetingInfoStage } = useFlowContext()
    return (
        <div>

            {
                addMeetingInfoStage ? (<ShowMeetings />) : (<AddMeetingsPage />)
            }
        </div>

    );
};

export default page;