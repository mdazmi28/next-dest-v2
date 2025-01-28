import React from 'react';

const Card = ({ type, noOfContact }) => {
    return (
        <div className="card bg-[#4480A6] text-neutral-content w-48 md:w-80">
            <div className="card-body items-center text-center">
                <h2 className="text-4xl">{type}</h2>
                <p className='text-sm md:text-2xl'>Total Contact: {noOfContact}</p>
            </div>
        </div>
    );
};

export default Card;