'use client'
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';

import ShowDispatchPage from '@/pages/ShowDispatchPage';


const page = () => {

    // console.log(addContactInfoStage)

    return (
        <Layout>
            <ShowDispatchPage />
        </Layout>


    );
};

export default page;