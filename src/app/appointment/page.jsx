'use client'
import ShowMeetings from '@/pages/ShowMeetingsPage';
import React from 'react';
import { useFlowContext } from '@/context/FlowContext';
import Layout from '@/components/Layout';

const page = () => {
    const { addMeetingInfoStage } = useFlowContext()
    // console.log(addMeetingInfoStage)
    return (
        <Layout>
            <ShowMeetings />
        </Layout>

    );
};

export default page;