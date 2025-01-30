'use client';
import React from 'react';
import Login from '@/components/Login';
import Register from '@/components/Register';
import { useFlowContext } from '@/context/FlowContext';

const AuthFile = () => {
    const { checkLogin } = useFlowContext();
    return (
        <>
            <div>
                {
                    checkLogin ?
                        <Login /> :
                        <Register />
                }
            </div>




        </>
    );
};

export default AuthFile;