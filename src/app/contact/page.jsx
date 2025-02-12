'use client'
import Layout from '@/components/Layout';
import { useFlowContext } from '@/context/FlowContext';
import AddContactPage from '@/pages/AddContactPage';
import ShowContactPage from '@/pages/ShowContactPage';


const page = () => {
    const { addContactInfoStage } = useFlowContext()
    // console.log(addContactInfoStage)

    return (
        <Layout>
            {
                addContactInfoStage ? (<ShowContactPage />) : (<AddContactPage />)
            }
        </Layout>


    );
};

export default page;