'use client'
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import AddContactPage from '@/pages/AddContactPage';
import ShowContactPage from '@/pages/ShowContactPage';
import ShowDispatchPage from '@/pages/ShowDispatchPage';


const page = () => {
    const { addDispatchStage } = useFlowContext()
    // console.log(addContactInfoStage)

    return (
        <Layout>
            {
                addDispatchStage ? (<ShowDispatchPage />) : ("No ")
            }
        </Layout>


    );
};

export default page;