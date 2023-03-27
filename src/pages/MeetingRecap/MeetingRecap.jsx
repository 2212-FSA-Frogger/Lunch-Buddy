import React from 'react';
import FormButton from '../../components/FormButton';

// Import items to be able to pull and dispatch user and meeting data

const MeetingRecap = () => {
  return (
    <div className="h-screen w-screen orange-linear-bg lg:bg-white flex overflow-hidden">
      <div className="flex flex-col items-center w-11/12 max-w-lg mx-auto mt-20 lg:w-1/2">
        <h1 className="text-headers text-2xl mb-8">Meeting Recap</h1>
        <div className="text-center flex flex-col gap-1">
          <img src="" alt="Buddy profile picture" />
          <h2 className="text-xl">Buddy Name</h2>
          <p className="text-sm">Time goes here</p>
          <h3>Restaurant here</h3>
          <p className="text-sm">Address here</p>
        </div>
        <div className="w-2/3">
          {/* Pass in on click handler to confirm meeting */}
          <FormButton>Let's Go</FormButton>
        </div>
      </div>
      <img
        src="/src/assets/bgImg/meetingConfView.jpg"
        alt="Group of friends cheerings champagne glasses"
        className="w-1/2 h-full hidden lg:block object-cover"
      />
    </div>
  );
};

export default MeetingRecap;
