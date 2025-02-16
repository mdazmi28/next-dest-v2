'use client'
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import ShowContactPage from '@/pages/ShowContactPage';


const page = () => {
    return (
        <Layout>
            <ShowContactPage />
        </Layout>


    );
};

export default page;