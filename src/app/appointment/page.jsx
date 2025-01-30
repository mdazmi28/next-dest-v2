'use client'
import ShowMeetings from '@/pages/ShowMeetingsPage';
import React from 'react';
import { useFlowContext } from '@/context/FlowContext';
import AddMeetingsPage from '@/pages/AddMeetingsPage';
import Layout from '@/components/Layout';

const page = () => {
    const { addMeetingInfoStage } = useFlowContext()
    return (
        <Layout>

            {
                addMeetingInfoStage ? (<ShowMeetings />) : (<AddMeetingsPage />)
            }
        </Layout>

    );
};

export default page;