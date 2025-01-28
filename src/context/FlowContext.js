'use client';
import React, { createContext, useState, useContext } from 'react';

const FlowContext = createContext();

export const FlowProvider = ({ children }) => {
    const [addContactInfoStage, setAddContactInfoStage] = useState(true);
    const [addMeetingInfoStage, setMeetingInfoStage] = useState(true);


    // console.log(addContactInfoStage)
    

    return (
        <FlowContext.Provider
            value={{
                addContactInfoStage, setAddContactInfoStage,
                addMeetingInfoStage, setMeetingInfoStage,
            }}
        >
            {children}
        </FlowContext.Provider>
    );
};

export const useFlowContext = () => useContext(FlowContext);