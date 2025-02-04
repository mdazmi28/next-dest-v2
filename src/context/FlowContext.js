'use client';
import React, { createContext, useState, useContext } from 'react';

const FlowContext = createContext();

export const FlowProvider = ({ children }) => {
    const [addContactInfoStage, setAddContactInfoStage] = useState(true);
    const [addMeetingInfoStage, setMeetingInfoStage] = useState(true);
    const [checkLogin, setCheckLogin] = useState(true);
    const [loading, setLoading] = useState("");
    const [error, setError] = useState("");
    const [appointment, setAppointments] = useState([])

    console.log("Data is",appointment)
    

    return (
        <FlowContext.Provider
            value={{
                checkLogin, setCheckLogin,
                loading, setLoading,
                error, setError,
                addContactInfoStage, setAddContactInfoStage,
                addMeetingInfoStage, setMeetingInfoStage,
                appointment, setAppointments
            }}
        >
            {children}
        </FlowContext.Provider>
    );
};

export const useFlowContext = () => useContext(FlowContext);