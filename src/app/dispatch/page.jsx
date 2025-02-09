'use client'
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import AddContactPage from '@/pages/AddContactPage';
import AddDispatchPage from '@/pages/AddDispatchPage';
import ShowContactPage from '@/pages/ShowContactPage';
import ShowDispatchPage from '@/pages/ShowDispatchPage';


const page = () => {
    const { addDispatchStage } = useFlowContext()
    // console.log(addContactInfoStage)

    return (
        <Layout>
            {
                addDispatchStage ? (<ShowDispatchPage />) : (<AddDispatchPage/>)
            }
        </Layout>


    );
};

export default page;