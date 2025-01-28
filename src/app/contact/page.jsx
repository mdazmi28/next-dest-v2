'use client'
import { useFlowContext } from '@/context/FlowContext';
import AddContactPage from '@/pages/AddContactPage';
import ShowContactPage from '@/pages/ShowContactPage';


const page = () => {
    const {addContactInfoStage} = useFlowContext()
    // console.log(addContactInfoStage)
    
    return (
        addContactInfoStage ? (<ShowContactPage/>) : (<AddContactPage/>)
       
    );
};

export default page;