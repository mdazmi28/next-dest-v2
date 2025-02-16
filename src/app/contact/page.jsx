'use client'
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import ShowContactPage from '@/pages/ShowContactPage';


const page = () => {
    const { addContactInfoStage } = useFlowContext()
    // console.log(addContactInfoStage)

    return (
        <Layout>
            <ShowContactPage />
        </Layout>


    );
};

export default page;